import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ArrowLeft } from 'lucide-react';
import '../styles/DocumentPreview.css';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

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
  const studentName = request.student?.name || 'Student';
  const rollNumber = request.student?.rollNumber || 'N/A';

  return (
    <div className="document-preview-overlay">
      <div className="document-preview-modal">

        {/* Header */}
        <div className="document-preview-header">
          <div className="document-preview-title-group">
            <button
              type="button"
              onClick={onClose}
              className="document-preview-back-button"
              aria-label="Back to requests"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="document-preview-title-text">
              <h3>Document Preview</h3>
              <p>{studentName} ({rollNumber})</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="document-preview-close-button"
            aria-label="Close preview"
          >
            <X size={24} />
          </button>
        </div>

        {/* PDF Container */}
        <div className="document-preview-body">
          <div
            ref={pdfWrapperRef}
            className="document-preview-pdf-wrapper"
          >
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={(e) => console.error('PDF Load Error:', e)}
              className="document-preview-document"
            >
              <Page pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false} width={600} />
            </Document>

            {/* Visual Overlays for signatures */}
            {coordinates.map((coord, i) => {
              // Now x and y are percentage floats 0.0 -> 1.0!
              return (
                <div
                  key={i}
                  className={`document-preview-signature-box ${
                    coord.role === 'FACULTY'
                      ? 'document-preview-signature-box-faculty'
                      : 'document-preview-signature-box-hod'
                  }`}
                  style={{
                    left: `${coord.x * 100}%`,
                    top: `${coord.y * 100}%`,
                  }}
                >
                  <div className="document-preview-signature-label">
                    <span>{coord.role === 'FACULTY' ? 'Faculty Advisor' : 'HOD'}</span>
                    <span>Signature Here</span>
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
