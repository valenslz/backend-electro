const Producto = require("../models/Entidades/Productos");
const pool = require("../config/bd"); // Asumimos que pool ahora es un objeto de mysql2 con promesas

class ProductoService {
  constructor() {

  }

  // 1. OBTENER POR ID
  async obtenerPorId(productId) {
    // CAMBIO: $1 -> ?
    const query = 'SELECT * FROM productos WHERE id = ?'; 
    try
    {
      const [rows] = await pool.query(query, [productId]); // Uso de desestructuración para obtener las filas
      if (rows.length > 0) {
        return rows[0];
      } else {
        return []
      }
    
    }
    catch (error) {
      console.error("Error retrieving product by ID:", error);
      throw new Error("Database error while fetching product by ID.");
    }
    
  }

  // MÉTODOS DE LÓGICA DE NEGOCIO (No requieren cambio SQL)
  checkStock(productId, cantidadSolicitada) {
    const producto = this.getById(productId);
    if (!producto) throw new Error("Producto no encontrado");
    return producto.getStock() >= cantidadSolicitada;
  }

  actualizarStock(productId, cantidad) {
    const producto = this.getById(productId);
    if (!producto) throw new Error("Producto no encontrado");
    producto.setStock(cantidad);
    return producto;
  }

  // 2. OBTENER FILTROS DISPONIBLES
  async obtenerFiltrosDisponibles(categoria) {
    try{
      // CAMBIO: $1 -> ? en ambas consultas SQL
      const precioQuery = 
        "SELECT MIN(precio) AS min, MAX(precio) AS max FROM productos p JOIN marcas m ON p.marca_id = m.id_marca JOIN marca_categoria mc ON m.id_marca = mc.id_marca JOIN categorias c ON mc.id_categoria = c.id_categoria WHERE c.nombre = ?";
      
      const marcasQuery = 
        "SELECT m.nombre FROM categorias c JOIN marca_categoria mc ON c.id_categoria = mc.id_categoria JOIN marcas m ON mc.id_marca = m.id_marca WHERE c.nombre = ? ORDER BY m.nombre";

      // Ejecución de las consultas (pool.query con mysql2 devuelve [rows, fields])
      const [precioResultado] = await pool.query(precioQuery, [categoria]);
      const [marcasResultado] = await pool.query(marcasQuery, [categoria]);

      console.log("✅ Retrieved available filters for category:", categoria);
      console.log({
        marcas: marcasResultado.map(row => row.nombre),
        rangoPrecio: {
          min: precioResultado[0].min || 0,
          max: precioResultado[0].max || 0,
        },
        disponibilidad: false
      })

      return {
        marcas: marcasResultado.map(row => row.nombre),
        rangoPrecio: {
          min: precioResultado[0].min || 0,
          max: precioResultado[0].max || 0,
        },
        disponibilidad: false
      };

    } catch(error) {
      console.error("Error retrieving available filters for category:", error);
      throw new Error("Database error while fetching available filters for category.");
    }
  }

  // 3. OBTENER TODOS
  async obtenerTodos() {
    const query = 'SELECT * FROM productos WHERE disponible = TRUE ORDER BY nombre';
    try {
      const [rows] = await pool.query(query);
      console.log("✅ Retrieved all products");
      return rows;
    } catch(error) {
      console.error("Error retrieving all products:", error);
      throw new Error("Database error while fetching all products.");
    }
  }

