// /middleware/session.middleware.js (Versión corregida)

// Ya no necesitamos 'uuid' aquí, el frontend lo genera.
// const { v4: uuidv4 } = require('uuid'); 

const identificarSesion = (req, res, next) => {
    // 1. Intentamos leer el Session-ID del header 'session-id' 
    //    que el frontend (usando localStorage) debe enviar.
    let sessionId = req.headers['session-id']; 
    
    // 2. Si no se envía en el header, comprobamos en las cookies (por si acaso, aunque
    //    ya no lo usaremos activamente, es bueno como fallback temporal).
    if (!sessionId) {
        sessionId = req.cookies.sessionId;
    }

    // 🚨 CAMBIO CLAVE: Eliminamos todo el bloque 'if (!sessionId) { ... }'
    // El backend NO debe crear el token de invitado; solo lo lee si existe.

    // 3. Asignamos el ID de sesión (existente o nulo) a la solicitud.
    req.sessionId = sessionId || null;
    
    // 4. Continuamos al siguiente middleware (obtenerIdentidad)
    next();
};

module.exports = { identificarSesion };