import React from 'react';
import { ScheduleDocument } from '../types';
import { Calendar, Download, Eye, FileText, Sparkles } from 'lucide-react';
import { downloadFile } from '../utils/storage';

interface DateSheetViewProps {
  datesheetDoc: ScheduleDocument | null;
  onPreview: (doc: ScheduleDocument) => void;
  onGoToFaculty?: () => void;
}

export const DateSheetView: React.FC<DateSheetViewProps> = ({
  datesheetDoc,
  onPreview,
  onGoToFaculty
}) => {
  return (
    <div className="space-y-4">
      {datesheetDoc ? (
        /* Dedicated Official Date Sheet Card */
        <div className="bg-gradient-to-br from-white via-[#fcfbf9] to-[#fbf5ee] border border-[#e8dccd] rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#f8f1ea] text-[#87582c] border border-[#87582c]/25 flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase text-[#87582c] bg-[#f8f1ea] px-2 py-0.5 rounded-md border border-[#87582c]/30">
                    OFFICIAL EXAM DATE SHEET
                  </span>
                  <span className="text-xs text-[#7a7467] font-semibold">
                    Uploaded on: {datesheetDoc.dateUploaded}
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-extrabold text-[#2d3a16] tracking-tight">
                  {datesheetDoc.title}
                </h2>
                <p className="text-xs text-[#6d6657] font-mono">
                  📄 {datesheetDoc.fileName} ({datesheetDoc.fileSize})
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onPreview(datesheetDoc)}
                className="px-4 py-2.5 text-xs font-bold text-[#2d3a16] bg-white hover:bg-[#f8f1ea] border border-[#e8dccd] rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[#87582c]" />
                <span>View Date Sheet PDF</span>
              </button>

              <button
                onClick={() => downloadFile(datesheetDoc.fileName, datesheetDoc.fileData)}
                className="px-4 py-2.5 text-xs font-bold text-white bg-[#87582c] hover:bg-[#6e4620] rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-[#fcfbf9] rounded-2xl border border-[#e5e1da] text-xs text-[#6d6657] flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#87582c] flex-shrink-0" />
            <span>
              This is the official Class 11th Examination Date Sheet uploaded by the school faculty. Click <b>View Date Sheet PDF</b> to preview directly in your browser.
            </span>
          </div>
        </div>
      ) : (
        /* Empty State: Waiting for Teacher to Upload */
        <div className="bg-white border border-[#e5e1da] rounded-3xl p-8 sm:p-12 text-center shadow-2xs space-y-4 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#f8f1ea] text-[#87582c] border border-[#87582c]/20 flex items-center justify-center mx-auto shadow-2xs">
            <Calendar className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-[#2d3a16]">
              No Exam Date Sheet Uploaded Yet
            </h3>
            <p className="text-xs sm:text-sm text-[#7a7467] max-w-md mx-auto leading-relaxed">
              The official Class 11th Examination Date Sheet PDF will appear here once published by the examination department.
            </p>
          </div>

          {onGoToFaculty && (
            <div className="pt-2">
              <button
                onClick={onGoToFaculty}
                className="px-5 py-2.5 bg-[#87582c] hover:bg-[#6e4620] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Upload Date Sheet (Faculty Portal)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
