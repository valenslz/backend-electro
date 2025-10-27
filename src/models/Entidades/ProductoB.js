const Producto = require( './Producto');

 class ProductoB extends Producto {
    constructor(datos) {
        super(datos);
        this.tipoSensor = datos.tipoSensor || '';
        this.unidadMedida = datos.unidadMedida || '';
    }

    getUnidadMedida() {
        return this.unidadMedida;
    }

    obtenerEspecificaciones() {
        return {
            tipoSensor: this.tipoSensor,
            unidadMedida: this.unidadMedida,
            id: this.id,
            nombre: this.nombre,
            precio: this.precio,
            categoria: this.categoria,
            marca: this.marca,
            stock: this.stock_actual
        };
    }
}

module.exports = ProductoB;