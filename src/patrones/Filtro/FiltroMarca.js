const FiltroProducto = require("./FiltroProducto");

class FiltroMarca extends FiltroProducto {
  constructor(marcas) {
    super();
    this.marcas = marcas;
  }

  aplicar(productos) {
    return productos.filter((p) => this.marcas.includes(p.getMarca()));
  }

  esValido() {
    return Array.isArray(this.marcas) && this.marcas.length > 0;
  }
}

module.exports = FiltroMarca;
