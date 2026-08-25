import React, { useState } from 'react';
import { HomeworkItem, ScheduleDocument } from '../types';
import { X, Download, FileText, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { downloadFile } from '../utils/storage';

interface PDFPreviewModalProps {
  item: HomeworkItem | ScheduleDocument | null;
  onClose: () => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({ item, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!item) return null;

  const title = 'title' in item ? item.title : item.fileName;
  const fileName = item.fileName;
  const fileSize = item.fileSize;
  const date = 'date' in item ? item.date : ('dateUploaded' in item ? item.dateUploaded : '');
  const subject = 'subjectName' in item ? item.subjectName : ('category' in item ? (item.category === 'timetable' ? 'Class Timetable' : 'Exam Date Sheet') : 'Document');
  const fileData = item.fileData;

  const isImage = fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg');

  const handleDownload = () => {
    downloadFile(fileName, fileData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#e5e1da]">
        {/* Modal Top Bar */}
        <div className="p-4 bg-[#2d3a16] text-[#fdfcf9] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-[#eef0e7] bg-[#4a5d23] px-2 py-0.5 rounded border border-[#5d7330]">
                  {subject}
                </span>
                <span className="text-xs text-[#d8decb] font-medium">{date}</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5">
                {title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-[#4a5d23] hover:bg-[#3d4e1c] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content / Document Viewer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f7f5f0] flex flex-col items-center justify-center min-h-[350px]">
          {fileData && isImage ? (
            <div className="max-w-full overflow-auto bg-white p-2 rounded-2xl shadow-sm border border-[#e5e1da]">
              <img
                src={fileData}
                alt={fileName}
                className="max-h-[60vh] object-contain rounded-xl"
                style={{ transform: `scale(${zoomLevel / 100})` }}
                referrerPolicy="no-referrer"
              />
            </div>
          ) : fileData && fileData.startsWith('data:application/pdf') ? (
            <iframe
              src={fileData}
              title={fileName}
              className="w-full h-[65vh] rounded-2xl border border-[#e5e1da] bg-white shadow-sm"
            />
          ) : (
            /* Document Preview Sheet */
            <div
              className="w-full max-w-2xl bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#e5e1da] space-y-6 text-center"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#fee2e2] text-[#b91c1c] border border-[#b91c1c]/20 flex items-center justify-center mx-auto shadow-2xs">
                <FileText className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-black uppercase text-[#4a5d23] bg-[#eef0e7] px-2.5 py-1 rounded-md border border-[#4a5d23]/30">
                  {subject} PDF DOCUMENT
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#2d3a16] pt-2">
                  {title}
                </h2>
                <p className="text-xs text-[#8c8577] font-mono">
                  {fileName} • {fileSize} • Uploaded on {date}
                </p>
              </div>

              <div className="p-4 bg-[#fcfbf9] rounded-xl border border-[#e0ded8] text-xs text-[#6d6657] text-left space-y-2">
                <p className="font-bold text-[#2d3a16]">Official PM Shri KV Sitapur Class 11th Document</p>
                <p>This PDF worksheet / schedule document has been verified by the respective subject teacher for Class 11th (1st Shift).</p>
                <p>Click the button below to download the complete file to your device or print for study.</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-[#4a5d23] hover:bg-[#3d4e1c] text-white font-bold rounded-2xl text-sm shadow-xs transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Complete {fileSize} PDF File</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Controls */}
        <div className="p-3 bg-white border-t border-[#e5e1da] flex items-center justify-between text-xs text-[#7a7467]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 10, 60))}
              className="p-1.5 hover:bg-[#f8f6f0] rounded-lg border border-[#e5e1da] text-[#2d3a16] cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 10, 150))}
              className="p-1.5 hover:bg-[#f8f6f0] rounded-lg border border-[#e5e1da] text-[#2d3a16] cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="px-2 py-1 hover:bg-[#f8f6f0] rounded-lg border border-[#e5e1da] text-[11px] text-[#2d3a16] font-semibold cursor-pointer"
            >
              Reset
            </button>
          </div>

          <span className="text-[11px] font-mono text-[#8c8577]">
            {fileName}
          </span>
        </div>
      </div>
    </div>
  );
};
