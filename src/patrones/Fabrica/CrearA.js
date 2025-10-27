const ProductoA = require( '../../models/Entidades/ProductoA');

class CrearA {
    static ultimoIdGenerado = 0;

    crearProducto(datos) {
        const id = this.generarIdUnico();
        const producto = new ProductoA({ ...datos, id });
        return producto;
    }

    generarIdUnico() {
        return ++CrearA.ultimoIdGenerado;
    }

    validarDatos(datos) {
        return datos.nombre && datos.precio > 0;
    }

    asignarEspecificaciones(producto, datos) {
        if (datos.modelo) producto.modelo = datos.modelo;
        if (datos.voltaje) producto.voltaje = datos.voltaje;
    }
}

module.exports = CrearA;