import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileText, X, ArrowLeft } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const DocumentPreview = ({ request, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const pdfWrapperRef = useRef(null);

  if (!request) return null;

  const fileUrl = `${API}/${request.documentPath}`;
  const coordinates = request.coordinates || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-200 transition"
              style={{ minWidth: '88px' }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Document Preview</h3>
              <p className="text-sm text-gray-500 font-medium">{request.student.name} ({request.student.rollNumber})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* PDF Container */}
        <div className="flex-1 bg-gray-200 overflow-auto flex justify-center py-8 relative">
          <div
            ref={pdfWrapperRef}
            className="relative bg-white shadow-xl"
            style={{ width: 'fit-content', minHeight: '842px' }}
          >
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={(e) => console.error('PDF Load Error:', e)}
              className="pointer-events-none"
            >
              <Page pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false} width={600} />
            </Document>

            {/* Visual Overlays for signatures */}
            {coordinates.map((coord, i) => {
              // Now x and y are percentage floats 0.0 -> 1.0!
              return (
                <div
                  key={i}
                  className={`absolute flex flex-col items-center justify-center bg-white/70 backdrop-blur-md shadow-xl rounded-md pointer-events-none
                    ${coord.role === 'FACULTY' ? 'border-[3px] border-blue-500 text-blue-800' : 'border-[3px] border-purple-500 text-purple-800'}`}
                  style={{
                    left: `${coord.x * 100}%`,
                    top: `${coord.y * 100}%`,
                    width: '150px',
                    height: '50px',
                    zIndex: 10
                  }}
                >
                  <div className="flex-1 w-full flex flex-col items-center justify-center text-xs font-bold px-2 py-1 whitespace-nowrap overflow-hidden text-center">
                    <span>{coord.role === 'FACULTY' ? 'Faculty Advisor' : 'HOD'}</span>
                    <span className="text-[10px] font-semibold opacity-80 uppercase tracking-widest mt-0.5">Signature Here</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DocumentPreview;
