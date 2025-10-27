const FiltroProducto = require("./FiltroProducto");

class FiltroDisponibilidad extends FiltroProducto {
  constructor(soloDisponibles = true) {
    super();
    this.soloDisponibles = soloDisponibles;
  }

  aplicar(productos) {
    if (this.soloDisponibles) {
      return productos.filter((p) => p.isDisponible());
    }
    return productos;
  }

  esValido() {
    return typeof this.soloDisponibles === "boolean";
  }
}

module.exports = FiltroDisponibilidad;
