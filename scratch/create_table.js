const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'c:/Users/qfue1/OneDrive/Desktop/.env' });

async function createTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    const sql = `
        CREATE TABLE IF NOT EXISTS Conocimiento (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre_video VARCHAR(255),
            transcripcion_ai LONGTEXT,
            resumen_clave TEXT,
            fecha_procesado DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await connection.execute(sql);
        console.log('✅ Tabla "Conocimiento" creada o ya existente.');
    } catch (err) {
        console.error('❌ Error al crear la tabla:', err.message);
    } finally {
        await connection.end();
    }
}

createTable();
