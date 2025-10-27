// routes/admin.routes.js
const express = require("express");
const { autenticar, isAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

// Ver panel de control
router.get("/panel", autenticar, isAdmin, (req, res) => {
    try {
        res.json({
            exito: true,
            mensaje: `Panel de control del admin ${req.usuario.email}`
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: "Error al mostrar el panel de control",
            error: error.message
        });
    }
});

// Generar reporte
router.post("/reportes", autenticar, isAdmin, (req, res) => {
    try {
        const { tipo } = req.body;
        res.json({
            exito: true,
            reporte: `Reporte de tipo ${tipo} generado por admin ${req.usuario.email}`
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: "Error al generar el reporte",
            error: error.message
        });
    }
});

module.exports = router;