  // 4. BUSCAR CON FILTROS
  async buscarConFiltros({ texto, categoria, subcategoria, precioMin, precioMax, marcas ,disponibilidad }) {
    try {
      console.log(precioMax, precioMin)
      // La consulta base no usa ILIKE, se cambia a LIKE para compatibilidad con MySQL
      let sql = `SELECT p.*, m.nombre as nombre_marca, c.nombre as nombre_categoria, s.nombre as nombre_subcategoria 
                 FROM productos p 
                 JOIN marcas m ON p.marca_id = m.id_marca 
                 JOIN subcategorias s ON p.subcategoria_id = s.id_subcategoria 
                 JOIN categorias c ON s.categoria_id = c.id_categoria 
                 WHERE 1=1`;
      const params = [];

      // 🔹 Búsqueda por texto (nombre, marca o descripción)
      if (texto) {
        params.push(`%${texto}%`, `%${texto}%`); // Necesitamos 2 marcadores, uno para nombre y otro para descripción
        // CAMBIO: ILIKE -> LIKE (MySQL usa LIKE para búsquedas de texto)
        // CAMBIO: $n -> ?
        sql += ` AND (p.nombre LIKE ? OR p.descripcion LIKE ?)`; 
      }

      // 🔹 Filtrar por categoría
      if (categoria) {
        params.push(categoria);
        sql += ` AND c.nombre = ?`; // CAMBIO: $n -> ?
      }
      if (subcategoria) {
        params.push(subcategoria);
        sql += ` AND s.nombre = ?`; // CAMBIO: $n -> ?
      }

      // 🔹 Filtrar por marcas
      if (marcas && marcas.length > 0) {
        // Se genera un '?' por cada marca
        const placeholders = marcas.map(() => '?').join(", "); 
        sql += ` AND m.nombre IN (${placeholders})`; 
        params.push(...marcas);
      }

      // 🔹 Filtrar por rango de precios
      if (precioMin) {
        params.push(parseFloat(precioMin));
        sql += ` AND p.precio >= ?`; // CAMBIO: $n -> ?
      }

      if (precioMax) {
        params.push(parseFloat(precioMax));
        sql += ` AND p.precio <= ?`; // CAMBIO: $n -> ?
      }

      // 🔹 Filtrar por disponibilidad
      if (disponibilidad === "true" || disponibilidad === true) {
        sql += ` AND p.stock > 0`;
      }

      sql += " ORDER BY nombre ASC";

      console.log("🧩 Query generada:", sql);
      console.log("📦 Parámetros:", params);

      const [rows] = await pool.query(sql, params);
      
      return rows;
    } catch (error) {
      console.error("❌ Error en buscarConFiltros:", error);
      throw error;
    }
  }

  // 5. BORRAR PRODUCTO
  async borrar(id) {
    // CAMBIO: $1 -> ?
    const query = 'DELETE FROM productos WHERE id = ?'; 
    const [result] = await pool.query(query, [id]);
    
    // En MySQL, verificamos el número de filas afectadas
    if (result.affectedRows === 0) throw new Error("Producto no encontrado para borrar");
    
    return { mensaje: "Producto borrado" };
  }

  // 6. ACTUALIZAR PRODUCTO
  async actualizar(id, datos) {
    if (!datos || Object.keys(datos).length === 0) throw new Error("No hay datos para actualizar");

    const keys = Object.keys(datos);
    const values = Object.values(datos);

    // Construir fields con marcadores '?'
    const fields = keys.map((key) => `${key} = ?`).join(", ");
    
    // CAMBIO: Se elimina 'RETURNING *' (función de PostgreSQL)
    const query = `UPDATE productos SET ${fields} WHERE id = ?`; 

    // Agregar el id al final de los valores
    values.push(id);

    try {
      const [result] = await pool.query(query, values);
      
      // En MySQL, verificamos el número de filas afectadas
      if (result.affectedRows === 0) throw new Error("Producto no encontrado");
      
      // Para devolver el producto actualizado, hacemos una consulta adicional
      return this.obtenerPorId(id); 

    } catch (error) {
      console.error("❌ Error actualizando producto:", error);
      throw error;
    }
  }

  // 7. CREAR PRODUCTO
  async crear(datos) {
    const keys = Object.keys(datos);
    const values = Object.values(datos);
    const fields = keys.join(", ");
    
    // Construir marcadores '?'
    const placeholders = keys.map(() => '?').join(", "); 

    // CAMBIO: Se elimina 'RETURNING *' y se usa 'INSERT INTO ...' para obtener el ID.
    // Aunque mysql2 puede devolver el insertId, usaremos una lógica simple de INSERT.
    const query = `INSERT INTO productos (${fields}) VALUES (${placeholders})`; 
    
    try {
      const [result] = await pool.query(query, values);
      
      // El ID insertado se encuentra en result.insertId con mysql2
      const insertedId = result.insertId; 
      
      // Se retorna el producto recién creado
      return this.obtenerPorId(insertedId); 

    } catch (error) {
      console.error("❌ Error creando producto:", error);
      throw error;
    }
  }
}

module.exports = ProductoService;