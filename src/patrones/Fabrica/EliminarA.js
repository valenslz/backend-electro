import { ProductoB } from '../entidades/ProductoB.js';

export class EliminarA {
    static productosEliminados = [];

    crearProducto(datos) {
        const producto = new ProductoB(datos);
        return producto;
    }

    eliminarProducto(id) {
        if (!EliminarA.productosEliminados.includes(id)) {
            EliminarA.productosEliminados.push(id);
            return true;
        }
        return false;
    }

    restaurarProducto(id) {
        const index = EliminarA.productosEliminados.indexOf(id);
        if (index !== -1) {
            EliminarA.productosEliminados.splice(index, 1);
            return true;
        }
        return false;
    }

    obtenerProductosEliminados() {
        return [...EliminarA.productosEliminados];
    }

    eliminarDefinitivamente(id) {
        const index = EliminarA.productosEliminados.indexOf(id);
        if (index !== -1) {
            EliminarA.productosEliminados.splice(index, 1);
            return true;
        }
        return false;
    }
}