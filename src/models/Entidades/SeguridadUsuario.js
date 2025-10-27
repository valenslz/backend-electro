const pool = require('../../config/bd');

class SeguridadUsuario {
    constructor(usuarioId, intentosFallidos = 0, bloqueado = false, fechaDesbloqueo = null) {
        this.usuarioId = usuarioId;
        this.intentosFallidos = intentosFallidos;
        this.bloqueado = bloqueado;
        this.fechaDesbloqueo = fechaDesbloqueo;
    }

    static async obtenerPorUsuarioId(usuarioId) {
        try {
            const result = await pool.query(
                'SELECT * FROM seguridad_usuario WHERE usuario_id = $1',
                [usuarioId]
            );
            
            if (result.rows.length === 0) {
                // Crear registro si no existe
                await pool.query(
                    'INSERT INTO seguridad_usuario (usuario_id) VALUES ($1)',
                    [usuarioId]
                );
                return new SeguridadUsuario(usuarioId);
            }

            const data = result.rows[0];
            return new SeguridadUsuario(
                data.usuario_id,
                data.intentos_fallidos,
                data.bloqueado,
                data.fecha_desbloqueo
            );
        } catch (error) {
            throw new Error('Error al obtener seguridad de usuario: ' + error.message);
        }
    }

    async registrarIntentoFallido() {
        try {
            this.intentosFallidos += 1;
            
            if (this.intentosFallidos >= 5) {
                this.bloqueado = true;
                const fechaDesbloqueo = new Date();
                fechaDesbloqueo.setMinutes(fechaDesbloqueo.getMinutes() + 30);
                this.fechaDesbloqueo = fechaDesbloqueo;
            }

            await pool.query(
                `UPDATE seguridad_usuario 
                 SET intentos_fallidos = $1, bloqueado = $2, fecha_desbloqueo = $3 
                 WHERE usuario_id = $4`,
                [this.intentosFallidos, this.bloqueado, this.fechaDesbloqueo, this.usuarioId]
            );

            return this.intentosFallidos;
        } catch (error) {
            throw new Error('Error al registrar intento fallido: ' + error.message);
        }
    }

    async reiniciarIntentos() {
        try {
            this.intentosFallidos = 0;
            this.bloqueado = false;
            this.fechaDesbloqueo = null;

            await pool.query(
                `UPDATE seguridad_usuario 
                 SET intentos_fallidos = 0, bloqueado = false, fecha_desbloqueo = NULL 
                 WHERE usuario_id = $1`,
                [this.usuarioId]
            );
        } catch (error) {
            throw new Error('Error al reiniciar intentos: ' + error.message);
        }
    }

    estaBloqueado() {
        if (!this.bloqueado) return false;
        
        if (this.fechaDesbloqueo && new Date() > this.fechaDesbloqueo) {
            this.reiniciarIntentos(); // Auto-desbloqueo
            return false;
        }
        
        return true;
    }

    obtenerIntentosRestantes() {
        return Math.max(0, 5 - this.intentosFallidos);
    }
}

module.exports = SeguridadUsuario;