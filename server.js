const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./flota.db');

//  COORDENADAS ALEATORIAS 
function generarCoordenadasAleatorias() {
    const centroLat = 14.6349;
    const centroLng = -90.5069;
    const rango = 0.08;
    
    const lat = Number((centroLat + (Math.random() - 0.5) * rango * 2).toFixed(6));
    const lng = Number((centroLng + (Math.random() - 0.5) * rango * 2).toFixed(6));
    
    return { lat, lng };
}

// Tablas
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        rol TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS unidades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        placa TEXT UNIQUE,
        modelo TEXT,
        estado TEXT,
        lat REAL,
        lng REAL
    )`);

    // Usuario admin
    db.get("SELECT * FROM usuarios WHERE username = 'admin'", async (err, row) => {
        if (!row) {
            const hash = await bcrypt.hash('123456', 10);
            db.run("INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)", 
                ['admin', hash, 'administrador']);
            console.log('✅ Usuario admin creado');
        }
    });
});

//  RUTAS

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM usuarios WHERE username = ?", [username], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Error en el servidor' });
        if (!user) return res.status(401).json({ error: 'Usuario no existe' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });
        const token = jwt.sign({ id: user.id, rol: user.rol }, 'secreto', { expiresIn: '2h' });
        res.json({ token, rol: user.rol });
    });
});

app.get('/api/unidades', (req, res) => {
    db.all("SELECT id, placa, modelo, estado, lat, lng FROM unidades", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });
    jwt.verify(token, 'secreto', (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.usuario = decoded;
        next();
    });
}

// Crear unidad
app.post('/api/unidades', verificarToken, (req, res) => {
    const { placa, modelo, estado } = req.body;
    
    if (!placa || !modelo) {
        return res.status(400).json({ error: 'Placa y modelo son requeridos' });
    }
    
    const { lat, lng } = generarCoordenadasAleatorias();
    
    console.log(`📝 Registrando: ${placa} en (${lat}, ${lng})`);
    
    db.run("INSERT INTO unidades (placa, modelo, estado, lat, lng) VALUES (?, ?, ?, ?, ?)",
        [placa.toUpperCase(), modelo, estado || 'activa', lat, lng],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'La placa ya existe' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ 
                id: this.lastID,
                mensaje: 'Unidad creada exitosamente',
                placa: placa,
                modelo: modelo,
                lat: lat,
                lng: lng
            });
        });
});

// Eliminar unidad
app.delete('/api/unidades/:id', verificarToken, (req, res) => {
    if (req.usuario.rol !== 'administrador') {
        return res.status(403).json({ error: 'Solo administradores pueden eliminar unidades' });
    }
    
    db.run("DELETE FROM unidades WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Unidad no encontrada' });
        res.json({ mensaje: 'Unidad eliminada' });
    });
});

// Actualizar ubicación
app.put('/api/unidades/:id/ubicacion', verificarToken, (req, res) => {
    const { lat, lng } = req.body;
    db.run("UPDATE unidades SET lat = ?, lng = ? WHERE id = ?", [lat, lng, req.params.id]);
    res.json({ ok: true });
});

app.use(express.static(path.join(__dirname, 'frontend')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log('📝 Cargando usuario con exito');
    console.log('🔑 Cargando contraseña con exito\n');
});