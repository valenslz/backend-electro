const jwt = require("jsonwebtoken");
const ENV = require("../config/ENV");
const Usuario = require("../models/Entidades/Usuario");
const SeguridadUsuario = require("../models/Entidades/SeguridadUsuario");
const EmailService = require("./Email.service");
const pool = require("../config/bd");
const CryptoJS = require("crypto-js");
const CarritoService = require("./Carrito.service");

class AuthService {
    static getEncryptionKey() {
        return 'electromarket-frontend-2024-secure-key';
    }

    static decryptPassword(encryptedPassword) {
        try {
            console.log("🔓 Intentando desencriptar:", encryptedPassword);
            
            if (!encryptedPassword.includes('U2FsdGVkX1')) {
                console.log("📝 Password no encriptado, usando tal cual");
                return encryptedPassword;
            }
            
            const bytes = CryptoJS.AES.decrypt(encryptedPassword, this.getEncryptionKey());
            const password = bytes.toString(CryptoJS.enc.Utf8);
            
            if (password) {
                console.log("✅ Password desencriptado correctamente");
                return password;
            } else {
                console.log("⚠️ No se pudo desencriptar, usando original");
                return encryptedPassword;
            }
        } catch (error) {
            console.log("❌ Error en desencriptación, usando original:", error.message);
            return encryptedPassword;
        }
    }

