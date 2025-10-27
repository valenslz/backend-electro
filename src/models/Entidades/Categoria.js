const  ComponenteCategoria = require('../../patrones/Composite/ComponenteCategoria');

 class Categoria extends ComponenteCategoria {
    constructor(id, nombre, descripcion = '') {
        super();
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.componentes = []; // List<ComponenteCategoria>
        this.productos = [];   // List<Producto>
        this.activo = true;
        this.fecha_creacion = new Date();
        this.categoria_padre_id = null;
    }
    getId() { return this.id; }
    getNombre() { return this.nombre; }
    mostrar() {
        let resultado = `📁 ${this.nombre}\n`;
        this.componentes.forEach(componente => {
            resultado += `  ↳ ${componente.mostrar()}\n`;
        });
        return resultado;
    }
    obtenerProductos() {
        let todosProductos = [...this.productos];
        this.componentes.forEach(componente => {
            todosProductos = todosProductos.concat(componente.obtenerProductos());
        });
        return todosProductos;
    }
    contarElementos() {
        let count = this.productos.length;
        this.componentes.forEach(componente => {
            count += componente.contarElementos();
        });
        return count;
    }
    agregarComponente(componente) {
        if (componente instanceof ComponenteCategoria) {
            this.componentes.push(componente);
            return true;
        }
        return false;
    }
    removerComponente(id) {
        const index = this.componentes.findIndex(c => c.getId() === id);
        if (index !== -1) {
            this.componentes.splice(index, 1);
            return true;
        }
        return false;
    }
    buscarProducto(nombre) {
        for (const producto of this.productos) {
            if (producto.getNombre().toLowerCase().includes(nombre.toLowerCase())) {
                return producto;
            }
        }
        for (const componente of this.componentes) {
            const producto = componente.buscarProducto(nombre);
            if (producto) return producto;
        }
        
        return null;
    }
    getDescripcion() { return this.descripcion; }
    setDescripcion(descripcion) { this.descripcion = descripcion; }
    getCategoriaPadreId() { return this.categoria_padre_id; }
    setCategoriaPadreId(id) { this.categoria_padre_id = id; }
    getFechaCreacion() { return this.fecha_creacion; }
    isActivo() { return this.activo; }
    setActivo(activo) { this.activo = activo; }
    agregarProducto(producto) {
        this.productos.push(producto);
        return true;
    }
    removerProducto(id) {
        const index = this.productos.findIndex(p => p.getId() === id);
        if (index !== -1) {
            this.productos.splice(index, 1);
            return true;
        }
        return false;
    }
    obtenerSubcategorias() {
        return this.componentes.filter(comp => comp instanceof Categoria);
    }
    obtenerTodosProductos() {
        return this.obtenerProductos();
    }
}

module.exports = Categoria;