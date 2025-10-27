const  SesionAdministrador = require( '../../patrones/Singleton/SesionAdministrador');
const FabricaProducto = require('../../patrones/Fabrica/FabricaProducto');
const   Reportes = require( '../../patrones/Estrategia/Reportes');
const Usuario = require("./Usuario")
class Administrador extends Usuario {
    constructor(id, email,password, nombre, direccion, telefono, rol) {
        super(id, email, password, nombre);
        this.rol = rol;
         this.direccion = direccion;
        this.telefono = telefono;
        this.sesion = SesionAdministrador.getInstancia();
        this.fabrica = new FabricaProducto();
        this.reportes = new Reportes();
    }
    login(credenciales) {
        this.sesion.setSessionData('usuarioId', this.id);
        this.sesion.setSessionData('email', this.email);
        this.sesion.setSessionData('rol', this.rol);
        this.sesion.actualizarActividad();
        return this.sesion.validarSesion();
    }
    logout() {
        this.sesion.cerrarSesion();
    }
    generarReporte(tipo) {
        return this.reportes.ejecutarGeneracionReporte({ tipo });
    }
    gestionarProductos() {
        console.log('Gestionando productos...');
    }
    verPanelControl() {
        console.log('Mostrando panel de control...');
    }

        getInfo() {
        return {
            ...super.getInfo(),
            telefono: this.telefono,
            tipo: 'admin'
        };
    }
}

module.exports = Administrador;