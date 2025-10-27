const express = require("express");
const Reportes= require('../patrones/Estrategia/Reportes');
const ReporteVentas = require(  '../patrones/Estrategia/ReporteVentas');
const ReporteInventario = require('../patrones/Estrategia/ReporteInventario');

const router = express.Router();
const gestorReportes = new Reportes();

// Generar reporte
router.post('/generar/:tipo', (req, res) => {
    try {
        const { tipo } = req.params;
        const datos = req.body;

        let estrategia;
        switch (tipo.toLowerCase()) {
            case 'ventas':
                estrategia = new ReporteVentas();
                break;
            case 'inventario':
                estrategia = new ReporteInventario();
                break;
            default:
                return res.status(400).json({
                    exito: false,
                    mensaje: 'Tipo de reporte no válido. Use: ventas o inventario'
                });
        }

        gestorReportes.setEstrategia(estrategia);
        const resultado = gestorReportes.ejecutarGeneracionReporte(datos);
        
        res.json({
            exito: true,
            tipoReporte: tipo,
            reporte: JSON.parse(resultado),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: 'Error al generar reporte: ' + error.message
        });
    }
});

// Exportar reporte
router.post('/exportar/:tipo', (req, res) => {
    try {
        const { tipo } = req.params;
        const { formato, datos } = req.body;

        let estrategia;
        switch (tipo.toLowerCase()) {
            case 'ventas':
                estrategia = new ReporteVentas();
                break;
            case 'inventario':
                estrategia = new ReporteInventario();
                break;
            default:
                return res.status(400).json({
                    exito: false,
                    mensaje: 'Tipo de reporte no válido'
                });
        }

        if (!estrategia.esFormatoValido(formato)) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Formato no válido. Use: json, csv, xml o pdf'
            });
        }

        const exportado = estrategia.exportarReporte(formato);
        
        res.json({
            exito: true,
            mensaje: `Reporte exportado en formato ${formato}`,
            contenido: exportado
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: 'Error al exportar reporte: ' + error.message
        });
    }
});

// Obtener estadísticas del gestor de reportes
router.get('/estadisticas', (req, res) => {
    try {
        const estadisticas = gestorReportes.obtenerEstadisticas();
        res.json({
            exito: true,
            estadisticas: estadisticas
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: 'Error al obtener estadísticas: ' + error.message
        });
    }
});

module.exports = router;