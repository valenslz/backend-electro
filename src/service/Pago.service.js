const CarritoCompra = require("./patrones/singleton/CarritoCompra");
const PagoPayPal = require("./patrones/Estrategia/PagoPayPal");
const PagoTarjeta = require("./patrones/Estrategia/PagoTarjeta");
const PagoEfectivo = require("./patrones/Estrategia/PagoEfectivo");

class PagoService {
  constructor(userId) {
    this.carrito = CarritoCompra.getInstance(userId);
    this.metodos = {
      tarjeta: new PagoTarjeta(),
      paypal: new PagoPayPal(),
      efectivo: new PagoEfectivo(),
    };
    this.strategy = null; // método de pago actual
  }

  // + setStrategy(metodo:String)
  setStrategy(metodo) {
    if (!this.metodos[metodo]) {
      throw new Error(`Método de pago no soportado: ${metodo}`);
    }
    this.strategy = this.metodos[metodo];
  }

  // + getDatosRequeridos()
  getDatosRequeridos() {
    if (!this.strategy) throw new Error("Debe seleccionar un método de pago");
    return this.strategy.getDatosRequeridos();
  }

  // + getMetodos()
  getMetodos() {
    return Object.keys(this.metodos);
  }

  // + procesarPago(datos:json)
  procesarPago(datos) {
    if (!this.strategy) throw new Error("Debe seleccionar un método de pago");
    const monto = this.carrito.getTotal();
    return this.strategy.procesarPago(monto, datos);
  }
}

module.exports = PagoService;
