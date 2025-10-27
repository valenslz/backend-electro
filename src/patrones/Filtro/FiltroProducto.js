class FiltroProducto {

  aplicar(productos) {
    throw new Error("El método aplicar() debe ser implementado en la subclase");
  }

 
  esValido() {
    throw new Error("El método esValido() debe ser implementado en la subclase");
  }
}

module.exports = FiltroProducto;
