import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveTab,
  HomeworkItem,
  ScheduleDocument,
  AppConfig
} from './types';
import {
  getLocalCache,
  saveLocalCache,
  fetchPortalData
} from './utils/storage';
import { Header } from './components/Header';
import { HomeworkList } from './components/HomeworkList';
import { TimetableView } from './components/TimetableView';
import { DateSheetView } from './components/DateSheetView';
import { FacultyPortal } from './components/FacultyPortal';
import { PDFPreviewModal } from './components/PDFPreviewModal';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('homework');

  // Initial cached state for instant render
  const initialCache = getLocalCache();
  const [appConfig, setAppConfig] = useState<AppConfig>(initialCache.config);
  const [homeworkItems, setHomeworkItems] = useState<HomeworkItem[]>(initialCache.homework);
  const [timetableDoc, setTimetableDoc] = useState<ScheduleDocument | null>(initialCache.timetable);
  const [datesheetDoc, setDatesheetDoc] = useState<ScheduleDocument | null>(initialCache.datesheet);

  // Faculty Authentication State
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(false);

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<HomeworkItem | ScheduleDocument | null>(null);

  // Sync with Server (fetches community data so all students see teacher uploads live)
  const syncWithServer = useCallback(async () => {
    const serverData = await fetchPortalData();
    if (serverData) {
      if (Array.isArray(serverData.homework)) {
        setHomeworkItems(serverData.homework);
      }
      setTimetableDoc(serverData.timetable !== undefined ? serverData.timetable : null);
      setDatesheetDoc(serverData.datesheet !== undefined ? serverData.datesheet : null);
      if (serverData.config) {
        setAppConfig((prev) => ({ ...prev, ...serverData.config }));
      }
    }
  }, []);

  // On Mount: Immediate server fetch + periodic auto-poll every 3.5s + on tab focus
  useEffect(() => {
    syncWithServer();

    // Auto-polling so all connected student devices stay updated in real time
    const interval = setInterval(() => {
      syncWithServer();
    }, 3500);

    const handleFocus = () => {
      syncWithServer();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncWithServer]);

  // Keep local storage cache updated
  useEffect(() => {
    saveLocalCache({
      homework: homeworkItems,
      timetable: timetableDoc,
      datesheet: datesheetDoc,
      config: appConfig
    });
  }, [homeworkItems, timetableDoc, datesheetDoc, appConfig]);

  // Handlers for Homework
  const handleAddHomework = (newItem: HomeworkItem) => {
    setHomeworkItems((prev) => [newItem, ...prev.filter((h) => h.id !== newItem.id)]);
  };

  const handleDeleteHomework = (id: string) => {
    setHomeworkItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#fdfcf9] text-[#2d3a16] font-sans flex flex-col selection:bg-[#4a5d23] selection:text-white">
      {/* Persistent Simple Header with Logo & Tabs */}
      <Header
        appConfig={appConfig}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isTeacherAuthenticated={isTeacherAuthenticated}
        totalHomeworkCount={homeworkItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {activeTab === 'homework' && (
          <HomeworkList
            homeworkItems={homeworkItems}
            onPreview={setPreviewItem}
            onGoToFaculty={() => setActiveTab('faculty')}
          />
        )}

        {activeTab === 'timetable' && (
          <TimetableView
            timetableDoc={timetableDoc}
            onPreview={setPreviewItem}
            onGoToFaculty={() => setActiveTab('faculty')}
          />
        )}

        {activeTab === 'datesheet' && (
          <DateSheetView
            datesheetDoc={datesheetDoc}
            onPreview={setPreviewItem}
            onGoToFaculty={() => setActiveTab('faculty')}
          />
        )}

        {activeTab === 'faculty' && (
          <FacultyPortal
            appConfig={appConfig}
            onUpdateAppConfig={setAppConfig}
            homeworkItems={homeworkItems}
            onAddHomework={handleAddHomework}
            onDeleteHomework={handleDeleteHomework}
            timetableDoc={timetableDoc}
            onUpdateTimetable={setTimetableDoc}
            datesheetDoc={datesheetDoc}
            onUpdateDatesheet={setDatesheetDoc}
            isAuthenticated={isTeacherAuthenticated}
            onAuthenticate={setIsTeacherAuthenticated}
          />
        )}
      </main>

      {/* Document & PDF Preview Modal */}
      <PDFPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />

      {/* Simple, Clean Footer */}
      <footer className="mt-auto border-t border-[#e5e1da] bg-white py-4 px-3 text-center text-xs text-[#8c8577]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-[#6d6657]">
            {appConfig.institutionName} • {appConfig.classInfo} ({appConfig.shiftInfo})
          </p>
          <p className="text-[11px]">
            Official Daily Homework, Timetable & Date Sheet Portal
          </p>
        </div>
      </footer>
    </div>
  );
}
