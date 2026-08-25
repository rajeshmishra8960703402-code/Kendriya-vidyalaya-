import React from 'react';
import { ScheduleDocument } from '../types';
import { Clock, Download, Eye, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { downloadFile } from '../utils/storage';

interface TimetableViewProps {
  timetableDoc: ScheduleDocument | null;
  onPreview: (doc: ScheduleDocument) => void;
  onGoToFaculty?: () => void;
}

export const TimetableView: React.FC<TimetableViewProps> = ({
  timetableDoc,
  onPreview,
  onGoToFaculty
}) => {
  return (
    <div className="space-y-4">
      {timetableDoc ? (
        /* Dedicated Official Timetable Card */
        <div className="bg-gradient-to-br from-white via-[#fcfbf9] to-[#f4f7ee] border border-[#d8decb] rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#eef0e7] text-[#4a5d23] border border-[#4a5d23]/25 flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase text-[#4a5d23] bg-[#eef0e7] px-2 py-0.5 rounded-md border border-[#4a5d23]/30">
                    OFFICIAL CLASS TIMETABLE
                  </span>
                  <span className="text-xs text-[#7a7467] font-semibold">
                    Uploaded on: {timetableDoc.dateUploaded}
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-extrabold text-[#2d3a16] tracking-tight">
                  {timetableDoc.title}
                </h2>
                <p className="text-xs text-[#6d6657] font-mono">
                  📄 {timetableDoc.fileName} ({timetableDoc.fileSize})
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onPreview(timetableDoc)}
                className="px-4 py-2.5 text-xs font-bold text-[#2d3a16] bg-white hover:bg-[#eef0e7] border border-[#d8decb] rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[#4a5d23]" />
                <span>View Timetable PDF</span>
              </button>

              <button
                onClick={() => downloadFile(timetableDoc.fileName, timetableDoc.fileData)}
                className="px-4 py-2.5 text-xs font-bold text-white bg-[#4a5d23] hover:bg-[#3d4e1c] rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-[#fcfbf9] rounded-2xl border border-[#e5e1da] text-xs text-[#6d6657] flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#4a5d23] flex-shrink-0" />
            <span>
              This is the official Class 11th Timetable uploaded by the school faculty. Click <b>View Timetable PDF</b> to preview directly in your browser.
            </span>
          </div>
        </div>
      ) : (
        /* Empty State: Waiting for Teacher to Upload */
        <div className="bg-white border border-[#e5e1da] rounded-3xl p-8 sm:p-12 text-center shadow-2xs space-y-4 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#eef0e7] text-[#4a5d23] border border-[#4a5d23]/20 flex items-center justify-center mx-auto shadow-2xs">
            <Clock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-[#2d3a16]">
              No Timetable Uploaded Yet
            </h3>
            <p className="text-xs sm:text-sm text-[#7a7467] max-w-md mx-auto leading-relaxed">
              The official Class 11th Timetable PDF will appear here once uploaded by the subject teacher or class coordinator.
            </p>
          </div>

          {onGoToFaculty && (
            <div className="pt-2">
              <button
                onClick={onGoToFaculty}
                className="px-5 py-2.5 bg-[#4a5d23] hover:bg-[#3d4e1c] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Upload Timetable (Faculty Portal)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
