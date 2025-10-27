const FiltroProducto = require("./FiltroProducto");

class FiltroPrecio extends FiltroProducto {
  constructor(min, max) {
    super();
    this.min = min;
    this.max = max;
  }

  aplicar(productos) {
    return productos.filter(p => p.getPrecio() >= this.min && p.getPrecio() <= this.max);
  }

  esValido() {
    return this.min >= 0 && this.max >= this.min;
  }
}

module.exports = FiltroPrecio;
