const express = require("express");
const CarritoController = require("../controller/CarritoController");
const {obtenerIdentidad} = require("../middlewares/auth.middleware");

const router = express.Router();

// Using static methods directly from CarritoController
router.post("/agregar", obtenerIdentidad, CarritoController.agregarProducto);

router.delete("/eliminar/:productoId", obtenerIdentidad, CarritoController.eliminarProducto);

router.put("/actualizar/:productoId", obtenerIdentidad, CarritoController.actualizarCantidad);

router.get("/", obtenerIdentidad, CarritoController.obtenerCarrito);

//router.get("/subtotal", obtenerIdentidad, CarritoController.calcularSubtotal);

module.exports = router;