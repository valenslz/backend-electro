const Producto = require( './Producto');

class ProductoA extends Producto {
    constructor(datos) {
        super(datos);
        this.modelo = datos.modelo || '';
        this.voltaje = datos.voltaje || '';
    }

    obtenerEspecificaciones() {
        return {
            modelo: this.modelo,
            voltaje: this.voltaje,
            id: this.id,
            nombre: this.nombre,
            precio: this.precio,
            categoria: this.categoria,
            marca: this.marca,
            stock: this.stock_actual
        };
    }
}

module.exports = ProductoA;