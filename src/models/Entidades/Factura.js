class Factura {
  constructor() {
    this.numero = null;
    this.fechaEmision = null;
    this.subtotal = 0;
    this.impuestos = 0;
    this.total = 0;
    this.estado = "pendiente";
  }


  generar(pedido) {
    this.numero = this.generarNumero();
    this.fechaEmision = new Date();
    this.subtotal = pedido.subtotal;
    this.impuestos = pedido.impuestos;
    this.total = pedido.total;
    this.estado = "emitida";
    this.pedidoId = pedido.id;
    return this;
  }

 
  generarNumero() {
    return "FAC-" + Date.now();
  }

  
  marcarComoPagada() {
    this.estado = "pagada";
  }

  
  generarPDF() {
    return `
    FACTURA: ${this.numero}
    Fecha: ${this.fechaEmision}
    Subtotal: $${this.subtotal}
    Impuestos: $${this.impuestos}
    TOTAL: $${this.total}
    Estado: ${this.estado}
    `;
  }

  enviarPorEmail(email) {
    console.log(`Factura ${this.numero} enviada al correo ${email}`);
    return true;
  }
}

module.exports = Factura;
