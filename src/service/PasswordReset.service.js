const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const pool = require('../config/bd');
const crypto = require('crypto');

class PasswordResetService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Generar token único
    generarToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Calcular expiración (1 hora)
    calcularExpiracion() {
        const expiracion = new Date();
        expiracion.setHours(expiracion.getHours() + 1);
        return expiracion;
    }

    // Solicitar recuperación
    async solicitarRecuperacion(email) {
        try {
            console.log("🔍 Buscando usuario con email:", email);
            
            // Verificar si el usuario existe
            const usuarioResult = await pool.query(
                'SELECT id, correo, nombre FROM usuarios WHERE correo = $1',
                [email]
            );

            if (usuarioResult.rows.length === 0) {
                console.log("❌ Usuario no encontrado");
                throw new Error("No existe una cuenta con este correo electrónico");
            }

            const usuario = usuarioResult.rows[0];
            console.log("✅ Usuario encontrado:", usuario.nombre);

            // Generar token y expiración
            const token = this.generarToken();
            const expiracion = this.calcularExpiracion();

            // Guardar token en la base de datos
            await pool.query(
                `UPDATE usuarios 
                 SET token_reset_password = $1, token_expiracion = $2 
                 WHERE id = $3`,
                [token, expiracion, usuario.id]
            );

            console.log("✅ Token guardado en BD para usuario:", usuario.id);

            // Enviar email
            await this.enviarEmailRecuperacion(usuario.correo, usuario.nombre, token);
            
            console.log("✅ Email de recuperación enviado a:", usuario.correo);

            return {
                exito: true,
                mensaje: "Se ha enviado un enlace de recuperación a tu correo electrónico"
            };

        } catch (error) {
            console.error("❌ Error en solicitud de recuperación:", error);
            throw new Error(error.message);
        }
    }

    // Verificar token
    async verificarToken(token) {
        try {
            console.log("🔍 Verificando token:", token);
            
            const result = await pool.query(
                `SELECT id, correo, nombre, token_expiracion 
                 FROM usuarios 
                 WHERE token_reset_password = $1`,
                [token]
            );

            if (result.rows.length === 0) {
                throw new Error("Token inválido o expirado");
            }

            const usuario = result.rows[0];

            // Verificar expiración
            if (new Date() > new Date(usuario.token_expiracion)) {
                await this.limpiarToken(usuario.id);
                throw new Error("El enlace de recuperación ha expirado");
            }

            console.log("✅ Token válido para usuario:", usuario.nombre);
            return {
                valido: true,
                usuarioId: usuario.id,
                email: usuario.correo,
                nombre: usuario.nombre
            };

        } catch (error) {
            console.error("❌ Error verificando token:", error);
            throw new Error(error.message);
        }
    }

    // Restablecer contraseña
    async restablecerPassword(token, nuevaPassword) {
        try {
            console.log("🔄 Restableciendo contraseña...");

            // Verificar token primero
            const tokenValido = await this.verificarToken(token);
            if (!tokenValido.valido) {
                throw new Error("Token inválido");
            }

            // Validar nueva contraseña
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
            if (!passwordRegex.test(nuevaPassword)) {
                throw new Error("La contraseña debe tener mínimo 8 caracteres, incluyendo al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo (!@#$%^&*).");
            }

            // Hashear nueva contraseña
            const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

            // Actualizar contraseña y limpiar token
            await pool.query(
                `UPDATE usuarios 
                 SET contraseña = $1, token_reset_password = NULL, token_expiracion = NULL 
                 WHERE id = $2`,
                [hashedPassword, tokenValido.usuarioId]
            );

            console.log("✅ Contraseña actualizada para usuario:", tokenValido.usuarioId);

            return {
                exito: true,
                mensaje: "Contraseña restablecida exitosamente"
            };

        } catch (error) {
            console.error("❌ Error restableciendo contraseña:", error);
            throw new Error(error.message);
        }
    }

    // Limpiar token
    async limpiarToken(usuarioId) {
        await pool.query(
            `UPDATE usuarios 
             SET token_reset_password = NULL, token_expiracion = NULL 
             WHERE id = $1`,
            [usuarioId]
        );
    }

    // Enviar email de recuperación
    async enviarEmailRecuperacion(emailDestino, nombreUsuario, token) {
        try {
            const resetLink = `http://localhost:5173/restablecer-password?token=${token}`;
            
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: emailDestino,
                subject: '🔐 Restablecer Contraseña - ElectroMarket',
                html: this.generarTemplateEmailRecuperacion(nombreUsuario, resetLink)
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email de recuperación enviado a ${emailDestino}`);
            
        } catch (error) {
            console.error('❌ Error enviando email de recuperación:', error);
            throw new Error('No se pudo enviar el email de recuperación');
        }
    }

    generarTemplateEmailRecuperacion(nombre, resetLink) {
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px;">ElectroMarket</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tu tienda de tecnología IoT</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
                <h2 style="color: #333; margin-bottom: 20px;">Hola ${nombre},</h2>
                <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                    Has solicitado restablecer tu contraseña en ElectroMarket. 
                    Haz clic en el botón siguiente para crear una nueva contraseña:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" 
                       style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                       Restablecer Contraseña
                    </a>
                </div>
                
                <p style="color: #d9534f; font-weight: bold; margin-bottom: 15px;">
                    ⚠️ Este enlace expirará en 1 hora.
                </p>
                
                <p style="color: #999; font-size: 14px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                    Si no solicitaste este cambio, por favor ignora este mensaje.<br>
                    <strong>Equipo ElectroMarket</strong>
                </p>
            </div>
            
            <div style="background: #343a40; padding: 20px; text-align: center; color: white;">
                <p style="margin: 0; font-size: 14px;">
                    © 2024 ElectroMarket. Todos los derechos reservados.
                </p>
            </div>
        </div>
        `;
    }
}

module.exports = PasswordResetService;