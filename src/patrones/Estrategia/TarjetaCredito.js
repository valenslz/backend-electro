class TarjetaCredito extends PagoStrategy {
  constructor() {
    super();
    this.tipo = 'TARJETA_CREDITO';
  }
  
  async pagar(monto, datosRequeridos) {
    try {
      // Validar datos antes del procesamiento
      const datosValidos = await this.validarDatos(datosRequeridos);
      if (!datosValidos.esValido) {
        throw new Error(datosValidos.mensaje);
      }
      
      const resultadoPago = await this.procesarConGateway(monto, datosRequeridos);
      
      return {
        exitoso: true,
        transactionId: resultadoPago.id,
        mensaje: 'Pago procesado exitosamente',
        metodoPago: this.tipo,
        monto: monto,
        fecha: new Date(),
        detalles: {
          ultimosDigitos: datosRequeridos.numeroTarjeta.slice(-4),
          tipoTarjeta: this.detectarTipoTarjeta(datosRequeridos.numeroTarjeta),
          autorizacion: resultadoPago.authorization_code
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
    
    // Validar número de tarjeta
    if (!datos.numeroTarjeta || !this.validarNumeroTarjeta(datos.numeroTarjeta)) {
      errores.push('Número de tarjeta inválido');
    }
    
    // Validar fecha de expiración
    if (!datos.fechaExpiracion || !this.validarFechaExpiracion(datos.fechaExpiracion)) {
      errores.push('Fecha de expiración inválida');
    }
    
    // Validar CVV
    if (!datos.cvv || !this.validarCVV(datos.cvv)) {
      errores.push('CVV inválido');
    }
    
    // Validar nombre del titular
    if (!datos.nombreTitular || datos.nombreTitular.trim().length < 2) {
      errores.push('Nombre del titular requerido');
    }
    
    return {
      esValido: errores.length === 0,
      mensaje: errores.join(', ')
    };
  }
  
  getDatosRequeridos() {
    return [
      'numeroTarjeta',
      'fechaExpiracion', 
      'cvv',
      'nombreTitular'
    ];
  }
  
  // Métodos auxiliares
  validarNumeroTarjeta(numero) {
    // Algoritmo de Luhn
    const cleanNumber = numero.replace(/\s+/g, '');
    if (!/^\d{13,19}$/.test(cleanNumber)) return false;
    
    let sum = 0;
    let shouldDouble = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
  }
  
  validarFechaExpiracion(fecha) {
    const [mes, anio] = fecha.split('/');
    const fechaExpiracion = new Date(2000 + parseInt(anio), parseInt(mes) - 1);
    return fechaExpiracion > new Date();
  }
  
  validarCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
  }
  
  detectarTipoTarjeta(numero) {
    const cleanNumber = numero.replace(/\s+/g, '');
    
    if (/^4/.test(cleanNumber)) return 'VISA';
    if (/^5[1-5]/.test(cleanNumber)) return 'MASTERCARD';
    if (/^3[47]/.test(cleanNumber)) return 'AMERICAN_EXPRESS';
    if (/^6/.test(cleanNumber)) return 'DISCOVER';
    
    return 'UNKNOWN';
  }
  
  async procesarConGateway(monto, datos) {
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
      
        const exitoso = Math.random() > 0.1; 
        
        if (exitoso) {
          resolve({
            id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            authorization_code: `AUTH_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            status: 'approved'
          });
        } else {
          reject(new Error('Pago rechazado por el banco'));
        }
      }, 2000); 
    });
  }
}