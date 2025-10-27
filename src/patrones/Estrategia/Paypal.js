class PayPal extends PagoStrategy {
  constructor() {
    super();
    this.tipo = 'PAYPAL';
  }
  
  async pagar(monto, datosRequeridos) {
    try {
      const datosValidos = await this.validarDatos(datosRequeridos);
      if (!datosValidos.esValido) {
        throw new Error(datosValidos.mensaje);
      }
      
      // Simular integración con PayPal API
      const resultadoPago = await this.procesarConPayPal(monto, datosRequeridos);
      
      return {
        exitoso: true,
        transactionId: resultadoPago.id,
        mensaje: 'Pago procesado exitosamente con PayPal',
        metodoPago: this.tipo,
        monto: monto,
        fecha: new Date(),
        detalles: {
          email: datosRequeridos.email,
          paypalTransactionId: resultadoPago.paypal_id
        }
      };
      
    } catch (error) {
      return {
        exitoso: false,
        error: error.message,
        metodoPago: this.tipo,
        monto: monto,
        fecha: new Date()
      };
    }
  }
  
  async validarDatos(datos) {
    const errores = [];
    
    // Validar email
    if (!datos.email || !this.validarEmail(datos.email)) {
      errores.push('Email de PayPal inválido');
    }
    
    return {
      esValido: errores.length === 0,
      mensaje: errores.join(', ')
    };
  }
  
  getDatosRequeridos() {
    return ['email'];
  }
  
  validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  async procesarConPayPal(monto, datos) {
    // Simular integración con PayPal
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const exitoso = Math.random() > 0.05; // 95% de éxito
        
        if (exitoso) {
          resolve({
            id: `pp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            paypal_id: `PAYPAL_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            status: 'completed'
          });
        } else {
          reject(new Error('Pago rechazado por PayPal'));
        }
      }, 1500);
    });
  }
}
