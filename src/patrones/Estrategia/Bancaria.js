class Bancaria extends PagoStrategy {
  constructor() {
    super();
    this.tipo = 'TRANSFERENCIA_BANCARIA';
  }
  
  async pagar(monto, datosRequeridos) {
    try {
      const datosValidos = await this.validarDatos(datosRequeridos);
      if (!datosValidos.esValido) {
        throw new Error(datosValidos.mensaje);
      }
            const instruccionesPago = await this.generarInstrucciones(monto, datosRequeridos);
      
      return {
        exitoso: true,
        transactionId: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        mensaje: 'Instrucciones de transferencia generadas',
        metodoPago: this.tipo,
        monto: monto,
        fecha: new Date(),
        detalles: instruccionesPago,
        requiereConfirmacion: true, 
        estadoPago: 'PENDIENTE_TRANSFERENCIA'
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
    
    // Para transferencia solo necesitamos datos básicos
    if (!datos.nombreCuenta || datos.nombreCuenta.trim().length < 2) {
      errores.push('Nombre para la transferencia requerido');
    }
    
    return {
      esValido: errores.length === 0,
      mensaje: errores.join(', ')
    };
  }
  
  getDatosRequeridos() {
    return ['nombreCuenta'];
  }
  
  async generarInstrucciones(monto, datos) {
    // Generar instrucciones de pago con datos bancarios
    const referenciaPago = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    return {
      banco: 'Banco Nacional',
      tipoCuenta: 'Cuenta Corriente',
      numeroCuenta: '1234567890',
      titular: 'Empresa Ecommerce S.A.S',
      monto: monto,
      referencia: referenciaPago,
      plazoMaximo: '24 horas',
      instrucciones: [
        `Realizar transferencia por valor de $${monto}`,
        `A la cuenta corriente número 1234567890`,
        `Titular: Empresa Ecommerce S.A.S`,
        `Banco Nacional`,
        `Concepto: Pago pedido - Ref: ${referenciaPago}`,
        `Enviar comprobante a pagos@ecommerce.com`
      ]
    };
  }
}

