import React, { useState, useMemo } from 'react';
import { HomeworkItem } from '../types';
import { STANDARD_SUBJECTS } from '../data/initialData';
import { FileText, Download, Eye, Calendar, Search } from 'lucide-react';
import { downloadFile } from '../utils/storage';

interface HomeworkListProps {
  homeworkItems: HomeworkItem[];
  onPreview: (item: HomeworkItem) => void;
  onGoToFaculty?: () => void;
}

export const HomeworkList: React.FC<HomeworkListProps> = ({
  homeworkItems,
  onPreview,
  onGoToFaculty
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all subjects present in current items + standard
  const availableSubjects = useMemo(() => {
    const set = new Set<string>(STANDARD_SUBJECTS);
    homeworkItems.forEach((h) => set.add(h.subjectName));
    return Array.from(set);
  }, [homeworkItems]);

  // Filtered homework list
  const filteredItems = useMemo(() => {
    return homeworkItems.filter((item) => {
      if (selectedSubject !== 'all' && item.subjectName !== selectedSubject) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSubject = item.subjectName.toLowerCase().includes(q);
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesFile = item.fileName.toLowerCase().includes(q);
        const matchesDate = item.date.includes(q);
        return matchesSubject || matchesTitle || matchesFile || matchesDate;
      }
      return true;
    });
  }, [homeworkItems, selectedSubject, searchQuery]);

  const handleDownload = (item: HomeworkItem) => {
    downloadFile(item.fileName, item.fileData);
  };

  return (
    <div className="space-y-4">
      {/* Top Simple Search and Filter Bar */}
      {homeworkItems.length > 0 && (
        <div className="bg-white border border-[#e5e1da] rounded-2xl p-3 shadow-2xs space-y-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c8577]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search homework by subject or file name..."
              className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl bg-[#fcfbf9] border border-[#e0ded8] focus:border-[#4a5d23] focus:ring-1 focus:ring-[#4a5d23]/30 outline-none text-[#2d3a16]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8c8577] hover:text-[#2d3a16] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedSubject === 'all'
                  ? 'bg-[#2d3a16] text-white shadow-2xs'
                  : 'bg-[#f8f6f0] text-[#7a7467] hover:bg-[#eef0e7] border border-[#e5e1da]'
              }`}
            >
              All Subjects ({homeworkItems.length})
            </button>
            {availableSubjects.map((sub) => {
              const count = homeworkItems.filter((h) => h.subjectName === sub).length;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSubject === sub
                      ? 'bg-[#4a5d23] text-white shadow-2xs'
                      : 'bg-[#f8f6f0] text-[#7a7467] hover:bg-[#eef0e7] border border-[#e5e1da]'
                  }`}
                >
                  {sub} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Homework Cards List */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#e0ded8] hover:border-[#4a5d23]/40 rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Left Details: Subject, Date, File */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-[#fee2e2] text-[#b91c1c] border border-[#b91c1c]/20 flex items-center justify-center flex-shrink-0 font-extrabold text-xs shadow-2xs">
                  PDF
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#2d3a16] text-white shadow-2xs">
                      {item.subjectName}
                    </span>
                    <span className="text-[11px] font-semibold text-[#6d6657] bg-[#f8f6f0] px-2 py-0.5 rounded-md border border-[#e5e1da] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#4a5d23]" />
                      <span>{item.date}</span>
                    </span>
                    <span className="text-[11px] text-[#8c8577]">
                      {item.fileSize}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#2d3a16] leading-snug">
                    {item.title || item.fileName}
                  </h3>

                  <p className="text-[11px] text-[#8c8577] font-mono truncate" title={item.fileName}>
                    📄 {item.fileName}
                  </p>
                </div>
              </div>

              {/* Right Action Buttons: View PDF & Download PDF */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f0eee8] flex-shrink-0 justify-end">
                <button
                  onClick={() => onPreview(item)}
                  className="px-3.5 py-2 text-xs font-bold text-[#2d3a16] bg-[#fcfbf9] hover:bg-[#eef0e7] border border-[#d8decb] rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                >
                  <Eye className="w-4 h-4 text-[#4a5d23]" />
                  <span>View PDF</span>
                </button>

                <button
                  onClick={() => handleDownload(item)}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#4a5d23] hover:bg-[#3d4e1c] rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#e5e1da] shadow-2xs space-y-3 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#fee2e2] text-[#b91c1c] flex items-center justify-center mx-auto border border-[#b91c1c]/20 shadow-2xs">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-extrabold text-[#2d3a16]">No Homework Uploaded Yet</h3>
          <p className="text-xs sm:text-sm text-[#8c8577] max-w-md mx-auto leading-relaxed">
            {selectedSubject !== 'all' || searchQuery
              ? 'No files match your search filter.'
              : 'Daily homework worksheets and PDF assignments will appear here once uploaded by the subject teachers.'}
          </p>
          {(selectedSubject !== 'all' || searchQuery) ? (
            <button
              onClick={() => {
                setSelectedSubject('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#4a5d23] hover:bg-[#3d4e1c] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          ) : onGoToFaculty ? (
            <div className="pt-2">
              <button
                onClick={onGoToFaculty}
                className="px-5 py-2.5 bg-[#4a5d23] hover:bg-[#3d4e1c] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Upload First Homework (Faculty Portal)</span>
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
