const express = require("express");
const router = express.Router();
const ProductoController = require("../controller/ProductoControler");
const ProductoService = require("../service/Producto.service");
const BusquedaService = require("../service/Busqueda.service");

// Instancias de servicios
const productoService = new ProductoService();
const busquedaService = new BusquedaService(productoService);

// Instancia de controller con DI (Inyección de Dependencias)
const productoController = new ProductoController(productoService, busquedaService);

// Rutas
router.get("/buscar", (req, res) => productoController.buscarProductos(req, res));

router.get("/", (req, res) => productoController.obtenerTodos(req, res));
router.get("/:id", (req, res) => productoController.obtenerPorId(req, res));
router.get("/categoria/:categoria", (req, res) => {   
     productoController.obtenerPorCategoria(req, res)
});

router.get("/buscar/filtros/:categoria", (req, res) => productoController.obtenerFiltrosDisponibles(req, res));
router.get("/Todos", (req, res) => productoController.obtenerTodos(req, res));
router.delete("/Borrar/:id", (req, res) => productoController.Borrar(req, res));
router.put("/editar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;
    await productoService.actualizar(id, datos);
    res.json({ mensaje: "Producto actualizado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/crear", (req, res) => productoController.crear(req, res));

module.exports = router;
