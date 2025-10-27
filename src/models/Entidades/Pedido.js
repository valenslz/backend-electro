const CarritoCompra = require("./patrones/Estrategia/CarritoCompra");
const Factura = require("./Factura");

class Pedido {
  constructor(id, userId, direccionEnvio, direccionFacturacion, metodoPago, notas = "") {
    this.id = id;
    this.userId = userId;
    this.fechaPedido = new Date();
    this.estado = "pendiente";
    this.subtotal = 0;
    this.impuestos = 0;
    this.descuentos = 0;
    this.total = 0;
    this.direccionEnvio = direccionEnvio;
    this.direccionFacturacion = direccionFacturacion;
    this.metodoPago = metodoPago;
    this.notas = notas;
    this.items = [];
    this.factura = null;
  }

  // + crearDesdeCarrito()
  static crearDesdeCarrito(id, userId, direccionEnvio, direccionFacturacion, metodoPago, notas = "") {
    const carrito = CarritoCompra.getInstance(userId);
    const pedido = new Pedido(id, userId, direccionEnvio, direccionFacturacion, metodoPago, notas);
    pedido.items = carrito.getCarrito();
    pedido.calcularTotal();
    return pedido;
  }

  // + calcularTotal()
  calcularTotal() {
    this.subtotal = this.items.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
    this.impuestos = this.subtotal * 0.19; // IVA 19%
    this.total = this.subtotal + this.impuestos - this.descuentos;
    return this.total;
  }

  // + cambiarEstado()
  cambiarEstado(nuevoEstado) {
    this.estado = nuevoEstado;
  }

  // + cancelar()
  cancelar() {
    this.estado = "cancelado";
  }

  // + generarFactura()
  generarFactura() {
    if (this.estado !== "pagado") {
      throw new Error("Solo se puede generar factura cuando el pedido está pagado");
    }
    this.factura = new Factura(this);
    return this.factura;
  }
}

module.exports = Pedido;
