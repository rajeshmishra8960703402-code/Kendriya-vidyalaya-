import { HomeworkItem, ScheduleDocument, AppConfig, PortalDataResponse } from '../types';
import {
  INITIAL_HOMEWORK,
  INITIAL_TIMETABLE,
  INITIAL_DATESHEET,
  INITIAL_APP_CONFIG
} from '../data/initialData';

const LOCAL_CACHE_KEY = 'kvs_sitapur_portal_cache_v2';

// Save full data cache to localStorage for instant startup & offline support
export const saveLocalCache = (data: {
  homework: HomeworkItem[];
  timetable: ScheduleDocument | null;
  datesheet: ScheduleDocument | null;
  config: AppConfig;
}) => {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving local cache:', err);
  }
};

// Load cached data synchronously for instant zero-flicker render
export const getLocalCache = (): {
  homework: HomeworkItem[];
  timetable: ScheduleDocument | null;
  datesheet: ScheduleDocument | null;
  config: AppConfig;
} => {
  try {
    const cached = localStorage.getItem(LOCAL_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        homework: Array.isArray(parsed.homework) ? parsed.homework : INITIAL_HOMEWORK,
        timetable: parsed.timetable !== undefined ? parsed.timetable : INITIAL_TIMETABLE,
        datesheet: parsed.datesheet !== undefined ? parsed.datesheet : INITIAL_DATESHEET,
        config: { ...INITIAL_APP_CONFIG, ...(parsed.config || {}) }
      };
    }
  } catch (err) {
    console.error('Error reading local cache:', err);
  }
  return {
    homework: INITIAL_HOMEWORK,
    timetable: INITIAL_TIMETABLE,
    datesheet: INITIAL_DATESHEET,
    config: INITIAL_APP_CONFIG
  };
};

// ----------------- SERVER API INTEGRATIONS -----------------

// Fetch all community portal data from the server
export const fetchPortalData = async (): Promise<PortalDataResponse | null> => {
  try {
    const res = await fetch('/api/data', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    if (res.ok) {
      const data: PortalDataResponse = await res.json();
      saveLocalCache({
        homework: data.homework,
        timetable: data.timetable,
        datesheet: data.datesheet,
        config: data.config
      });
      return data;
    }
  } catch (err) {
    console.warn('Could not fetch latest data from server, using local data:', err);
  }
  return null;
};

// Add homework PDF via API
export const apiAddHomework = async (item: HomeworkItem): Promise<HomeworkItem[] | null> => {
  try {
    const res = await fetch('/api/homework', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (res.ok) {
      const result = await res.json();
      return result.homework;
    }
  } catch (err) {
    console.error('Error uploading homework to server:', err);
  }
  return null;
};

// Delete homework PDF via API
export const apiDeleteHomework = async (id: string): Promise<HomeworkItem[] | null> => {
  try {
    const res = await fetch(`/api/homework/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      const result = await res.json();
      return result.homework;
    }
  } catch (err) {
    console.error('Error deleting homework on server:', err);
  }
  return null;
};

// Update timetable document via API
export const apiUpdateTimetable = async (doc: ScheduleDocument | null): Promise<ScheduleDocument | null> => {
  try {
    if (doc) {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      });
      if (res.ok) {
        const result = await res.json();
        return result.timetable;
      }
    } else {
      const res = await fetch('/api/timetable', { method: 'DELETE' });
      if (res.ok) {
        return null;
      }
    }
  } catch (err) {
    console.error('Error updating timetable on server:', err);
  }
  return doc;
};

// Update exam datesheet document via API
export const apiUpdateDatesheet = async (doc: ScheduleDocument | null): Promise<ScheduleDocument | null> => {
  try {
    if (doc) {
      const res = await fetch('/api/datesheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      });
      if (res.ok) {
        const result = await res.json();
        return result.datesheet;
      }
    } else {
      const res = await fetch('/api/datesheet', { method: 'DELETE' });
      if (res.ok) {
        return null;
      }
    }
  } catch (err) {
    console.error('Error updating datesheet on server:', err);
  }
  return doc;
};

// Update school branding & config via API
export const apiUpdateConfig = async (config: AppConfig): Promise<AppConfig | null> => {
  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (res.ok) {
      const result = await res.json();
      return result.config;
    }
  } catch (err) {
    console.error('Error updating config on server:', err);
  }
  return config;
};

// Verify faculty PIN with server
export const apiVerifyTeacherPin = async (inputPin: string): Promise<boolean> => {
  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: inputPin })
    });
    if (res.ok) {
      const result = await res.json();
      return !!result.success;
    }
  } catch (err) {
    console.error('Error verifying PIN with server:', err);
  }
  // Local fallback
  return inputPin === '1234' || inputPin === '1122';
};

// Update faculty PIN on server
export const apiUpdateTeacherPin = async (newPin: string): Promise<boolean> => {
  try {
    const res = await fetch('/api/auth/change-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPin })
    });
    if (res.ok) {
      const result = await res.json();
      return !!result.success;
    }
  } catch (err) {
    console.error('Error updating PIN on server:', err);
  }
  return false;
};

// Download helper for PDF and documents
export const downloadFile = (fileName: string, fileData?: string): void => {
  try {
    let downloadUrl = fileData;
    if (!downloadUrl || (!downloadUrl.startsWith('data:') && !downloadUrl.startsWith('blob:') && !downloadUrl.startsWith('http'))) {
      const cached = getLocalCache();
      const content = `${cached.config.institutionName} (${cached.config.shiftInfo})\n${cached.config.classInfo}\n\nDocument: ${fileName}\nDate: ${new Date().toLocaleDateString('en-IN')}\n\n[Official PDF Study & Homework Document for Class 11th]`;
      const blob = new Blob([content], { type: 'application/pdf;charset=utf-8' });
      downloadUrl = URL.createObjectURL(blob);
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('Download error:', err);
  }
};
