require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const db = require('./db');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Tools ───────────────────────────────────────────────────────────────────

// GET /api/tools?risk=low|medium|high
app.get('/api/tools', (req, res) => {
    const { risk } = req.query;
    let tools;
    if (risk && ['low', 'medium', 'high'].includes(risk)) {
        tools = db.prepare(
            'SELECT id, name, site, risk, summary FROM tools WHERE risk = ? ORDER BY name'
        ).all(risk);
    } else {
        tools = db.prepare(
            `SELECT id, name, site, risk, summary FROM tools
             ORDER BY CASE risk WHEN 'low' THEN 1 WHEN 'medium' THEN 2 WHEN 'high' THEN 3 END, name`
        ).all();
    }
    res.json(tools);
});

// GET /api/tools/:id
app.get('/api/tools/:id', (req, res) => {
    const tool = db.prepare('SELECT * FROM tools WHERE id = ?').get(req.params.id);
    if (!tool) return res.status(404).json({ error: 'Tool not found' });
    res.json(tool);
});

// ── Guides ──────────────────────────────────────────────────────────────────

// GET /api/guides
app.get('/api/guides', (req, res) => {
    const guides = db.prepare('SELECT id, title, description FROM guides ORDER BY rowid').all();
    res.json(guides);
});

// GET /api/guides/:id
app.get('/api/guides/:id', (req, res) => {
    const guide = db.prepare('SELECT * FROM guides WHERE id = ?').get(req.params.id);
    if (!guide) return res.status(404).json({ error: 'Guide not found' });
    res.json(guide);
});

// ── Contact ─────────────────────────────────────────────────────────────────

// POST /api/contact
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    const result = db.prepare(
        'INSERT INTO contact_submissions (name, email, message) VALUES (?, ?, ?)'
    ).run(name.trim(), email.trim(), message.trim());

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.NOTIFY_TO || process.env.SMTP_USER,
            subject: `ClickWise contact from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        }).catch(err => console.error('Email send failed:', err));
    }

    res.status(201).json({ success: true, id: result.lastInsertRowid });
});

// ── Test email ───────────────────────────────────────────────────────────────
// GET /api/test-email  – hit this URL to verify SMTP credentials work
app.get('/api/test-email', async (req, res) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return res.status(500).json({ error: 'SMTP_USER or SMTP_PASS env var is not set.' });
    }
    try {
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.NOTIFY_TO || process.env.SMTP_USER,
            subject: 'ClickWise – test email',
            text: 'If you received this, SMTP is working correctly.'
        });
        res.json({ success: true, to: process.env.NOTIFY_TO || process.env.SMTP_USER });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Catch-all ────────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`ClickWise running at http://localhost:${PORT}`);
    console.log(`SMTP configured: ${!!(process.env.SMTP_USER && process.env.SMTP_PASS)}`);
    if (process.env.SMTP_USER) console.log(`SMTP_USER: ${process.env.SMTP_USER}`);
    if (process.env.NOTIFY_TO) console.log(`NOTIFY_TO: ${process.env.NOTIFY_TO}`);
});
