const FiltroPrecio = require("../patrones/Filtro/FiltroPrecio");
const FiltroMarca = require("../patrones/Filtro/FiltroMarca");
const FiltroDisponibilidad = require("../patrones/Filtro/FiltroDisponibilidad");

class BusquedaService {
  constructor(productService) {
    this.productService = productService; // Dependencia inyectada
  }

  /**
   * Buscar productos por texto (nombre o descripción)
   */
  buscarPorTexto(query) {
    const productos = this.productService.obtenerTodos();
    return productos.filter(
      (p) =>
        p.getNombre().toLowerCase().includes(query.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Buscar productos con filtros
   */



  

  /**
   * Retorna los filtros que se pueden aplicar al catálogo
   */
  obtenerFiltrosDisponibles(categoria,query) {
  const productosFiltrados = query
    ? this.buscarPorTexto(query)
    : this.productService.obtenerPorCategoria(categoria);

  return {
    marcas: [...new Set(productosFiltrados.map((p) => p.marca))],
    categorias: [...new Set(productosFiltrados.map((p) => p.categoria))],
    rangoPrecio: {
      min: Math.min(...productosFiltrados.map((p) => p.precio)),
      max: Math.max(...productosFiltrados.map((p) => p.precio)),
    },
    disponibilidad: true,
  };
}


  /**
   * Aplica filtros manualmente a una lista de productos
   */
  aplicarFiltros(productos, criterios) {
    let filtros = this.extraerFiltrosDisponibles(criterios);

    filtros.forEach((filtro) => {
      if (filtro.esValido()) {
        productos = filtro.aplicar(productos);
      }
    });

    return productos;
  }

  /**
   * Convierte los criterios en instancias de filtros
   */
  extraerFiltrosDisponibles(criterios) {
    let filtros = [];

    if (criterios.precioMin !== undefined && criterios.precioMax !== undefined) {
      filtros.push(new FiltroPrecio(criterios.precioMin, criterios.precioMax));
    }

    if (criterios.marcas && criterios.marcas.length > 0) {
      filtros.push(new FiltroMarca(criterios.marcas));
    }

    if (criterios.soloDisponibles !== undefined) {
      filtros.push(new FiltroDisponibilidad(criterios.soloDisponibles));
    }

    return filtros;
  }
}

module.exports = BusquedaService;
