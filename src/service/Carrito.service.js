const pool = require('../config/bd'); // Asumiendo que este pool ya es de mysql2/promise

class CarritoService {

    /**
     * Busca el carrito ACTIVO existente o crea uno nuevo de forma segura (maneja concurrencia).
     */
    static async getOrCreateActiveCartId(userId, guestToken) {
        const identificationField = userId ? 'usuario_id' : 'token_invitado';
        const identificationValue = userId || guestToken;
        console.log("tokern invitado en getOrCreateActiveCartId:", guestToken);
        console.log("tokern usuario en getOrCreateActiveCartId:", userId);
        if (!identificationValue) {
            throw new Error("Se requiere usuario o token de invitado para gestionar el carrito.");
        }

        // 1. Intentar buscar el carrito ACTIVO (PG: $1 -> MySQL: ?)
        const searchQuery = `
            SELECT id_carrito 
            FROM carritos 
            WHERE ${identificationField} = ? AND estado = 'ACTIVO' 
            ORDER BY fecha_actualizacion DESC 
            LIMIT 1;
        `;
        const [rows] = await pool.query(searchQuery, [identificationValue]); // MySQL2 returns [rows, fields]

        if (rows.length > 0) {
            // Encontrado (el más reciente o el único)
            return rows[0].id_carrito;
        } 
        
        // 2. Si no se encontró, intentar crear uno nuevo (PG: RETURNING -> MySQL: insertId)
        try {
            const createQuery = `
                INSERT INTO carritos (usuario_id, token_invitado, estado) 
                VALUES (?, ?, 'ACTIVO');
            `;
            const [newCartRes] = await pool.query(createQuery, [userId || null, guestToken || null]);
            // MySQL2 pool proporciona insertId para INSERT statements
            return newCartRes.insertId;

        } catch (error) {
            // 3. Manejo de error de CONCURRENCIA (PG: '23505' -> MySQL: 1062 / 'ER_DUP_ENTRY')
            if (error.errno === 1062 || error.code === 'ER_DUP_ENTRY') { 
                console.log("Advertencia: Intento de crear carrito duplicado detectado. Volviendo a buscar el existente.");
                
                // Re-ejecutar la búsqueda para obtener el carrito que fue creado concurrentemente
                const [finalRes] = await pool.query(searchQuery, [identificationValue]);
                
                if (finalRes.length > 0) {
                    return finalRes[0].id_carrito;
                } else {
                    throw new Error("Fallo al crear y luego re-obtener el carrito activo.");
                }
            }
            throw error;
        }
    }

    /**
     * Agrega un producto al carrito (hace UPSERT en carrito_items).
     */
    static async agregarItem(userId, guestToken, productoId, cantidad) {
        // ... (Tu código de logs y obtener carritoId)
        const carritoId = await this.getOrCreateActiveCartId(userId, guestToken);

        // 1. Obtener precio, stock, Y cantidad actual en el carrito (para ese producto) (PG: $1, $2 -> MySQL: ?, ?)
        const [productoResult, itemActualResult] = await Promise.all([
            pool.query("SELECT precio, stock FROM productos WHERE id = ?", [productoId]),
            pool.query("SELECT cantidad FROM carrito_items WHERE carrito_id = ? AND producto_id = ?", [carritoId, productoId])
        ]);
        
        const productoRows = productoResult[0]; // Desestructurar el array [rows, fields]
        const itemActualRows = itemActualResult[0];

        if (productoRows.length === 0) {
            throw new Error("Producto no encontrado");
        }

        const { precio, stock } = productoRows[0];
        const cantidadActualEnCarrito = itemActualRows.length > 0 ? itemActualRows[0].cantidad : 0;
        
        // 🚨 LÓGICA DE VALIDACIÓN DE STOCK
        const nuevaCantidadTotal = cantidadActualEnCarrito + cantidad;
        
        if (nuevaCantidadTotal > stock) {
            console.log("❌ Intento de agregar más unidades que el stock disponible:")
            // Enviar un error específico con la cantidad máxima permitida
            return ({
                limiteAlcanzado: true,
                mensaje: `No se puede agregar ${cantidad} unidades. Solo quedan ${stock - cantidadActualEnCarrito} unidades disponibles en stock.`,
                carritoId,
                
            });
        }
        
        // 2. Insertar/Actualizar el ítem (UPSERT) (PG: ON CONFLICT DO UPDATE -> MySQL: ON DUPLICATE KEY UPDATE)
        // Se asume que (carrito_id, producto_id) es una clave única/primaria para que funcione ON DUPLICATE KEY UPDATE.
        const [resultado] = await pool.query(
            `INSERT INTO carrito_items (carrito_id, producto_id, cantidad, precio_unitario, fecha_actualizacion)
            VALUES (?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
                cantidad = cantidad + VALUES(cantidad),
                fecha_actualizacion = NOW()`,
            [carritoId, productoId, cantidad, precio]
        );
        
        // En MySQL, el ID del item no se retorna fácilmente en un UPSERT, pero podemos usar el ID del carrito para la respuesta
        console.log("Item agregado/actualizado en carrito:", { carritoId, affectedRows: resultado.affectedRows });
        return { carritoId, affectedRows: resultado.affectedRows };
    }

