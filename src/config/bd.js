const mysql = require('mysql2'); // 👈 Cambia la librería a mysql2

// ⚠️ ADVERTENCIA: Remplaza 'TU_USUARIO_HOSTINGER' y 'TU_CONTRASEÑA'
// con las credenciales que Hostinger te proporcionó para la base de datos u728773586_electromarket.
const pool = mysql.createPool({
    host: 'srv1180.hstgr.io',      // Host de tu servidor MySQL en Hostinger
    user: 'u728773586_electromarket',  // Tu usuario de BD de Hostinger
    database: 'u728773586_electromarket', // Nombre de la BD de Hostinger
    password: 'Jhonmacarthur#2017',     // Tu contraseña de BD de Hostinger
    port: 3306,                    // Puerto por defecto de MySQL
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    idleTimeout: 40000,
    
    // Tiempo de espera para obtener una conexión del pool (Ejemplo: 10 segundos)
    acquireTimeout: 10000, 
    
    // Tiempo de espera para el servidor (si la consulta tarda mucho) (Ejemplo: 60 segundos)
   connectTimeout: 60000
}).promise(); // 💡 Usamos .promise() para habilitar Promesas / async/await

// Verificar conexión
pool.getConnection()
    .then(connection => {
        console.log('✅ Conectado a MySQL en Hostinger');
        connection.release(); // Libera la conexión
    })
    .catch(err => console.error('❌ Error al conectar a MySQL:', err.message));

module.exports = pool;