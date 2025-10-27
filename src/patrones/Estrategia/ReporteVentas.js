class ReporteVentas {
    constructor() {
        this.periodo = '';
        this.totalVentas = 0;
        this.productosVendidos = new Map();
    }
    
    generarReporte(datos) {
        this.periodo = datos.periodo || '';
        this.totalVentas = datos.totalVentas || 0;
        this.productosVendidos = new Map(Object.entries(datos.productosVendidos || {}));
        
        return JSON.stringify({
            periodo: this.periodo,
            totalVentas: this.totalVentas,
            productosVendidos: Object.fromEntries(this.productosVendidos)
        });
    }
    
    exportarReporte(formato) {
        const reporte = this.generarReporte({});
        return formato === 'json' ? reporte : reporte;
    }
    
    esFormatoValido(formato) {
        const formatosValidos = ['json', 'csv', 'xml', 'pdf'];
        return formatosValidos.includes(formato.toLowerCase());
    }
}

module.exports = ReporteVentas;