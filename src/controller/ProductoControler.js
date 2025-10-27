class ProductoController {
  constructor(productoService, busquedaService) {
    this.productoService = productoService;
    this.busquedaService = busquedaService;
  }

  /**
   * Obtener todos los productos
   */
  async obtenerTodos(req, res) {
    try {
      const productos = await this.productoService.obtenerTodos();
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obtener producto por ID
   */
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const producto = await this.productoService.obtenerPorId(parseInt(id));

      if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      res.json(producto);
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Buscar productos con texto o filtros
   */
  async buscarProductos(req, res) {
    try {
      const { texto, categoria,subcategoria, precioMin, precioMax, marcas, soloDisponibles } =
        req.query;

      let productos = [];
      console.log(precioMin, precioMax);

     
        // búsqueda con filtros
        productos = await this.productoService.buscarConFiltros({
          texto,
          categoria,
          subcategoria,
          precioMin: precioMin ? parseFloat(precioMin) : undefined,
          precioMax: precioMax ? parseFloat(precioMax) : undefined,
          marcas: marcas ? marcas.split(",") : [],
          soloDisponibles: soloDisponibles === "true",
        });
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obtener productos por categoría
   */
  async obtenerPorCategoria(req, res) {
    try {
      const { categoria } = req.params;
      const productos = await this.productoService.obtenerPorCategoria(categoria);
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obtener filtros disponibles
   */
 async obtenerFiltrosDisponibles(req, res) {
  try {
    const { categoria } = req.params;
    const filtros = await this.productoService.obtenerFiltrosDisponibles(categoria);
    res.json(filtros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

 async actualizar(req, res) {
    try {
      const { id } = req.params;
      const datos = req.body;

      // Validar que exista algún campo
      if (!datos || Object.keys(datos).length === 0) {
        return res.status(400).json({ error: "No se enviaron datos para actualizar" });
      }

      const productoActualizado = await this.productoService.actualizar(parseInt(id), datos);

      if (!productoActualizado) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      res.json({ mensaje: "Producto actualizado", producto: productoActualizado });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }


async Borrar(req, res) {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: "ID inválido" });
    }

    await this.productoService.borrar(parseInt(id));
    res.json({ mensaje: "Producto borrado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
async crear(req, res) {
  try {
    const datos = req.body;

    // Validar que haya datos
    if (!datos || Object.keys(datos).length === 0) {
      return res.status(400).json({ error: "No se enviaron datos para crear" });
    }

    const productoCreado = await this.productoService.crear(datos);

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      producto: productoCreado,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
}

module.exports = ProductoController;
