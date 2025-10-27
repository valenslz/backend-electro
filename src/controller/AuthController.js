const AuthService = require("../service/Auth.service");

class AuthController {
    static async registrar(req, res) {
        try {
            const { nombre, email, password, direccion, telefono, rol } = req.body;

            if (!nombre || !email || !password) {
                return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios" });
            }

            const authService = new AuthService();
            const nuevoUsuario = await authService.registrar({
                nombre, email, password, direccion, telefono, rol: rol || "cliente"
            });

            res.status(201).json({
                message: "Usuario registrado exitosamente",
                usuario: nuevoUsuario
            });

        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const guestToken = req.headers['session-id'];

            if (!email || !password) {
                return res.status(400).json({ error: "Email y contraseña son obligatorios" });
            }

            console.log("🎯 [AUTH CONTROLLER] Iniciando login...");
            
            const authService = new AuthService();
            const resultado = await authService.login(email, password, guestToken);

            console.log("📨 [AUTH CONTROLLER] Resultado del servicio:", resultado);

            // ✅ ENVIAR RESPUESTA CORRECTAMENTE SEGÚN EL TIPO DE RESULTADO
            if (resultado.requiereVerificacion) {
                console.log("🔄 [AUTH CONTROLLER] Enviando respuesta de VERIFICACIÓN REQUERIDA");
                res.json({
                    requiereVerificacion: true,
                    mensaje: resultado.mensaje,
                    usuarioId: resultado.usuarioId,
                    email: resultado.email
                });
            } else {
                console.log("🎉 [AUTH CONTROLLER] Enviando respuesta de LOGIN EXITOSO");
                res.json({
                    message: "Login exitoso",
                    token: resultado.token,
                    usuario: resultado.usuario
                });
            }

        } catch (error) {
            console.error("❌ [AUTH CONTROLLER] Error en login:", error.message);
            res.status(401).json({ error: error.message });
        }
    }

    static verificarToken(req, res) {
        try {
            const authHeader = req.headers["authorization"];
            if (!authHeader) {
                return res.status(401).json({ error: "Token no proporcionado" });
            }

            const token = authHeader.split(" ")[1];
            if (!token) {
                return res.status(401).json({ error: "Formato de token inválido" });
            }

            const authService = new AuthService();
            const decoded = authService.verificarToken(token);
            
            res.json({
                message: "Token válido",
                usuario: {
                    id: decoded.id,
                    email: decoded.email,
                    nombre: decoded.nombre,
                    rol: decoded.rol
                }
            });

        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    // Método adicional para debug - obtener todos los clientes
    static async obtenerClientes(req, res) {
        try {
            const authService = new AuthService();
            const clientes = await authService.obtenerTodosLosClientes();
            res.json({ clientes });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async obtenerAdministradores(req, res) {
        try {
            const authService = new AuthService();
            const administradores = await authService.obtenerTodosLosAdministradores();
            res.json({ admin: administradores });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = AuthController;