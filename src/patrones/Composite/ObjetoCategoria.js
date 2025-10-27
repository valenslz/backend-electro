import { ComponenteCategoria } from './ComponenteCategoria.js';
export class ObjetoCategoria extends ComponenteCategoria {
    constructor(producto) {
        super();
        this.id = producto.id;
        this.nombre = producto.nombre;
        this.producto = producto;
        this.fecha_creacion = new Date();
        this.activo = true;
        this.orden = 0;
        this.visible = true;
    }
    getId() { return this.id; }
    getNombre() { return this.nombre; }
    getProducto() { return this.producto; }
    setProducto(producto) { this.producto = producto; }
    getOrden() { return this.orden; }
    setOrden(orden) { this.orden = orden; }
    isVisible() { return this.visible; }
    mostrar() {
        return `Producto: ${this.producto.nombre} - $${this.producto.precio}`;
    }
    obtenerProductos() {
        return [this.producto];
    }
    contarElementos() {
        return 1;
    }
    agregarComponente(componente) {
        throw new Error('ObjetoCategoria no puede tener componentes hijos');
    }
    removerComponente(id) {
        return false;
    }
    buscarProducto(nombre) {
        return this.producto.nombre.toLowerCase().includes(nombre.toLowerCase()) 
            ? this.producto 
            : null;
    }
    getFechaCreacion() { return this.fecha_creacion; }
    isActivo() { return this.activo; }
    setActivo(activo) { this.activo = activo; }
}