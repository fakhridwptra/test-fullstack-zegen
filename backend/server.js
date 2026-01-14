const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = 'zegen_internship_secret';
let users = []; 
let todos = []; 

// --- Dokumentasi Swagger (OpenAPI 3.0) ---
const swaggerDocument = {
    openapi: '3.0.0',
    info: { 
        title: 'Todo List API - Zegen Internship', 
        version: '1.0.0',
        description: 'API untuk manajemen tugas dengan fitur Auth JWT'
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        }
    },
    paths: {
        '/register': {
            post: {
                summary: 'Daftar User Baru',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, password: { type: 'string' } } } } }
                },
                responses: { 201: { description: 'Berhasil daftar' } }
            }
        },
        '/login': {
            post: {
                summary: 'Login JWT',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, password: { type: 'string' } } } } }
                },
                responses: { 200: { description: 'Token diberikan' } }
            }
        },
        '/todos': {
            get: {
                summary: 'Ambil semua tugas (Perlu Authorize)',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Daftar tugas' } }
            },
            post: {
                summary: 'Tambah tugas baru (Perlu Authorize)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { type: 'object', properties: { task: { type: 'string' } } } } }
                },
                responses: { 201: { description: 'Tugas dibuat' } }
            }
        }
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- Middleware Auth ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Token dibutuhkan" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Token tidak valid" });
        req.user = user;
        next();
    });
};

// --- API Endpoints ---
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Isi data lengkap" });
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.status(201).json({ message: "User berhasil terdaftar" });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Login gagal' });
    }
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

app.get('/todos', authenticateToken, (req, res) => res.json(todos));

app.post('/todos', authenticateToken, (req, res) => {
    const { task } = req.body;
    const item = { id: Date.now(), task, status: 'pending' };
    todos.push(item);
    res.status(201).json(item);
});

app.listen(3000, () => console.log('Backend jalan di http://localhost:3000'));