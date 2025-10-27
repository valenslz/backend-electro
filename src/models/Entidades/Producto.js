class Producto {
    constructor(datos) {
        if (this.constructor === Producto) {
            throw new Error('No se puede instanciar clase abstracta Producto');
        }
        this.id = datos.id;
        this.nombre = datos.nombre;
        this.descripcion = datos.descripcion;
        this.precio = datos.precio;
        this.categoria = datos.categoria;
        this.marca = datos.marca;
        this.stock_actual = datos.stock_actual;
        this.activo = datos.activo;
        this.fecha_creacion = datos.fecha_creacion;
    }

    getId() { return this.id; }
    getNombre() { return this.nombre; }
    getDescripcion() { return this.descripcion; }
    getPrecio() { return this.precio; }
    getCategoria() { return this.categoria; }
    getMarca() { return this.marca; }
    getStock() { return this.stock_actual; }
    isActivo() { return this.activo; }
    getFechaCreacion() { return this.fecha_creacion; }

    setStock(cantidad) {
        this.stock_actual = cantidad;
    }

    validarDatos() {
        return this.nombre && this.precio >= 0 && this.stock_actual >= 0;
    }
}

module.exports = Producto;