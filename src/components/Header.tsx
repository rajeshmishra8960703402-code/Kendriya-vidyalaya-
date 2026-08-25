import React from 'react';
import { AppConfig, ActiveTab } from '../types';
import { KVSLogo } from './KVSLogo';
import { BookOpen, Calendar, Clock, Lock, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  appConfig: AppConfig;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isTeacherAuthenticated: boolean;
  totalHomeworkCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  appConfig,
  activeTab,
  onTabChange,
  isTeacherAuthenticated,
  totalHomeworkCount
}) => {
  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e5e1da] shadow-2xs">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5">
        {/* Top bar with School Logo and Information */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <KVSLogo size={42} appConfig={appConfig} />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase text-[#4a5d23] bg-[#eef0e7] px-1.5 py-0.2 rounded border border-[#4a5d23]/30">
                  PM SHRI KVS
                </span>
                <span className="text-[10px] font-bold text-[#8c8577]">
                  {appConfig.shiftInfo}
                </span>
                <span className="text-[10px] font-semibold text-[#8c8577]">
                  • {appConfig.classInfo}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-[#2d3a16] tracking-tight leading-tight truncate mt-0.5">
                {appConfig.institutionName}
              </h1>
            </div>
          </div>

          {/* Right quick status & Faculty lock button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden sm:inline-flex text-[11px] font-semibold text-[#7a7467] bg-[#f8f6f0] px-2.5 py-1 rounded-xl border border-[#e5e1da]">
              📅 {todayStr}
            </span>

            <button
              onClick={() => onTabChange('faculty')}
              title={isTeacherAuthenticated ? 'Faculty Portal (Logged In)' : 'Faculty Login (Teacher Only)'}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isTeacherAuthenticated
                  ? 'bg-[#4a5d23] text-white shadow-2xs'
                  : activeTab === 'faculty'
                  ? 'bg-[#2d3a16] text-white'
                  : 'bg-[#f8f6f0] hover:bg-[#eef0e7] text-[#2d3a16] border border-[#e5e1da]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isTeacherAuthenticated ? 'Teacher Panel' : 'Faculty Login'}</span>
            </button>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-[#f0eee8] overflow-x-auto no-scrollbar">
          <button
            onClick={() => onTabChange('homework')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'homework'
                ? 'bg-[#2d3a16] text-white shadow-2xs'
                : 'bg-[#fcfbf9] hover:bg-[#f2efe9] text-[#6d6657] border border-[#e5e1da]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Homework PDFs</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'homework' ? 'bg-white/20 text-white' : 'bg-[#e5e1da] text-[#2d3a16]'
            }`}>
              {totalHomeworkCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('timetable')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'timetable'
                ? 'bg-[#2d3a16] text-white shadow-2xs'
                : 'bg-[#fcfbf9] hover:bg-[#f2efe9] text-[#6d6657] border border-[#e5e1da]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Class Timetable</span>
          </button>

          <button
            onClick={() => onTabChange('datesheet')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'datesheet'
                ? 'bg-[#2d3a16] text-white shadow-2xs'
                : 'bg-[#fcfbf9] hover:bg-[#f2efe9] text-[#6d6657] border border-[#e5e1da]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Exam Date Sheet</span>
          </button>
        </div>
      </div>
    </header>
  );
};
