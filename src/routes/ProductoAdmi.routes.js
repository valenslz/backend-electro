const express = require("express");
const FabricaProducto = require( '../patrones/Fabrica/FabricaProducto');
const router = express.Router();
const fabricaProducto = new FabricaProducto();


router.get("/", (req, res)=>{
    try{

       const productos = fabricaProducto.obtenerProductos()
       return res.json({
        exito:true,
        data: productos
       });
    }
    catch(error){
        return res.status(500).json({
            exito: false,
            mensaje:  'Error obtener productos: ' + error.message
            
        });

    }

});
// Crear producto
router.post('/crear', (req, res) => {
    try {
        const { tipo, datos } = req.body;
        
        const producto = fabricaProducto.crearProducto(tipo, datos);
        
        res.json({
            exito: true,
            mensaje: 'Producto creado exitosamente',
            producto: producto,
            totalProductos: fabricaProducto.getTotalProductosCreados(),
            productosPorTipo: fabricaProducto.getProductosPorTipo()
        });
    } catch (error) {
        res.status(400).json({
            exito: false,
            mensaje: 'Error al crear producto: ' + error.message
        });
    }
});

// Obtener estadísticas de productos
router.get('/estadisticas', (req, res) => {
    try {
        res.json({
            exito: true,
            totalProductos: fabricaProducto.getTotalProductosCreados(),
            productosPorTipo: fabricaProducto.getProductosPorTipo()
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: 'Error al obtener estadísticas: ' + error.message
        });
    }
});

// Eliminar producto
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = fabricaProducto.eliminarProducto(parseInt(id));
        
        if (eliminado) {
            res.json({
                exito: true,
                mensaje: 'Producto eliminado exitosamente'
            });
        } else {
            res.status(404).json({
                exito: false,
                mensaje: 'Producto no encontrado para eliminar'
            });
        }
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: 'Error al eliminar producto: ' + error.message
        });
    }
});

// Obtener productos eliminados
router.get('/eliminados', (req, res) => {
    try {
        const eliminados = fabricaProducto.obtenerProductosEliminados();
        res.json({
            exito: true,
            productosEliminados: eliminados
        });
    } catch (error) {
        res.status(500).json({
            exito: false,
            mensaje: 'Error al obtener productos eliminados: ' + error.message
        });
    }
});

module.exports = router;