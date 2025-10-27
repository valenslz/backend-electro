const AuthService = require("../service/Auth.service");

class VerificacionController {
    static async verificarCodigo(req, res) {
        try {
            const { usuarioId, codigo } = req.body;
            const guestToken = req.headers['session-id'];

            console.log("🎯 [VERIFICACION CONTROLLER] === INICIANDO VERIFICACIÓN ===");
            console.log("👤 Usuario ID:", usuarioId);
            console.log("🔢 Código:", codigo);

            if (!usuarioId || !codigo ) {
                return res.status(400).json({ 
                    error: "Usuario ID , código y  son requeridos" 
                });
            }

            const authService = new AuthService();
            const resultado = await authService.verificarCodigo(usuarioId, codigo, guestToken);
            
            console.log("✅ [VERIFICACION CONTROLLER] === RESULTADO DEL SERVICIO ===");
            console.log("📦 Message:", resultado.message);
            console.log("📦 Token:", resultado.token ? "PRESENTE" : "AUSENTE");
            console.log("📦 Usuario:", resultado.usuario ? "PRESENTE" : "AUSENTE");
            console.log("📦 Datos completos:", JSON.stringify(resultado, null, 2));

            // ✅ Asegurarnos de enviar la respuesta correctamente
            res.json(resultado);

        } catch (error) {
            console.error("❌ [VERIFICACION CONTROLLER] === ERROR ===");
            console.error("💥 Error:", error.message);
            res.status(400).json({
                error: error.message
            });
        }
    }

    static async reenviarCodigo(req, res) {
        try {
            const { usuarioId } = req.body;

            if (!usuarioId) {
                return res.status(400).json({ 
                    error: "Usuario ID es requerido" 
                });
            }

            const authService = new AuthService();
            const resultado = await authService.reenviarCodigoVerificacion(usuarioId);
            
            res.json({
                exito: true,
                mensaje: resultado.mensaje
            });

        } catch (error) {
            res.status(400).json({
                error: error.message
            });
        }
    }
}

module.exports = VerificacionController;