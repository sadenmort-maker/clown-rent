require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authMiddleware = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// REGISTER
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email.includes('@')) return res.status(400).json({ error: "Invalid email" });
    if (password.length < 4) return res.status(400).json({ error: "Short password" });

    const hash = await bcrypt.hash(password, 5);

    try {
        const user = await prisma.user.create({
            data: { email, password: hash }
        });
        res.json(user);
    } catch {
        res.status(400).json({ error: "User exists" });
    }
});

// LOGIN
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.banned) return res.status(403).json({ error: "Banned" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong password" });

    await prisma.user.update({
        where: { email },
        data: { lastActive: new Date() }
    });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token });
});

// USERS
app.get('/users', authMiddleware, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "No access" });

    const users = await prisma.user.findMany();
    res.json(users);
});

app.post('/users/:id/ban', authMiddleware, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "No access" });

    await prisma.user.update({
        where: { id: Number(req.params.id) },
        data: { banned: true }
    });

    res.json({ message: "Banned" });
});

app.post('/users/:id/unban', authMiddleware, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "No access" });

    await prisma.user.update({
        where: { id: Number(req.params.id) },
        data: { banned: false }
    });

    res.json({ message: "Unbanned" });
});

// PRODUCTS
app.get('/products', async (req, res) => {
    const products = await prisma.product.findMany();
    res.json(products);
});

app.post('/products', authMiddleware, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "No access" });

    const { name, price } = req.body;

    const product = await prisma.product.create({
        data: { name, price: Number(price) }
    });

    res.json(product);
});

app.delete('/products/:id', authMiddleware, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "No access" });

    await prisma.product.delete({
        where: { id: Number(req.params.id) }
    });

    res.json({ message: "Deleted" });
});

app.listen(PORT, () => console.log("Server running"));
