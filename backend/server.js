require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Resend } = require('resend');
const db = require('./db');

const resend = new Resend(process.env.RESEND_API_KEY);

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

    if (process.env.RESEND_API_KEY && process.env.NOTIFY_TO) {
        const nameSafe = name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const emailSafe = email.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const messageSafe = message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
        const dateSafe = new Date().toLocaleString('en-US', { weekday:'short', year:'numeric', month:'short', day:'numeric', hour:'numeric', minute:'2-digit', hour12:true });
        resend.emails.send({
            from: 'ClickWise <noreply@clickwise.us>',
            to: process.env.NOTIFY_TO,
            replyTo: email,
            subject: `ClickWise contact from ${name}`,
            text: `${name} (${email})\n${dateSafe}\n\n${message}`,
            html: `
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
                    <div style="border-bottom:2px solid #FB6376;padding-bottom:12px;margin-bottom:20px;">
                        <span style="font-size:18px;font-weight:700;color:#5D2A42;">ClickWise</span>
                    </div>
                    <p style="font-size:15px;margin:0 0 4px;color:#374151;">
                        <strong>${nameSafe}</strong> &lt;${emailSafe}&gt;
                    </p>
                    <p style="font-size:13px;margin:0 0 16px;color:#6b7280;">${dateSafe}</p>
                    <div style="background:#FFF9EC;border-left:3px solid #FB6376;padding:16px;border-radius:0 8px 8px 0;margin-bottom:20px;font-size:15px;line-height:1.7;color:#1f2937;">
                        ${messageSafe}
                    </div>
                </div>
            `
        }).catch(err => console.error('Email send failed:', err));
    }

    res.status(201).json({ success: true, id: result.lastInsertRowid });
});

// ── Test email ───────────────────────────────────────────────────────────────
// GET /api/test-email  – hit this URL to verify Resend is working
app.get('/api/test-email', async (req, res) => {
    if (!process.env.RESEND_API_KEY) {
        return res.status(500).json({ error: 'RESEND_API_KEY env var is not set.' });
    }
    if (!process.env.NOTIFY_TO) {
        return res.status(500).json({ error: 'NOTIFY_TO env var is not set.' });
    }
    try {
        await resend.emails.send({
            from: 'ClickWise <noreply@clickwise.us>',
            to: process.env.NOTIFY_TO,
            subject: 'ClickWise – test email',
            text: 'If you received this, Resend is working correctly.'
        });
        res.json({ success: true, to: process.env.NOTIFY_TO });
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
    console.log(`Resend configured: ${!!process.env.RESEND_API_KEY}`);
    if (process.env.NOTIFY_TO) console.log(`NOTIFY_TO: ${process.env.NOTIFY_TO}`);
});
