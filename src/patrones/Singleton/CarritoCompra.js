const ProductoService = require("../../service/Producto.service");

class CarritoCompra {
  constructor(userId) {
    if (CarritoCompra.instance) {
      return CarritoCompra.instance; // Singleton: un carrito por usuario
    }
    this.userId = userId;
    this.items = new Map(); 
    this.productService = new ProductoService();
    CarritoCompra.instance = this;
  }

  static getInstance(userId) {
    if (!CarritoCompra.instance) {
      CarritoCompra.instance = new CarritoCompra(userId);
    }
    return CarritoCompra.instance;
  }

  // Agregar producto
  agregarItem(productId, cantidad) {
    const producto = this.productService.getById(productId);
    if (!producto) throw new Error("Producto no encontrado");

    if (!this.productService.checkStock(productId, cantidad)) {
      throw new Error("Stock insuficiente");
    }

    const cantidadActual = this.items.get(productId) || 0;
    this.items.set(productId, cantidadActual + cantidad);
  }

  // Eliminar producto
  eliminarItem(productId) {
    if (!this.items.has(productId)) throw new Error("Producto no está en el carrito");
    this.items.delete(productId);
  }

  // Actualizar cantidad de un producto
  actualizarCantidad(productId, cantidad) {
    if (!this.items.has(productId)) throw new Error("Producto no está en el carrito");

    if (!this.productService.checkStock(productId, cantidad)) {
      throw new Error("Stock insuficiente para actualizar");
    }

    this.items.set(productId, cantidad);
  }

  // Calcular subtotal de un producto
  calcularSubtotal(productId) {
    const producto = this.productService.getById(productId);
    const cantidad = this.items.get(productId) || 0;
    return producto ? producto.getPrecio() * cantidad : 0;
  }
calcularSubtotalTotal() {
    let subtotal = 0;
    for (let [productId, cantidad] of this.items) {
      const producto = this.productService.getById(productId);
      if (producto) {
        subtotal += producto.getPrecio() * cantidad;
      }
    }
    return subtotal;
  }
  // Calcular total
  getTotal() {
    let total = 0;
    for (let [productId, cantidad] of this.items) {
      const producto = this.productService.getById(productId);
      if (producto) total += producto.getPrecio() * cantidad;
    }
    return total;
  }

  // Ver carrito con detalles de productos
  getCarrito() {
    const detalles = [];
    for (let [productId, cantidad] of this.items) {
      const producto = this.productService.getById(productId);
      if (producto) {
        detalles.push({
          id: producto.getId(),
          nombre: producto.getNombre(),
          precioUnitario: producto.getPrecio(),
          cantidad,
          subtotal: this.calcularSubtotal(productId),
        });
      }
    }
    return detalles;
  }
}

module.exports = CarritoCompra;
