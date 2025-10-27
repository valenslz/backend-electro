const PasswordResetService = require("../service/PasswordReset.service");

class PasswordResetController {
    static async solicitarRecuperacion(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ 
                    error: "El correo electrónico es requerido" 
                });
            }

            const passwordResetService = new PasswordResetService();
            const resultado = await passwordResetService.solicitarRecuperacion(email);
            
            res.json(resultado);

        } catch (error) {
            console.error("❌ Error en solicitud de recuperación:", error);
            res.status(400).json({ 
                error: error.message 
            });
        }
    }

    static async verificarToken(req, res) {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({ 
                    error: "Token requerido" 
                });
            }

            const passwordResetService = new PasswordResetService();
            const resultado = await passwordResetService.verificarToken(token);
            
            res.json(resultado);

        } catch (error) {
            console.error("❌ Error verificando token:", error);
            res.status(400).json({ 
                error: error.message 
            });
        }
    }

    static async restablecerPassword(req, res) {
        try {
            const { token, nuevaPassword } = req.body;

            if (!token || !nuevaPassword) {
                return res.status(400).json({ 
                    error: "Token y nueva contraseña son requeridos" 
                });
            }

            const passwordResetService = new PasswordResetService();
            const resultado = await passwordResetService.restablecerPassword(token, nuevaPassword);
            
            res.json(resultado);

        } catch (error) {
            console.error("❌ Error restableciendo contraseña:", error);
            res.status(400).json({ 
                error: error.message 
            });
        }
    }
}

module.exports = PasswordResetController;