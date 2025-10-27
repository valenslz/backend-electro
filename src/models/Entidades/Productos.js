class Productos {
  constructor(id, nombre, descripcion, precio, categoria, marca, stock_actual, stock_minimo) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.categoria = categoria;
    this.marca = marca;
    this.stock_actual = stock_actual;
    this.stock_minimo = stock_minimo;
    this.activo = true;
    this.fecha_creacion = new Date();
    this.fecha_actualizacion = new Date();
  }

  // Getters
  getId() {
    return this.id;
  }

  getNombre() {
    return this.nombre;
  }

  getPrecio() {
    return this.precio;
  }

  getCategoria() {
    return this.categoria;
  }

  getMarca() {
    return this.marca;
  }

  getStock() {
    return this.stock_actual;
  }

  isActivo() {
    return this.activo;
  }

  isDisponible() {
    return this.activo && this.stock_actual > this.stock_minimo;
  }

  // Setters
  setStock(cantidad) {
    if (cantidad < 0) throw new Error("El stock no puede ser negativo.");
    this.stock_actual = cantidad;
    this.fecha_actualizacion = new Date();
  }

  // Validaciones
  validarDatos() {
    if (!this.nombre || this.nombre.trim() === "") return false;
    if (this.precio <= 0) return false;
    if (this.stock_actual < 0) return false;
    if (!this.categoria) return false;
    return true;
  }
}

module.exports = Productos;
