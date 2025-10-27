class SesionAdministrador {
    static instancia = null;
    constructor() {
        this.sessionData = new Map();
    }
    static getInstancia() {
        if (SesionAdministrador.instancia === null) {
            SesionAdministrador.instancia = new SesionAdministrador();
        }
        return SesionAdministrador.instancia;
    }
    validarSesion() {
        return this.sessionData.has('usuarioId');
    }
    cerrarSesion() {
        this.sessionData.clear();
    }
    actualizarActividad() {
        this.sessionData.set('ultimaActividad', new Date());
    }
    getSessionData() {
        return Object.fromEntries(this.sessionData);
    }
    setSessionData(clave, valor) {
        this.sessionData.set(clave, valor);
    }
}

module.exports = SesionAdministrador;