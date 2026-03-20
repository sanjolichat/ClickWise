require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
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

    const replyToken = crypto.randomBytes(20).toString('hex');
    db.prepare('UPDATE contact_submissions SET reply_token = ? WHERE id = ?')
      .run(replyToken, result.lastInsertRowid);

    if (process.env.RESEND_API_KEY && process.env.NOTIFY_TO) {
        const appUrl = process.env.APP_URL || '';
        const replyUrl = `${appUrl}/reply?id=${result.lastInsertRowid}&token=${replyToken}`;
        const nameSafe = name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const emailSafe = email.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const messageSafe = message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
        resend.emails.send({
            from: 'ClickWise <contact@clickwise.us>',
            to: process.env.NOTIFY_TO,
            replyTo: email,
            subject: `ClickWise contact from ${name}`,
            text: `${name} (${email}) sent a message:\n\n${message}\n\nReply here: ${replyUrl}`,
            html: `
                <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
                    <p style="font-size:16px;margin-bottom:8px;"><strong>${nameSafe}</strong> &lt;${emailSafe}&gt; sent a message via ClickWise:</p>
                    <blockquote style="border-left:3px solid #4ade80;margin:0;padding:12px 16px;background:#f9fafb;font-size:15px;line-height:1.6;">
                        ${messageSafe}
                    </blockquote>
                    <p style="margin-top:24px;">
                        <a href="${replyUrl}" style="background:#4ade80;color:#1a1a1a;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Reply as contact@clickwise.us</a>
                    </p>
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
            from: 'ClickWise <contact@clickwise.us>',
            to: process.env.NOTIFY_TO,
            subject: 'ClickWise – test email',
            text: 'If you received this, Resend is working correctly.'
        });
        res.json({ success: true, to: process.env.NOTIFY_TO });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Reply ────────────────────────────────────────────────────────────────────

// GET /reply – serve the reply page
app.get('/reply', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/reply.html'));
});

// GET /api/reply-info?id=X&token=Y
app.get('/api/reply-info', (req, res) => {
    const { id, token } = req.query;
    const sub = db.prepare('SELECT name, email, message FROM contact_submissions WHERE id = ? AND reply_token = ?').get(id, token);
    if (!sub) return res.status(403).json({ error: 'Invalid or expired link.' });
    res.json(sub);
});

// POST /api/reply
app.post('/api/reply', async (req, res) => {
    const { id, token, replyText } = req.body;
    if (!replyText || !replyText.trim()) return res.status(400).json({ error: 'Reply text is required.' });
    const sub = db.prepare('SELECT name, email FROM contact_submissions WHERE id = ? AND reply_token = ?').get(id, token);
    if (!sub) return res.status(403).json({ error: 'Invalid or expired link.' });
    try {
        await resend.emails.send({
            from: 'ClickWise <contact@clickwise.us>',
            to: sub.email,
            replyTo: 'contact@clickwise.us',
            subject: 'Re: Your message to ClickWise',
            text: replyText,
            html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;font-size:15px;line-height:1.6;">${replyText.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>`
        });
        res.json({ success: true });
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
