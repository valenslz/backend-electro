const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'electromarket418@gmail.com',
                pass: 'tnbkmotcgywxhbel'
            }
        });
    }

    async verificarConexion() {
        try {
            await this.transporter.verify();
            console.log('✅ Servicio de correo configurado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error en configuración de correo:', error.message);
            return false;
        }
    }

    static generarCodigoVerificacion() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async enviarCodigoVerificacion(emailDestino, nombreUsuario, codigo) {
        try {
            console.log(`📧 Enviando código a: ${emailDestino}`);
            
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: emailDestino,
                subject: '🔐 Código de Verificación - ElectroMarket',
                html: this.generarTemplateEmail(nombreUsuario, codigo)
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Código ${codigo} enviado a ${emailDestino}`);
            return true;
            
        } catch (error) {
            console.error('❌ Error enviando correo:', error.message);
            throw new Error('No se pudo enviar el código de verificación. Intenta nuevamente.');
        }
    }

    generarTemplateEmail(nombre, codigo) {
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px;">ElectroMarket</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tu tienda de tecnología IoT</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
                <h2 style="color: #333; margin-bottom: 20px;">Hola ${nombre},</h2>
                <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                    Para completar tu inicio de sesión en ElectroMarket, por favor ingresa el siguiente código de verificación:
                </p>
                
                <div style="background: white; border: 2px dashed #667eea; padding: 25px; text-align: center; margin: 25px 0; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="font-size: 42px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${codigo}
                    </div>
                </div>
                
                <p style="color: #d9534f; font-weight: bold; margin-bottom: 15px;">
                    ⚠️ Este código expirará en 10 minutos.
                </p>
                
                <p style="color: #999; font-size: 14px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                    Si no solicitaste este código, por favor ignora este mensaje.<br>
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

module.exports = EmailService;