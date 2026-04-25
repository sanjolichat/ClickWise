const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'clickwise.db'));
db.pragma('journal_mode = WAL');

// ── Schema ─────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS tools (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    site       TEXT,
    risk       TEXT NOT NULL CHECK(risk IN ('low','medium','high')),
    summary    TEXT,
    content    TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS guides (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT,
    content     TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contact_submissions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    message    TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// ── Seed Tools ─────────────────────────────────────────────────────────────
const toolSeed = [
  {
    id: 'khanmigo',
    name: 'Khanmigo',
    site: 'khanmigo.org',
    risk: 'low',
    summary: 'AI tutor. Socratic method. Minimal data. Nonprofit. No ads.',
    content: '<h3>What It Does</h3><p>AI tutor by Khan Academy using Socratic method—asks guiding questions rather than giving answers.</p><h3>Data Collection: Low</h3><p>Minimal data required. Parental consent for under 18.</p><h3>Data Protection: Low</h3><p>Nonprofit model. Encrypted. No breaches reported.</p><h3>Third-Party Sharing: Low</h3><p>No data selling. No ads.</p><h3>Legal Compliance: Low</h3><p>COPPA and FERPA compliant.</p><h3>Academic Integrity: Low</h3><p>Designed to teach concepts, not provide shortcuts.</p><h3>Recommendation</h3><p>One of the safest AI tools for students. Highly recommended.</p>'
  },
  {
    id: 'khan-academy',
    name: 'Khan Academy',
    site: 'khanacademy.org',
    risk: 'low',
    summary: 'Educational videos. Nonprofit. No breaches.',
    content: '<h3>What It Does</h3><p>Free platform with educational videos, practice problems, and progress tracking.</p><h3>Data Collection: Low</h3><p>Minimal. Only needs email for progress tracking.</p><h3>Data Protection: Low</h3><p>Nonprofit. No breaches in history.</p><h3>Third-Party Sharing: Low</h3><p>No ads. No data selling.</p><h3>Legal Compliance: Low</h3><p>COPPA and FERPA compliant.</p><h3>Academic Integrity: Low</h3><p>Educational content designed to teach concepts.</p><h3>Recommendation</h3><p>Excellent, trustworthy resource. Highly recommended.</p>'
  },
  {
    id: 'wolfram',
    name: 'Wolfram Alpha',
    site: 'wolframalpha.com',
    risk: 'low',
    summary: 'Math solver. Shows methodology. Encrypted.',
    content: '<h3>What It Does</h3><p>Computational knowledge engine solving math and science problems with explanations.</p><h3>Data Collection: Low</h3><p>Minimal. Clear privacy policy.</p><h3>Data Protection: Low</h3><p>HTTPS encryption. Industry standard.</p><h3>Third-Party Sharing: Low</h3><p>No ads in Pro version.</p><h3>Legal Compliance: Low</h3><p>Transparent practices.</p><h3>Academic Integrity: Low</h3><p>Shows methodology, not just answers.</p><h3>Recommendation</h3><p>Excellent for learning methodology.</p>'
  },
  {
    id: 'quizlet',
    name: 'Quizlet',
    site: 'quizlet.com',
    risk: 'low',
    summary: 'Flashcards. Free version. COPPA compliant.',
    content: '<h3>What It Does</h3><p>Study platform with flashcards and spaced repetition.</p><h3>Data Collection: Low</h3><p>Student-friendly. Free version available.</p><h3>Data Protection: Low</h3><p>Secure infrastructure.</p><h3>Third-Party Sharing: Low</h3><p>Ads in free version. Premium removes ads.</p><h3>Legal Compliance: Low</h3><p>COPPA compliant.</p><h3>Academic Integrity: Low</h3><p>Encourages learning. No cheating.</p><h3>Recommendation</h3><p>Legitimate study tool.</p>'
  },
  {
    id: 'geogebra',
    name: 'GeoGebra',
    site: 'geogebra.org',
    risk: 'low',
    summary: 'Math visualization. Free. No ads. No tracking.',
    content: '<h3>What It Does</h3><p>Mathematics software for visualizing geometry, algebra, and calculus.</p><h3>Data Collection: Low</h3><p>Minimal. Free without account.</p><h3>Data Protection: Low</h3><p>Regular security updates.</p><h3>Third-Party Sharing: Low</h3><p>No ads. No tracking.</p><h3>Legal Compliance: Low</h3><p>Educational focus. Student-safe.</p><h3>Academic Integrity: Low</h3><p>Teaches visualization of concepts.</p><h3>Recommendation</h3><p>Perfect for understanding math visually.</p>'
  },
  {
    id: 'ck12',
    name: 'CK-12 Foundation',
    site: 'ck12.org',
    risk: 'low',
    summary: 'Free textbooks. Nonprofit. Student-safe.',
    content: '<h3>What It Does</h3><p>Nonprofit providing free, open-source textbooks and educational content.</p><h3>Data Collection: Low</h3><p>Minimal. Free to use.</p><h3>Data Protection: Low</h3><p>Nonprofit transparency.</p><h3>Third-Party Sharing: Low</h3><p>No ads. No tracking.</p><h3>Legal Compliance: Low</h3><p>Nonprofit focused on education.</p><h3>Academic Integrity: Low</h3><p>Educational content only.</p><h3>Recommendation</h3><p>Great free textbook resource.</p>'
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    site: 'openai.com/chatgpt',
    risk: 'medium',
    summary: 'AI assistant. Data used for training. Can enable plagiarism.',
    content: '<h3>What It Does</h3><p>AI assistant for writing, brainstorming, explaining.</p><h3>Data Collection: Medium</h3><p>Requires account. Collects usage data and conversations.</p><h3>Data Protection: Medium</h3><p>Encrypted but data used for training.</p><h3>Third-Party Sharing: Medium</h3><p>Unclear data sharing practices.</p><h3>Legal Compliance: Medium</h3><p>Age restrictions but enforcement unclear.</p><h3>Academic Integrity: Medium</h3><p>Powerful but easily misused for cheating.</p><h3>Recommendation</h3><p>Use responsibly. Follow school policies.</p>'
  },
  {
    id: 'google-classroom',
    name: 'Google Classroom',
    site: 'classroom.google.com',
    risk: 'medium',
    summary: 'School LMS. Google tracking. COPPA compliant.',
    content: '<h3>What It Does</h3><p>Learning management system for schools.</p><h3>Data Collection: Medium</h3><p>Google account required. Google tracking.</p><h3>Data Protection: Low</h3><p>Strong Google encryption.</p><h3>Third-Party Sharing: Medium</h3><p>Google ecosystem integration.</p><h3>Legal Compliance: Low</h3><p>COPPA & FERPA compliant.</p><h3>Academic Integrity: Low</h3><p>School-managed platform.</p><h3>Recommendation</h3><p>Safe for school use. Standard platform.</p>'
  },
  {
    id: 'photomath',
    name: 'Photomath',
    site: 'photomath.app',
    risk: 'medium',
    summary: 'Math scanner. Usage tracking. Ads present.',
    content: '<h3>What It Does</h3><p>Scan math problems, get step solutions.</p><h3>Data Collection: Medium</h3><p>Account required. Usage tracking.</p><h3>Data Protection: Low</h3><p>HTTPS encryption.</p><h3>Third-Party Sharing: Medium</h3><p>Ads in free version.</p><h3>Legal Compliance: Medium</h3><p>Limited parental controls.</p><h3>Academic Integrity: Medium</h3><p>Easy to misuse as shortcut.</p><h3>Recommendation</h3><p>Use for checking work, not solving.</p>'
  },
  {
    id: 'mathway',
    name: 'Mathway',
    site: 'mathway.com',
    risk: 'medium',
    summary: 'Math solver. Free with ads. Limited transparency.',
    content: '<h3>What It Does</h3><p>Math problem solver with step solutions.</p><h3>Data Collection: Medium</h3><p>Account optional. Free tier available.</p><h3>Data Protection: Low</h3><p>HTTPS encrypted.</p><h3>Third-Party Sharing: Medium</h3><p>Ads in free version.</p><h3>Legal Compliance: Medium</h3><p>Limited transparency.</p><h3>Academic Integrity: Medium</h3><p>Can enable cheating.</p><h3>Recommendation</h3><p>Use carefully. Check understanding.</p>'
  },
  {
    id: 'duolingo',
    name: 'Duolingo',
    site: 'duolingo.com',
    risk: 'medium',
    summary: 'Language learning. 2.6M breach in 2023. Ads.',
    content: '<h3>What It Does</h3><p>Gamified language learning with AI.</p><h3>Data Collection: Medium</h3><p>Extensive tracking. Voice data collected.</p><h3>Data Protection: Medium</h3><p>2.6M user breach in August 2023. SSL encrypted.</p><h3>Third-Party Sharing: Medium</h3><p>Shares with ad networks and analytics.</p><h3>Legal Compliance: Low</h3><p>Parental consent obtained. COPPA compliant.</p><h3>Academic Integrity: Low</h3><p>Legitimate language tool.</p><h3>Recommendation</h3><p>Effective but privacy concerns. Check school policy.</p>'
  },
  {
    id: 'studybay',
    name: 'StudyBay',
    site: 'studybay.com',
    risk: 'high',
    summary: 'Essay writing. Cheating facilitation. Data breach risk.',
    content: '<h3>What It Does</h3><p>Essay writing and homework completion service.</p><h3>Data Collection: High</h3><p>Excessive personal and financial data.</p><h3>Data Protection: High</h3><p>Minimal security. Breach risk.</p><h3>Third-Party Sharing: High</h3><p>Data sharing to other services.</p><h3>Legal Compliance: High</h3><p>Violates conduct policies.</p><h3>Academic Integrity: High</h3><p>Direct cheating facilitation.</p><h3>Recommendation</h3><p>AVOID COMPLETELY. Expulsion & data risk.</p>'
  },
  {
    id: 'chegg',
    name: 'Chegg Essays',
    site: 'chegg.com/essay-writing',
    risk: 'high',
    summary: 'Homework completion. Violates student conduct.',
    content: '<h3>What It Does</h3><p>Professional essay writing service.</p><h3>Data Collection: High</h3><p>Financial and personal information.</p><h3>Data Protection: High</h3><p>Limited security.</p><h3>Third-Party Sharing: High</h3><p>Unclear sharing.</p><h3>Legal Compliance: High</h3><p>Violates conduct codes.</p><h3>Academic Integrity: High</h3><p>Facilitates plagiarism.</p><h3>Recommendation</h3><p>AVOID COMPLETELY. School expulsion risk.</p>'
  },
  {
    id: 'essaymills',
    name: 'EssayMills.com',
    site: 'essaymills.com',
    risk: 'high',
    summary: 'Essay mill. No privacy. Data sold.',
    content: '<h3>What It Does</h3><p>Custom essay writing service.</p><h3>Data Collection: High</h3><p>No privacy protections.</p><h3>Data Protection: High</h3><p>Unencrypted. Breach risk.</p><h3>Third-Party Sharing: High</h3><p>Data sold.</p><h3>Legal Compliance: High</h3><p>No compliance. Unregulated.</p><h3>Academic Integrity: High</h3><p>Contract cheating. Blackmail risk.</p><h3>Recommendation</h3><p>AVOID COMPLETELY. Expulsion & blackmail risk.</p>'
  },
  {
    id: 'essay-panda',
    name: 'Essay Panda',
    site: 'essaypanda.com',
    risk: 'high',
    summary: 'Essay mill. Contract cheating. Blackmail risks.',
    content: '<h3>What It Does</h3><p>Essay writing service.</p><h3>Data Collection: High</h3><p>Excessive data without transparency.</p><h3>Data Protection: High</h3><p>Minimal security.</p><h3>Third-Party Sharing: High</h3><p>Unclear practices.</p><h3>Legal Compliance: High</h3><p>No educational compliance.</p><h3>Academic Integrity: High</h3><p>Contract cheating. Blackmail risk.</p><h3>Recommendation</h3><p>AVOID COMPLETELY. School violation & career risk.</p>'
  },
  {
    id: 'papersowl',
    name: 'PapersOwl',
    site: 'papersowl.com',
    risk: 'high',
    summary: 'Cheating service. Expulsion risk. School violation.',
    content: '<h3>What It Does</h3><p>Academic cheating service.</p><h3>Data Collection: High</h3><p>Extensive personal & payment data.</p><h3>Data Protection: High</h3><p>No security transparency.</p><h3>Third-Party Sharing: High</h3><p>Unclear sharing.</p><h3>Legal Compliance: High</h3><p>Violates policies.</p><h3>Academic Integrity: High</h3><p>Direct cheating.</p><h3>Recommendation</h3><p>AVOID COMPLETELY. Expulsion risk & permanent record.</p>'
  }
];

const insertTool = db.prepare(`
  INSERT OR IGNORE INTO tools (id, name, site, risk, summary, content)
  VALUES (@id, @name, @site, @risk, @summary, @content)
`);
const seedTools = db.transaction(() => { for (const t of toolSeed) insertTool.run(t); });
seedTools();

// ── Seed Guides ────────────────────────────────────────────────────────────
const guideSeed = [
  {
    id: 'spotting-unsafe',
    title: 'How to Spot Unsafe Websites',
    description: 'Learn the red flags that indicate a website might be unsafe or untrustworthy.',
    content: "<h1>How to Spot Unsafe Websites</h1><h2>Red Flags to Watch For</h2><p><strong>Too Many Pop-Ups & Ads:</strong> Sketchy sites are filled with aggressive ads and pop-ups.</p><p><strong>Asks for Excessive Personal Information:</strong> Does the site ask for SSN, credit card, or mother's maiden name when it shouldn't? Be suspicious.</p><p><strong>No Privacy Policy:</strong> Every legitimate website has a privacy policy. If you can't find one, that's a huge red flag.</p><p><strong>Suspicious URLs:</strong> Check the website address. Scam sites often misspell real domains (like \"amaz0n.com\").</p><p><strong>No HTTPS:</strong> Look for the padlock icon. If the site doesn't use HTTPS, your data isn't protected.</p><p><strong>Poor Grammar & Spelling:</strong> Professional sites have polished content. Multiple errors indicate an unprofessional site.</p><p><strong>Promises That Sound Too Good:</strong> Free money, guaranteed grades? Probably a scam.</p><p><strong>No Contact Information:</strong> Real companies have ways to contact them.</p><h2>What to Do</h2><p>When you encounter a suspicious website, simply leave and find an alternative. Trust your instincts—if something feels off, it probably is.</p>"
  },
  {
    id: 'privacy-toolkit',
    title: 'Your Digital Privacy Toolkit',
    description: 'Essential tools and practices to protect your personal data online.',
    content: "<h1>Your Digital Privacy Toolkit</h1><h2>Essential Tools & Practices</h2><p><strong>Use Strong, Unique Passwords:</strong> Create 12+ character passwords with uppercase, lowercase, numbers, symbols. Don't reuse passwords.</p><p><strong>Enable Two-Factor Authentication:</strong> This adds extra security. Even if someone has your password, they need the second factor.</p><p><strong>Review Privacy Settings:</strong> Regularly check social media and app privacy settings.</p><p><strong>Be Careful What You Share:</strong> Don't share sensitive info unless necessary.</p><p><strong>Use a Password Manager:</strong> Tools like Bitwarden or 1Password securely store passwords.</p><p><strong>Keep Software Updated:</strong> Updates patch vulnerabilities. Enable automatic updates.</p><p><strong>Check What Data Apps Collect:</strong> Read privacy policies before installing apps.</p><p><strong>Use HTTPS Sites:</strong> Look for the lock icon. Never enter sensitive info on non-HTTPS sites.</p><h2>Your Rights</h2><p>In many countries, you have the right to request what data companies have about you, delete your data, opt out of data selling, and know how your data is used.</p>"
  },
  {
    id: 'academic-integrity',
    title: 'Academic Integrity & AI',
    description: 'Using AI responsibly in your schoolwork without crossing into cheating.',
    content: "<h1>Academic Integrity & AI Ethics</h1><h2>What's OK? What's Not?</h2><p><strong>OK — Use AI to:</strong> Brainstorm ideas, understand concepts, get writing feedback, practice problems, understand tricky topics.</p><p><strong>NOT OK — Use AI to:</strong> Write essays to submit as your own, do your homework, take tests, or submit AI writing without disclosure.</p><h2>The Difference</h2><p>Using AI as a LEARNING TOOL is ethical. Using it as a SHORTCUT that bypasses learning is cheating.</p><h2>Always Cite AI Use</h2><p>If your teacher allows AI, mention which tools you used and how.</p><h2>Check Your School's Policy</h2><p>Different schools have different AI policies. Know your school's rules before using AI tools.</p><h2>Why It Matters</h2><p>When you cheat, you don't learn the material, and the consequences (expulsion, permanent record) can destroy your future.</p>"
  },
  {
    id: 'chatgpt-responsible',
    title: 'How to Use ChatGPT Responsibly',
    description: 'ChatGPT is powerful. Learn best practices, limitations, and when not to use it.',
    content: "<h1>How to Use ChatGPT Responsibly</h1><h2>Best Practices</h2><p><strong>Check Your School's Policy First:</strong> Some schools allow ChatGPT, others don't.</p><p><strong>Use It for Learning, Not Shortcuts:</strong> Ask it to explain concepts, brainstorm ideas. Don't ask it to write essays.</p><p><strong>Always Verify Facts:</strong> ChatGPT can confidently state false information. Cross-check everything.</p><p><strong>Don't Share Sensitive Info:</strong> Your conversations may be reviewed.</p><p><strong>Understand Its Limitations:</strong> It can make mistakes and has a knowledge cutoff date.</p><p><strong>Cite It If You Use It:</strong> Be transparent about AI assistance.</p><h2>Red Flags</h2><p>Don't rely on ChatGPT for medical advice, legal advice, financial decisions, or homework submitted as entirely your own.</p><h2>The Bottom Line</h2><p>ChatGPT is a tool, not a replacement for learning.</p>"
  },
  {
    id: 'data-collection',
    title: 'Understanding Data Collection',
    description: 'What is data collection? How do apps track you? What are your rights?',
    content: "<h1>Understanding Data Collection</h1><h2>What Is Data Collection?</h2><p>Data collection is when apps, websites, and services gather information about you—your location, browsing habits, age, interests, device info, and more.</p><h2>Why Do Companies Collect Data?</h2><p><strong>To Sell to Advertisers:</strong> Your data is valuable. Companies sell it so advertisers can target you.</p><p><strong>To Improve Their Product:</strong> Understanding how you use an app helps them make it better.</p><p><strong>To Make Profit:</strong> Data is currency.</p><h2>What Data Is Collected?</h2><p>Your clicks, searches, location, device info, email, sometimes deleted messages. Apps collect data even when you're not using them.</p><h2>Who Has Access?</h2><p>The company, advertisers, third-party analytics firms, sometimes hackers (if there's a breach).</p><h2>What You Can Do</h2><p><strong>Read Privacy Policies:</strong> Know what you're agreeing to. <strong>Request Your Data:</strong> Many companies let you request what they have. <strong>Limit Tracking:</strong> Turn off location, disable cookies, limit permissions. <strong>Use Privacy Tools:</strong> VPNs, ad blockers, privacy-focused browsers help.</p><h2>The Bigger Picture</h2><p>If a free app has no obvious way to make money, you might be the product—your data is being sold.</p>"
  },
  {
    id: 'critical-thinking',
    title: 'Critical Thinking with AI',
    description: 'AI makes mistakes. Learn to verify information and think critically.',
    content: "<h1>Critical Thinking with AI</h1><h2>Why AI Gets Things Wrong</h2><p>AI models are trained on patterns in text, not on understanding truth. They can confidently state false information. This is called \"hallucinating.\"</p><h2>How to Verify AI Outputs</h2><p><strong>Cross-Check with Reliable Sources:</strong> If ChatGPT claims something, verify it with academic sources or peer-reviewed studies.</p><p><strong>Check Citations:</strong> If AI cites a source, verify that source actually exists and says what AI claims.</p><p><strong>Use Multiple Sources:</strong> Don't rely on AI alone. Use library databases, academic papers, expert sources.</p><h2>Red Flags in AI Responses</h2><p><strong>Overly Confident Tone:</strong> Be suspicious of AI stating opinions as facts. <strong>Vague Citations:</strong> If it cites a source but can't give you a link, verify independently. <strong>Contradicts Multiple Sources:</strong> If AI contradicts reputable sources, trust the reputable sources.</p><h2>Bottom Line</h2><p>AI is a tool, not a source of truth. Always verify important information through multiple sources.</p>"
  }
];

const insertGuide = db.prepare(`
  INSERT OR IGNORE INTO guides (id, title, description, content)
  VALUES (@id, @title, @description, @content)
`);
const seedGuides = db.transaction(() => { for (const g of guideSeed) insertGuide.run(g); });
seedGuides();

module.exports = db;
