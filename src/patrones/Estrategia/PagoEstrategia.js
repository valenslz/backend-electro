
class PagoStrategy {
  async pagar(monto, datosRequeridos) {
    throw new Error('Método pagar debe ser implementado por las subclases');
  }
  
  async validarDatos(datos) {
    throw new Error('Método validarDatos debe ser implementado por las subclases');
  }
  
  getDatosRequeridos() {
    throw new Error('Método getDatosRequeridos debe ser implementado por las subclases');
  }
}