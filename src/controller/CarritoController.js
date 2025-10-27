// /controllers/CarritoController.js (COMPLETO)
const CarritoService = require("../service/Carrito.service"); // Nuevo servicio

class CarritoController {
    
    // ✅ Agregar producto (El que ya tienes)
    static async agregarProducto(req, res) {
        const { clienteId: userId, sessionId: guestToken } = req; 
        const { productoId, cantidad } = req.body;

        try {
            if (!userId && !guestToken) {
                return res.status(400).json({ error: "No se pudo identificar al cliente o invitado." });
            }

            const resultadoAgregado = await CarritoService.agregarItem(userId, guestToken, productoId, cantidad);
            if (resultadoAgregado.limiteAlcanzado) {
            // Devolver la respuesta al frontend. Usamos 200 OK porque la validación
            // fue controlada y la respuesta es el objeto que el frontend espera.
            console.log("⚠️ Límite de stock alcanzado al agregar producto:", resultadoAgregado);
            return res.json(resultadoAgregado); 
        }
            const carritoActualizado = await CarritoService.obtenerCarrito(userId, guestToken);
            
            return res.json({ 
                message: "Producto agregado al carrito con éxito.", 
                ...carritoActualizado
            });
            
        } catch (error) {
            console.error(error);
            return res.status(400).json({ error: error.message || 'Error al agregar producto.' });
        }
    }

    // ✅ Obtener carrito completo (El que ya tienes)
    static async obtenerCarrito(req, res) {
        const { clienteId: userId, sessionId: guestToken } = req;

        try {
            if (!userId && !guestToken) {
                return res.status(400).json({ error: "No se pudo identificar al cliente o invitado." });
            }

            const carrito = await CarritoService.obtenerCarrito(userId, guestToken);
            return res.json(carrito);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al obtener el carrito.' });
        }
    }
    
    // 🆕 Eliminar producto del carrito
    static async eliminarProducto(req, res) {
        const { clienteId: userId, sessionId: guestToken } = req;
        // Asumo que el productoId viene de los parámetros de la URL (ej: DELETE /carrito/:productoId)
        const productoId = req.params.productoId; 

        try {
            if (!userId && !guestToken) {
                return res.status(400).json({ error: "No se pudo identificar al cliente o invitado." });
            }

            await CarritoService.eliminarItem(userId, guestToken, productoId);

            const carritoActualizado = await CarritoService.obtenerCarrito(userId, guestToken);
            
            return res.json({ 
                message: "Producto eliminado del carrito.", 
                ...carritoActualizado
            });

        } catch (error) {
            console.error(error);
            return res.status(400).json({ error: error.message || 'Error al eliminar producto.' });
        }
    }

    // 🆕 Actualizar cantidad de un producto
    static async actualizarCantidad(req, res) {
        const { clienteId: userId, sessionId: guestToken } = req;
        // Asumo que productoId viene de la URL y la nueva cantidad del cuerpo
        const productoId = req.params.productoId; 
        const { cantidad } = req.body;

        // Validación básica: la cantidad debe ser válida
        if (typeof cantidad !== 'number' || cantidad < 0) {
            return res.status(400).json({ error: "La cantidad debe ser un número positivo." });
        }

        try {
            if (!userId && !guestToken) {
                return res.status(400).json({ error: "No se pudo identificar al cliente o invitado." });
            }

            await CarritoService.actualizarItemCantidad(userId, guestToken, productoId, cantidad);

            const carritoActualizado = await CarritoService.obtenerCarrito(userId, guestToken);
            
            return res.json({ 
                message: "Cantidad de producto actualizada.", 
                ...carritoActualizado
            });

        } catch (error) {
            console.error(error);
            return res.status(400).json({ error: error.message || 'Error al actualizar cantidad.' });
        }
    }
}

module.exports = CarritoController;