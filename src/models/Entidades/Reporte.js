// Entidad simple que representa un reporte generado
 class Reporte {
    constructor(id, tipo, datos, fechaGeneracion = new Date()) {
        this.id = id;
        this.tipo = tipo; // 'ventas', 'inventario', etc.
        this.datos = datos;
        this.fechaGeneracion = fechaGeneracion;
        this.activo = true;
    }
    getId() { return this.id; }
    getTipo() { return this.tipo; }
    getDatos() { return this.datos; }
    getFechaGeneracion() { return this.fechaGeneracion; }
    isActivo() { return this.activo; }
    toJSON() {
        return {
            id: this.id,
            tipo: this.tipo,
            datos: this.datos,
            fechaGeneracion: this.fechaGeneracion.toISOString(),
            activo: this.activo
        };
    }

    desactivar() {
        this.activo = false;
    }
}

module.exports = Reporte;