    async registrar(usuarioData) {
        const { nombre, email, password, direccion, telefono } = usuarioData;

        console.log("📝 Datos recibidos en registrar:", { nombre, email, direccion, telefono });

        let decryptedPassword = AuthService.decryptPassword(password);
        console.log("🔑 Password después de desencriptar:", decryptedPassword);

        if (!nombre || !email || !decryptedPassword) {
            throw new Error("Nombre, email y contraseña son obligatorios");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Formato de email inválido");
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
        if (!passwordRegex.test(decryptedPassword)) {
            throw new Error("La contraseña debe tener mínimo 8 caracteres, incluyendo al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo (!@#$%^&*).");
        }

        const usuarioExistente = await Usuario.buscarPorEmail(email);
        if (usuarioExistente) {
            throw new Error("El email ya está registrado");
        }

        const tipoUsuario = 'cliente';
        const usuario = await Usuario.crear({
            email,
            password: decryptedPassword,
            nombre,
            tipoUsuario
        });

        await pool.query(
            `INSERT INTO clientes (usuario_id, nombre_cliente, correo_cliente, direccion, telefono) 
            VALUES (?, ?, ?, ?, ?)`,
            [usuario.id, nombre, email, direccion || '', telefono || '']
        );
        
        return new Usuario(
            usuario.id,
            usuario.email,
            usuario.password,
            usuario.nombre,
            usuario.tipoUsuario
        );
    }

    async login(email, password, guestToken) {
        try {
            console.log("🔐 INICIANDO LOGIN ===================");
            console.log("📧 Email recibido:", email);
            console.log("🔑 Password recibido (crudo):", password);
            
            let decryptedPassword = AuthService.decryptPassword(password);
            console.log("🔓 Password después de desencriptar:", decryptedPassword);

            const usuario = await Usuario.buscarPorEmail(email);
            console.log(usuario);
            if(usuario.tipoUsuario == 'admin'){
                
            }
            console.log(usuario);
            const seguridad = await SeguridadUsuario.obtenerPorUsuarioId(usuario.id);
            if (seguridad.estaBloqueado()) {
                throw new Error("Cuenta bloqueada temporalmente. Intente en 30 minutos.");
            }

            console.log("🔍 Verificando contraseña...");
            const esValido = await usuario.verificarPassword(decryptedPassword);

            if (!esValido) {
                const intentos = await seguridad.registrarIntentoFallido();
                const restantes = seguridad.obtenerIntentosRestantes();
                
                if (restantes > 0) {
                    throw new Error(`Credenciales inválidas. Le quedan ${restantes} intentos.`);
                } else {
                    throw new Error("Cuenta bloqueada por múltiples intentos fallidos.");
                }
            }

            await seguridad.reiniciarIntentos();

            // ✅ FORZAR VERIFICACIÓN - ELIMINAR CUALQUIER VERIFICACIÓN PREVIA
            console.log("🔄 FORZANDO verificación de código...");
            
            await pool.query(
                'UPDATE usuarios SET email_verificado = false WHERE id = ?',
                [usuario.id]
            );

            const codigoVerificacion = EmailService.generarCodigoVerificacion();
            const expiracion = new Date();
            expiracion.setMinutes(expiracion.getMinutes() + 10);

            await pool.query(
                'UPDATE usuarios SET codigo_verificacion = ?, codigo_expiracion = ? WHERE id = ?',
                [codigoVerificacion, expiracion, usuario.id]
            );

            try {
                const emailService = new EmailService();
                await emailService.enviarCodigoVerificacion(
                    usuario.email, 
                    usuario.nombre, 
                    codigoVerificacion
                );

                console.log('📧 Código de verificación enviado a:', usuario.email);
                
                return { 
                    requiereVerificacion: true,
                    mensaje: "Se ha enviado un código de verificación a tu correo electrónico",
                    usuarioId: usuario.id,
                    email: usuario.email
                };
            } catch (emailError) {
                console.error('❌ Error enviando correo:', emailError);
                throw new Error("Error al enviar el código de verificación. Intenta nuevamente.");
            }
            
            if (!usuario) {
                console.log("❌ Usuario no encontrado");
                throw new Error("Credenciales inválidas");
            }     
        } catch (error) {
            console.error("💥 ERROR EN LOGIN:", error.message);
            throw new Error(error.message);
        }
    }

    async verificarCodigo(usuarioId, codigo, guestToken) {
        try {
            console.log("🔍 Verificando código para usuario:", usuarioId);
            console.log("🔢 Código recibido:", codigo);

            const [rows] = await pool.query(
                `SELECT codigo_verificacion, codigo_expiracion 
                FROM usuarios 
                WHERE id = ?`,
                [usuarioId]
            );

            if (rows.length === 0) {
                throw new Error("Usuario no encontrado");
            }

            const usuario = rows[0];
            console.log("📦 Código en BD:", usuario.codigo_verificacion);
            console.log("⏰ Expiración:", usuario.codigo_expiracion);

            if (!usuario.codigo_verificacion) {
                throw new Error("No hay código de verificación pendiente");
            }

            if (new Date() > new Date(usuario.codigo_expiracion)) {
                throw new Error("El código de verificación ha expirado");
            }

            if (usuario.codigo_verificacion !== codigo) {
                throw new Error("Código de verificación incorrecto");
            }

            await pool.query(
                `UPDATE usuarios 
                SET email_verificado = true, 
                    codigo_verificacion = NULL,
                    codigo_expiracion = NULL 
                WHERE id = ?`,
                [usuarioId]
            );

            console.log('✅ Email verificado para usuario:', usuarioId);
            if(guestToken) {
                console.log("🔗 Asociando carrito invitado al usuario...");
                await CarritoService.consolidarCarrito(usuarioId, guestToken);
            }else{
                console.log("ℹ️ No se proporcionó token de invitado, no se asocia carrito.");
            }

            const [usuarioData] = await pool.query(
                'SELECT * FROM usuarios WHERE id = ?',
                [usuarioId]
            );
            
            const usuarioCompleto = usuarioData[0];
            let usuarioInfo = await this.obtenerInfoUsuario(new Usuario(
                usuarioCompleto.id,
                usuarioCompleto.correo,
                usuarioCompleto.contraseña,
                usuarioCompleto.nombre,
                usuarioCompleto.tipo_usuario
            ));

            const token = jwt.sign(
                { 
                    id: usuarioCompleto.id, 
                    email: usuarioCompleto.correo, 
                    rol: usuarioCompleto.tipo_usuario,
                    nombre: usuarioCompleto.nombre
                }, 
                ENV.JWT_SECRET, 
                { expiresIn: "2h" }
            );

            return {
                message: "Email verificado exitosamente",
                token: token,
                usuario: usuarioInfo
            };

        } catch (error) {
            console.error("❌ Error verificando código:", error);
            throw new Error(error.message);
        }
    }

    async reenviarCodigoVerificacion(usuarioId) {
        try {
            console.log("🔄 Reenviando código para usuario:", usuarioId);
            
            const [usuarioRows] = await pool.query(
                'SELECT id, correo, nombre FROM usuarios WHERE id = ?',
                [usuarioId]
            );

            if (usuarioRows.length === 0) {
                throw new Error("Usuario no encontrado");
            }

            const usuario = usuarioRows[0];

            const codigoVerificacion = EmailService.generarCodigoVerificacion();
            const expiracion = new Date();
            expiracion.setMinutes(expiracion.getMinutes() + 10);

            await pool.query(
                'UPDATE usuarios SET codigo_verificacion = ?, codigo_expiracion = ? WHERE id = ?',
                [codigoVerificacion, expiracion, usuarioId]
            );

            const emailService = new EmailService();
            await emailService.enviarCodigoVerificacion(
                usuario.correo, 
                usuario.nombre, 
                codigoVerificacion
            );

            console.log('📧 Nuevo código enviado a:', usuario.correo);

            return { 
                exito: true, 
                mensaje: "Se ha enviado un nuevo código de verificación a tu correo" 
            };

        } catch (error) {
            console.error('❌ Error reenviando código:', error);
            throw new Error(error.message);
        }
    }

    async obtenerInfoUsuario(usuario) {
        let usuarioInfo;
        if (usuario.tipoUsuario === 'admin') {
            const [adminRows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [usuario.id]);
            const admin = adminRows[0];
            usuarioInfo = {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                direccion: admin?.direccion || '',
                telefono: admin?.telefono || '',
                tipo: 'admin'
            };
        } else {
            const [clienteRows] = await pool.query('SELECT * FROM clientes WHERE usuario_id = ?', [usuario.id]);
            const cliente = clienteRows[0];
            usuarioInfo = {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                direccion: cliente?.direccion || '',
                telefono: cliente?.telefono || '',
                tipo: 'cliente'
            };
        }
        return usuarioInfo;
    }

    verificarToken(token) {
        try {
            return jwt.verify(token, ENV.JWT_SECRET);
        } catch (error) {
            throw new Error("Token inválido o expirado");
        }
    }

    async obtenerTodosLosClientes() {
        try {
            const [rows] = await pool.query(`
                SELECT u.*, c.direccion, c.telefono 
                FROM usuarios u 
                JOIN clientes c ON u.id = c.usuario_id
            `);
            return rows.map(row => ({
                id: row.id,
                email: row.correo,
                nombre: row.nombre,
                direccion: row.direccion,
                telefono: row.telefono,
                tipo: 'cliente'
            }));
        } catch (error) {
            throw new Error('Error al obtener clientes: ' + error.message);
        }
    }

    async obtenerTodosLosAdministradores() {
        try {
            const [rows] = await pool.query(
                `SELECT * FROM usuarios WHERE correo = 'brayanama987@gmail.com' AND tipo_usuario='admin'`
            );
            return rows.map(row => ({
                id: row.id,
                email: row.correo,
                nombre: row.nombre,
                tipo: 'admin'
            }));
        } catch (error) {
            throw new Error('Error al obtener administradores: ' + error.message);
        }
    }
}

module.exports = AuthService;
