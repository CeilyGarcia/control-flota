const request = require('supertest');
const express = require('express');

// Creamos una versión SIMPLIFICADA de nuestra API para pruebas
// (así no dependemos de la base de datos real)

const app = express();
app.use(express.json());

// Simular login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === '123456') {
        res.json({ 
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sIjoiYWRtaW4ifQ.firma',
            rol: 'administrador'
        });
    } else {
        res.status(401).json({ error: 'Credenciales incorrectas' });
    }
});

// Simular obtener unidades
app.get('/api/unidades', (req, res) => {
    res.json([
        { id: 1, placa: 'ABC-123', modelo: 'Toyota', estado: 'activa', lat: 14.6349, lng: -90.5069 },
        { id: 2, placa: 'XYZ-789', modelo: 'Mercedes', estado: 'activa', lat: 14.6200, lng: -90.5200 }
    ]);
});

// Simular crear unidad (requiere token)
app.post('/api/unidades', (req, res) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }
    
    const { placa, modelo } = req.body;
    
    if (!placa || !modelo) {
        return res.status(400).json({ error: 'Placa y modelo requeridos' });
    }
    
    res.json({ 
        id: 99, 
        mensaje: 'Unidad creada exitosamente',
        placa: placa,
        modelo: modelo,
        lat: 14.6349,
        lng: -90.5069
    });
});

// ===== PRUEBAS DE INTEGRACIÓN =====

describe('Pruebas de Integración - API de Control de Flota', () => {
    
    // Prueba 1: Login exitoso
    test('POST /api/login - Debe retornar token con credenciales correctas', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({ username: 'admin', password: '123456' });
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('rol', 'administrador');
    });
    
    // Prueba 2: Login fallido
    test('POST /api/login - Debe fallar con contraseña incorrecta', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({ username: 'admin', password: 'wrong' });
        
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('error');
    });
    
    // Prueba 3: Obtener unidades
    test('GET /api/unidades - Debe retornar lista de unidades', async () => {
        const response = await request(app).get('/api/unidades');
        
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('placa');
    });
    
    // Prueba 4: Crear unidad con token
    test('POST /api/unidades - Debe crear unidad con token válido', async () => {
        const response = await request(app)
            .post('/api/unidades')
            .set('Authorization', 'Bearer token-falso-pero-validado')
            .send({ placa: 'TEST-001', modelo: 'Unidad de prueba' });
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('mensaje');
        expect(response.body.mensaje).toContain('exitosa');
    });
    
    // Prueba 5: Crear unidad sin token (debe fallar)
    test('POST /api/unidades - Debe fallar sin token de autenticación', async () => {
        const response = await request(app)
            .post('/api/unidades')
            .send({ placa: 'TEST-002', modelo: 'Unidad sin token' });
        
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('error');
    });
    
    // Prueba 6: Crear unidad sin placa (debe fallar)
    test('POST /api/unidades - Debe fallar sin placa', async () => {
        const response = await request(app)
            .post('/api/unidades')
            .set('Authorization', 'Bearer token-falso')
            .send({ modelo: 'Solo modelo' });
        
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toMatch(/placa|requerido/i);
    });
});