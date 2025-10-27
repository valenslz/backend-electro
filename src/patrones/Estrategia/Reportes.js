
class Reportes {
    constructor() {
        this.estrategia = null;
    }

    setEstrategia(estrategia) {
        this.estrategia = estrategia;
    }

    ejecutarGeneracionReporte(datos) {
        if (!this.estrategia) {
            throw new Error('No se ha establecido una estrategia');
        }
        return this.estrategia.generarReporte(datos);
    }

    obtenerEstadisticas() {
        return {
            estrategia: this.estrategia?.constructor.name,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = Reportes;