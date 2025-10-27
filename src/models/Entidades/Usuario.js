const bcrypt = require('bcrypt');
const pool = require('../../config/bd'); // conexión con mysql2/promise

class Usuario {
    constructor(id, email, password, nombre, tipoUsuario) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.nombre = nombre;
        this.tipoUsuario = tipoUsuario;
    }

    static async buscarPorEmail(email) {
        try {
            console.log("🔍 Buscando usuario por email:", email);
            const [rows] = await pool.query(
                'SELECT * FROM usuarios WHERE correo = ?',
                [email]
            );
            
            console.log("📊 Resultado de búsqueda:", rows.length > 0 ? "Encontrado" : "No encontrado");
            
            if (rows[0]) {
                const usuario = new Usuario(
                    rows[0].id,
                    rows[0].correo,
                    rows[0].contraseña,
                    rows[0].nombre,
                    rows[0].tipo_usuario
                );
                console.log("👤 Usuario construído:", {
                    id: usuario.id,
                    email: usuario.email,
                    nombre: usuario.nombre,
                    tipoUsuario: usuario.tipoUsuario
                });
                return usuario;
            }
            return null;
        } catch (error) {
            console.error('❌ Error al buscar usuario:', error);
            throw new Error('Error al buscar usuario: ' + error.message);
        }
    }

    static async crear(usuarioData) {
        const { email, password, nombre, tipoUsuario } = usuarioData;
        
        try {
            console.log("🔑 Hasheando contraseña...");
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log("✅ Contraseña hasheada");
            
            const [result] = await pool.query(
                `INSERT INTO usuarios (correo, contraseña, nombre, tipo_usuario) 
                 VALUES (?, ?, ?, ?)`,
                [email, hashedPassword, nombre, tipoUsuario]
            );

            const usuarioId = result.insertId;

            console.log("✅ Usuario creado en BD con ID:", usuarioId);

            await pool.query(
                'INSERT INTO seguridad_usuario (usuario_id) VALUES (?)',
                [usuarioId]
            );
            console.log("✅ Registro de seguridad creado");
            
            return new Usuario(
                usuarioId,
                email,
                hashedPassword,
                nombre,
                tipoUsuario
            );
        } catch (error) {
            console.error('❌ Error al crear usuario:', error);
            throw new Error('Error al crear usuario: ' + error.message);
        }
    }

    async verificarPassword(password) {
        try {
            console.log("🔐 Verificando contraseña...");
            console.log("📝 Contraseña recibida:", password);
            console.log("🔑 Hash en BD:", this.password);
            
            const esValido = await bcrypt.compare(password, this.password);
            console.log("✅ Resultado verificación:", esValido);
            
            return esValido;
        } catch (error) {
            console.error('❌ Error en verificación de contraseña:', error);
            return false;
        }
    }

    getInfo() {
        return {
            id: this.id,
            email: this.email,
            nombre: this.nombre,
            tipoUsuario: this.tipoUsuario
        };
    }
}

module.exports = Usuario;
