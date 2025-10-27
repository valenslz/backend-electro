const jwt = require("jsonwebtoken");
const ENV = require("../config/ENV");
const { identificarSesion } = require("./session.middleware"); // Lo importamos aquí

// --- 1. FUNCIÓN DE AUTENTICACIÓN ESTRICTA (Para rutas que REQUIEREN login) ---
function autenticar(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({ error: "Token no proporcionado" });
    }
    // ... (El resto de tu código de autenticar se mantiene igual)
    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, ENV.JWT_SECRET);

        req.clienteId = decoded.id; // Asignamos el ID del cliente autenticado
        req.usuario = {
            id: decoded.id,
            email: decoded.email,
            rol: decoded.rol, 
        };
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}

// --- 2. FUNCIÓN DE AUTENTICACIÓN OPCIONAL (Para rutas de Carrito) ---
function obtenerIdentidad(req, res, next) {
    // 1. Asignar ID de invitado (sessionId)
    identificarSesion(req, res, () => {
        
        // 2. Intentar autenticar al usuario (si falla, no pasa nada)
        const authHeader = req.headers["authorization"];
        
        if (authHeader) {
            const token = authHeader.split(" ")[1];
            try {
                const decoded = jwt.verify(token, ENV.JWT_SECRET);
                
                // Si el token es válido, establecemos el ID del cliente
                req.clienteId = decoded.id;
            } catch (error) {
                // Si el token existe pero es inválido/expirado,
                // simplemente lo tratamos como invitado y el carrito usará req.sessionId.
                console.log("Token inválido para carrito. Usuario tratado como invitado.");
            }
        }
        
        // 3. Asignar la identidad principal para el controlador del carrito
        // Prioridad: Cliente autenticado (req.clienteId) > Sesión de invitado (req.sessionId)
        req.userId = req.clienteId || req.sessionId; 
        
        // 4. Continuar al controlador
        next();
    });
}

function isAdmin(req, res, next) {
    try {
        // Asume que req.usuario ya fue establecido por autenticar
        if (req.usuario && req.usuario.rol === "admin") {
            return next();
        }
        return res.status(403).json({ error: "Acceso denegado: no eres admin" });
    } catch (error) {
        return res.status(500).json({ error: "Error en validación de admin" });
    }
}
module.exports = { autenticar, isAdmin, obtenerIdentidad }; 
