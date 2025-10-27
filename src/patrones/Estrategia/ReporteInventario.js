 class ReporteInventario {
    constructor() {
        this.fechaGeneracion = '';
        this.totalProductos = 0;
        this.productos = new Map();
    }
    
    generarReporte(datos) {
        this.fechaGeneracion = datos.fechaGeneracion || new Date().toISOString();
        this.totalProductos = datos.totalProductos || 0;
        this.productos = new Map(Object.entries(datos.productos || {}));
        
        return JSON.stringify({
            fechaGeneracion: this.fechaGeneracion,
            totalProductos: this.totalProductos,
            productos: Object.fromEntries(this.productos)
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

module.exports =  ReporteInventario;