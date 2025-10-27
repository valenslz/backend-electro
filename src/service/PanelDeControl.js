export class PanelDeControl {
    constructor() {
        this.id = 1;
        this.nombre = 'Panel de Control';
        this.usuario_id = null;
        this.configuracion = new Map();
        this.permisos = [];
        this.historial_acciones = [];
    }

    mostrarDashboard() {
        return {
            id: this.id,
            nombre: this.nombre,
            usuario_id: this.usuario_id,
            configuracion: this.getConfiguracion(),
            permisos: this.getPermisos()
        };
    }

    actualizarDatos() {
        this.historial_acciones.push({
            accion: 'actualizar_datos',
            timestamp: new Date()
        });
        return true;
    }

    obtenerMetricas() {
        return {
            total_permisos: this.permisos.length,
            total_acciones: this.historial_acciones.length,
            configuraciones: this.configuracion.size
        };
    }

    getConfiguracion() {
        return Object.fromEntries(this.configuracion);
    }

    setConfiguracion(config) {
        Object.entries(config).forEach(([clave, valor]) => {
            this.configuracion.set(clave, valor);
        });
    }

    getPermisos() {
        return [...this.permisos];
    }

    agregarPermiso(permiso) {
        if (!this.permisos.includes(permiso)) {
            this.permisos.push(permiso);
            return true;
        }
        return false;
    }
    getHistorialAcciones() {
        return [...this.historial_acciones];
    }
}