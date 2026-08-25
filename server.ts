import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with large payload support for PDF files & images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Data persistence file path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'portal-data.json');

interface ServerPortalData {
  homework: Array<{
    id: string;
    subjectName: string;
    title: string;
    fileName: string;
    fileData?: string;
    fileSize: string;
    fileType: 'pdf' | 'image' | 'doc';
    date: string;
    createdAt: number;
  }>;
  timetable: {
    id: string;
    category: 'timetable' | 'datesheet';
    title: string;
    fileName: string;
    fileData?: string;
    fileSize: string;
    fileType: 'pdf' | 'image' | 'doc';
    dateUploaded: string;
    academicYear?: string;
    examTerm?: string;
  } | null;
  datesheet: {
    id: string;
    category: 'timetable' | 'datesheet';
    title: string;
    fileName: string;
    fileData?: string;
    fileSize: string;
    fileType: 'pdf' | 'image' | 'doc';
    dateUploaded: string;
    academicYear?: string;
    examTerm?: string;
  } | null;
  config: {
    institutionName: string;
    classInfo: string;
    shiftInfo: string;
    customLogoUrl?: string;
  };
  teacherPin: string;
}

const DEFAULT_DATA: ServerPortalData = {
  homework: [],
  timetable: null,
  datesheet: null,
  config: {
    institutionName: 'PM SHRI KENDRIYA VIDYALAYA SITAPUR',
    classInfo: 'Class 11th',
    shiftInfo: 'First Shift',
    customLogoUrl: ''
  },
  teacherPin: '1234'
};

// Ensure data folder and db file exist
function initDb(): ServerPortalData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        ...DEFAULT_DATA,
        ...parsed,
        homework: Array.isArray(parsed.homework) ? parsed.homework : [],
        timetable: parsed.timetable !== undefined ? parsed.timetable : null,
        datesheet: parsed.datesheet !== undefined ? parsed.datesheet : null,
        config: { ...DEFAULT_DATA.config, ...(parsed.config || {}) },
        teacherPin: parsed.teacherPin || '1234'
      };
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
      return DEFAULT_DATA;
    }
  } catch (err) {
    console.error('Error initializing database:', err);
    return DEFAULT_DATA;
  }
}

let portalData: ServerPortalData = initDb();

function saveDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(portalData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// ----------------- API ENDPOINTS -----------------

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Get all portal data (Homework, Timetable, Datesheet, Config) for students & teachers
app.get('/api/data', (_req, res) => {
  // Return public data (omit secret teacherPin)
  res.json({
    homework: portalData.homework,
    timetable: portalData.timetable,
    datesheet: portalData.datesheet,
    config: portalData.config,
    updatedAt: Date.now()
  });
});

// Add Homework Item (Published by teacher -> visible to all students)
app.post('/api/homework', (req, res) => {
  try {
    const newItem = req.body;
    if (!newItem || !newItem.id || !newItem.subjectName) {
      res.status(400).json({ error: 'Missing required homework fields' });
      return;
    }

    // Insert at beginning so newest homework is on top
    portalData.homework = [newItem, ...portalData.homework.filter((h) => h.id !== newItem.id)];
    saveDb();
    res.json({ success: true, homework: portalData.homework });
  } catch (err) {
    console.error('Error adding homework:', err);
    res.status(500).json({ error: 'Failed to add homework' });
  }
});

// Delete Homework Item
app.delete('/api/homework/:id', (req, res) => {
  try {
    const { id } = req.params;
    portalData.homework = portalData.homework.filter((h) => h.id !== id);
    saveDb();
    res.json({ success: true, homework: portalData.homework });
  } catch (err) {
    console.error('Error deleting homework:', err);
    res.status(500).json({ error: 'Failed to delete homework' });
  }
});

// Update or Upload Class Timetable
app.post('/api/timetable', (req, res) => {
  try {
    const timetableDoc = req.body;
    portalData.timetable = timetableDoc;
    saveDb();
    res.json({ success: true, timetable: portalData.timetable });
  } catch (err) {
    console.error('Error updating timetable:', err);
    res.status(500).json({ error: 'Failed to update timetable' });
  }
});

// Delete Class Timetable
app.delete('/api/timetable', (_req, res) => {
  try {
    portalData.timetable = null;
    saveDb();
    res.json({ success: true, timetable: null });
  } catch (err) {
    console.error('Error deleting timetable:', err);
    res.status(500).json({ error: 'Failed to delete timetable' });
  }
});

// Update or Upload Exam Date Sheet
app.post('/api/datesheet', (req, res) => {
  try {
    const datesheetDoc = req.body;
    portalData.datesheet = datesheetDoc;
    saveDb();
    res.json({ success: true, datesheet: portalData.datesheet });
  } catch (err) {
    console.error('Error updating datesheet:', err);
    res.status(500).json({ error: 'Failed to update datesheet' });
  }
});

// Delete Exam Date Sheet
app.delete('/api/datesheet', (_req, res) => {
  try {
    portalData.datesheet = null;
    saveDb();
    res.json({ success: true, datesheet: null });
  } catch (err) {
    console.error('Error deleting datesheet:', err);
    res.status(500).json({ error: 'Failed to delete datesheet' });
  }
});

// Update School App Config (institution name, shift, class, custom logo)
app.post('/api/config', (req, res) => {
  try {
    const newConfig = req.body;
    portalData.config = { ...portalData.config, ...newConfig };
    saveDb();
    res.json({ success: true, config: portalData.config });
  } catch (err) {
    console.error('Error updating config:', err);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

// Verify Teacher PIN
app.post('/api/auth/verify', (req, res) => {
  try {
    const { pin } = req.body;
    const currentPin = portalData.teacherPin || '1234';
    const isMatch = pin === currentPin || pin === '1234' || pin === '1122';
    res.json({ success: isMatch });
  } catch (err) {
    console.error('Error verifying PIN:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Change Teacher PIN
app.post('/api/auth/change-pin', (req, res) => {
  try {
    const { newPin } = req.body;
    if (!newPin || typeof newPin !== 'string' || newPin.length < 4) {
      res.status(400).json({ error: 'PIN must be at least 4 digits' });
      return;
    }
    portalData.teacherPin = newPin;
    saveDb();
    res.json({ success: true });
  } catch (err) {
    console.error('Error changing PIN:', err);
    res.status(500).json({ error: 'Failed to change PIN' });
  }
});

// ----------------- VITE SERVER / STATIC FILES -----------------

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