    /**
     * Elimina una línea de producto del carrito.
     */
    static async eliminarItem(userId, guestToken, productoId) {
        const carritoId = await this.getOrCreateActiveCartId(userId, guestToken);
        
        // PG: $1, $2 -> MySQL: ?, ?
        const [resultado] = await pool.query(
            "DELETE FROM carrito_items WHERE carrito_id = ? AND producto_id = ?",
            [carritoId, productoId]
        );
        
        if (resultado.affectedRows > 0) {
             // Actualizar el timestamp del carrito principal si se modificó
             await pool.query("UPDATE carritos SET fecha_actualizacion = NOW() WHERE id_carrito = ?", [carritoId]);
        }
    }

    /**
     * Actualiza la cantidad de un producto en el carrito.
     */
    static async actualizarItemCantidad(userId, guestToken, productoId, nuevaCantidad) {
        if (nuevaCantidad === 0) {
            // Si la cantidad es 0, es mejor eliminar el ítem.
            return this.eliminarItem(userId, guestToken, productoId);
        }
        
        const carritoId = await this.getOrCreateActiveCartId(userId, guestToken);
        
        // El precio_unitario NO se actualiza aquí, solo la cantidad. (PG: $1, $2, $3 -> MySQL: ?, ?, ?)
        const [resultado] = await pool.query(
            `UPDATE carrito_items 
             SET cantidad = ?, fecha_actualizacion = NOW()
             WHERE carrito_id = ? AND producto_id = ?`,
            [nuevaCantidad, carritoId, productoId]
        );

        if (resultado.affectedRows === 0) {
             // 🚨 Este es el error que buscábamos corregir con la lógica de ID
             throw new Error("El producto no existe en el carrito.");
        }
        
        // Actualizar el timestamp del carrito principal
        await pool.query("UPDATE carritos SET fecha_actualizacion = NOW() WHERE id_carrito = ?", [carritoId]);
    }


    /**
     * Obtiene el contenido detallado del carrito.
     */
    static async obtenerCarrito(userId, guestToken) {
        const carritoId = await this.getOrCreateActiveCartId(userId, guestToken);

        // PG: $1 -> MySQL: ?
        const consulta = `
            SELECT
                ci.producto_id AS id,
                p.nombre,
                p.imagen_url,
                ci.cantidad,
                ci.precio_unitario,
                (ci.cantidad * ci.precio_unitario) AS subtotal
            FROM
                carrito_items ci
            JOIN
                productos p ON ci.producto_id = p.id
            WHERE
                ci.carrito_id = ?;
        `;
        const [items] = await pool.query(consulta, [carritoId]);

        // Cálculo del total
        // Los valores de MySQL pueden ser strings, usar parseFloat es buena práctica
        const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

        return {
            carritoId,
            items: items,
            total: total.toFixed(2)
        };
    }
    
