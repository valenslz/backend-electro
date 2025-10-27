const CrearA = require("./CrearA");

class FabricaProducto {
    constructor() {
        if (!FabricaProducto.productos) {
            FabricaProducto.productos = new Map();
        }
        if (!FabricaProducto.productosCreados) {
            FabricaProducto.productosCreados = new Map();
        }
        if (!FabricaProducto.contadorProductos) {
            FabricaProducto.contadorProductos = 0;
        }
        if (!FabricaProducto.productosEliminados) {
            FabricaProducto.productosEliminados = new Map();
        }
    }

    crearProducto(tipo, datos) {
        let fabricaConcreta;

        if (tipo === "arduino") {
            fabricaConcreta = new CrearA();
        } else {
            throw new Error("Tipo de producto no válido");
        }

        const producto = fabricaConcreta.crearProducto(datos);

        // Registrar en los contadores
        this.registrarProducto(producto);

        // Guardar el producto por ID
        FabricaProducto.productos.set(producto.id, producto);

        return producto;
    }

    registrarProducto(producto) {
        FabricaProducto.contadorProductos++;
        const tipo = producto.constructor.name;
        const count = FabricaProducto.productosCreados.get(tipo) || 0;
        FabricaProducto.productosCreados.set(tipo, count + 1);
        return true;
    }

    getTotalProductosCreados() {
        return FabricaProducto.contadorProductos;
    }

    getProductosPorTipo() {
        return Object.fromEntries(FabricaProducto.productosCreados);
    }

    eliminarProducto(id) {
        if (FabricaProducto.productos.has(id)) {
            const eliminado = FabricaProducto.productos.get(id);

            // Guardamos el eliminado en un registro separado
            FabricaProducto.productosEliminados.set(id, eliminado);
            FabricaProducto.productos.delete(id);
            FabricaProducto.contadorProductos--;
            return { exito: true, mensaje: `Producto con ID ${id} eliminado correctamente` };
        }
        return { exito: false, mensaje: `Producto con ID ${id} no encontrado` };
    }

    obtenerProductosEliminados() {
        return Array.from(FabricaProducto.productosEliminados.values());
    }

     obtenerProductos() {
        return Array.from(FabricaProducto.productos.values());
    }
}

module.exports = FabricaProducto;