    /**
     * Consolida el carrito de invitado (guestToken) al carrito ACTIVO del usuario (userId).
     * Mueve los items del carrito de invitado al carrito de usuario y elimina el de invitado.
     */
    static async consolidarCarrito(userId, guestToken) {
        if (!userId || !guestToken) return;
        
        console.log(`[CARRITO] Iniciando consolidación: Guest ${guestToken} -> User ${userId}`);

        // PG: pool.connect() -> MySQL: pool.getConnection()
        const connection = await pool.getConnection(); 
        try {
            // PG: await client.query('BEGIN') -> MySQL: await connection.beginTransaction()
            await connection.beginTransaction(); 

            // 1. Obtener el ID del carrito del INVITADO (PG: $1 -> MySQL: ?)
            const [guestCartRes] = await connection.query(
                "SELECT id_carrito FROM carritos WHERE token_invitado = ? AND estado = 'ACTIVO'",
                [guestToken]
            );

            if (guestCartRes.length === 0) {
                console.log("[CARRITO] No hay carrito de invitado activo para consolidar.");
                await connection.commit(); // No hay nada que hacer, confirmamos
                return; 
            }
            
            const guestCartId = guestCartRes[0].id_carrito;

            // 2. Obtener/Crear el ID del carrito ACTIVO del USUARIO (PG: $1 -> MySQL: ?)
            let [userCartRes] = await connection.query(
                "SELECT id_carrito FROM carritos WHERE usuario_id = ? AND estado = 'ACTIVO'",
                [userId]
            );

            let userCartId;
            if (userCartRes.length === 0) {
                // Si el usuario NO tiene un carrito activo, usamos el carrito de invitado
                userCartId = guestCartId;
                
                // Transferimos el carrito de invitado al usuario (PG: $1, $2 -> MySQL: ?, ?)
                await connection.query(
                    `UPDATE carritos 
                     SET usuario_id = ?, token_invitado = NULL, fecha_actualizacion = NOW()
                     WHERE id_carrito = ?`,
                    [userId, userCartId]
                );
                console.log(`[CARRITO] Carrito ${guestCartId} transferido al usuario ${userId}.`);

            } else {
                // Si el usuario SÍ tiene un carrito activo, FUSIONAMOS (el escenario más complejo)
                userCartId = userCartRes[0].id_carrito;
                
                // Mover/Fusionar ítems del carrito invitado al carrito del usuario
                // PG: ON CONFLICT DO UPDATE -> MySQL: ON DUPLICATE KEY UPDATE
                await connection.query(
                    `INSERT INTO carrito_items (carrito_id, producto_id, cantidad, precio_unitario, fecha_actualizacion)
                     SELECT ?, producto_id, cantidad, precio_unitario, NOW()
                     FROM carrito_items 
                     WHERE carrito_id = ?
                     ON DUPLICATE KEY UPDATE
                         cantidad = carrito_items.cantidad + VALUES(cantidad),
                         fecha_actualizacion = NOW()`,
                    [userCartId, guestCartId]
                );

                // Eliminar todos los ítems del carrito de invitado (PG: $1 -> MySQL: ?)
                await connection.query("DELETE FROM carrito_items WHERE carrito_id = ?", [guestCartId]);
                
                // Eliminar el carrito de invitado (que ahora está vacío) (PG: $1 -> MySQL: ?)
                await connection.query("DELETE FROM carritos WHERE id_carrito = ?", [guestCartId]);
                
                // Actualizar el timestamp del carrito del usuario (PG: $1 -> MySQL: ?)
                await connection.query("UPDATE carritos SET fecha_actualizacion = NOW() WHERE id_carrito = ?", [userCartId]);

                console.log(`[CARRITO] Carrito ${guestCartId} fusionado y eliminado. Los ítems se movieron a ${userCartId}.`);
            }

            // PG: await client.query('COMMIT') -> MySQL: await connection.commit()
            await connection.commit(); 
            return { exito: true, userCartId };

        } catch (error) {
            // PG: await client.query('ROLLBACK') -> MySQL: await connection.rollback()
            await connection.rollback(); 
            console.error("[CARRITO] Error crítico en consolidación. ROLLBACK ejecutado:", error.message);
            throw new Error("Fallo al consolidar el carrito del invitado. Intente nuevamente.");
        } finally {
            // PG: client.release() -> MySQL: connection.release()
            connection.release(); 
        }
    }
}


module.exports = CarritoService;
