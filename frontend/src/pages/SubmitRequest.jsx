import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, CheckCircle2, ArrowRight, Save, MousePointerClick, FileText, GripHorizontal } from 'lucide-react';
import Draggable from 'react-draggable';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import '../styles/SubmitRequest.css';

const API = import.meta.env.VITE_API_URL;

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const SignatureBox = ({ coord, onDragStop, wrapperRef }) => {
  const nodeRef = useRef(null);

  const handleStop = () => {
    if (!nodeRef.current || !wrapperRef?.current) return;

    const boxRect = nodeRef.current.getBoundingClientRect();
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const relativeX = boxRect.left - wrapperRect.left;
    const relativeY = boxRect.top - wrapperRect.top;

    console.log(`🔄 ${coord.role} Draggable onStop:`, {
      coord_renderX: coord.renderX,
      coord_renderY: coord.renderY,
      boxRect: { left: boxRect.left, top: boxRect.top },
      wrapperRect: { left: wrapperRect.left, top: wrapperRect.top },
      relativeX,
      relativeY,
    });

    onDragStop(coord.role, relativeX, relativeY);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      defaultPosition={{ x: coord.renderX, y: coord.renderY }}
      onStop={handleStop}
      handle=".signature-box-handle"
    >
      <div ref={nodeRef} className={`signature-box ${coord.role === 'FACULTY' ? 'signature-box-faculty' : 'signature-box-hod'}`}>
        <div className="signature-box-handle">
          <GripHorizontal size={12} className="signature-box-handle-icon" />
        </div>
        <div className="signature-box-content">
          {coord.role === 'FACULTY' ? 'Faculty Advisor' : 'HOD'}
        </div>
      </div>
    </Draggable>
  );
};

const SubmitRequest = () => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [type, setType] = useState('PERMISSION_LETTER');

  // Selection state
  const [coordinates, setCoordinates] = useState([]); // Array of {role, x, y, renderX, renderY}

  const [numPages, setNumPages] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const pdfWrapperRef = useRef(null);

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setFileUrl(URL.createObjectURL(selectedFile));
      setCoordinates([]);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleAddSignature = (role) => {
    if (coordinates.some(c => c.role === role)) return;

    let renderX = 100, renderY = 100;
    let ratioX = 0, ratioY = 0;

    if (pdfWrapperRef.current) {
      const rect = pdfWrapperRef.current.getBoundingClientRect();
      const initialPercent = 0.1; // Place at 10% by 10%
      // Initialize render coordinates at physical pixel scale of the container
      renderX = rect.width * initialPercent;
      renderY = rect.height * initialPercent;
      ratioX = initialPercent;
      ratioY = initialPercent;
    }

    setCoordinates([...coordinates, { role, x: ratioX, y: ratioY, renderX, renderY }]);
  };

  const handleDragStop = (role, relativeX, relativeY) => {
    if (!pdfWrapperRef.current) return;

    const rect = pdfWrapperRef.current.getBoundingClientRect();

    console.log('🎯 handleDragStop called:', { role, relativeX, relativeY });
    console.log('📏 Wrapper bounds:', { width: rect.width, height: rect.height, top: rect.top, left: rect.left });

    // Convert the dragged pixels relative to the PDF wrapper into percentage ratios.
    let ratioX = relativeX / rect.width;
    let ratioY = relativeY / rect.height;

    console.log('📐 Before constraint:', { ratioX, ratioY });

    ratioX = Math.max(0, Math.min(ratioX, 1 - (150 / rect.width)));
    ratioY = Math.max(0, Math.min(ratioY, 1 - (50 / rect.height)));

    console.log('📐 After constraint:', { ratioX, ratioY });

    const safeRenderX = ratioX * rect.width;
    const safeRenderY = ratioY * rect.height;

    console.log('💾 Saving coordinates:', { role, x: ratioX, y: ratioY, renderX: safeRenderX, renderY: safeRenderY });

    setCoordinates(prev => prev.map(c =>
      c.role === role
        ? { ...c, x: ratioX, y: ratioY, renderX: safeRenderX, renderY: safeRenderY }
        : c
    ));
  };

  const handleSubmit = async () => {
    if (!file) return alert('Please upload a document');

    // Check if both signatures are placed
    const hasFaculty = coordinates.some(c => c.role === 'FACULTY');
    const hasHod = coordinates.some(c => c.role === 'HOD');

    if (!hasFaculty || !hasHod) {
      if (!window.confirm('You have not placed both signatures (Faculty & HOD). Proceed anyway?')) {
        return;
      }
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);

    const dbCoords = coordinates.map(c => ({ role: c.role, x: c.x, y: c.y }));
    formData.append('coordinates', JSON.stringify(dbCoords));

    try {
      await axios.post(`${API}/api/requests`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/student/history');
    } catch (error) {
      alert('Error submitting request: ' + (error.response?.data?.message || error.message));
      setSubmitting(false);
    }
  };

  return (
    <div className="submit-request-container">

      {/* Left panel: Form and Tools */}
      <div className="submit-request-left-panel">
        <div className="submit-request-card">
          <h2 className="submit-request-title">Submit New Request</h2>

          <div className="submit-request-form-space">
            <div className="submit-request-form-group">
              <label className="submit-request-label">Request Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="submit-request-select"
              >
                <option value="PERMISSION_LETTER">Permission Letter</option>
                <option value="SCHOLARSHIP_FORM">Scholarship Form</option>
                <option value="OTHER">Other Department Request</option>
              </select>
            </div>

            <div className="submit-request-section">
              <label className="submit-request-label">Upload Document (PDF)</label>
              <div className="submit-request-upload-area">
                <div className="submit-request-upload-content">
                  <UploadCloud className="submit-request-upload-icon" />
                  <div className="submit-request-upload-text-wrapper">
                    <label className="submit-request-upload-label">
                      <span>Upload a file</span>
                      <input type="file" className="sr-only" accept=".pdf" onChange={onFileChange} />
                    </label>
                  </div>
                  <p className="submit-request-hint">PDF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {fileUrl && (
          <div className="submit-request-signature-panel">
            <h3 className="submit-request-signature-panel-title">
              <MousePointerClick size={18} className="submit-request-signature-panel-icon" />
              Signature Placement
            </h3>
            <p className="submit-request-signature-panel-description">Click a button below to add a signature box, then drag it to your desired position.</p>

            <div className="submit-request-signature-buttons">
              <button
                onClick={() => handleAddSignature('FACULTY')}
                disabled={coordinates.some(c => c.role === 'FACULTY')}
                className={`submit-request-signature-button ${coordinates.some(c => c.role === 'FACULTY') ? 'submit-request-signature-button-added' : ''}`}
              >
                <span className="submit-request-signature-button-text">Faculty Advisor Signature</span>
                {coordinates.some(c => c.role === 'FACULTY') ? <CheckCircle2 size={18} className="submit-request-signature-button-icon-added" /> : <span className="submit-request-signature-button-add-text">+ Add Box</span>}
              </button>

              <button
                onClick={() => handleAddSignature('HOD')}
                disabled={coordinates.some(c => c.role === 'HOD')}
                className={`submit-request-signature-button ${coordinates.some(c => c.role === 'HOD') ? 'submit-request-signature-button-added' : ''}`}
              >
                <span className="submit-request-signature-button-text">HOD Signature</span>
                {coordinates.some(c => c.role === 'HOD') ? <CheckCircle2 size={18} className="submit-request-signature-button-icon-added" /> : <span className="submit-request-signature-button-add-text">+ Add Box</span>}
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`submit-request-button ${submitting ? 'submit-request-button-disabled' : ''}`}
            >
              <Save size={18} />
              <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Right panel: PDF Preview */}
      <div className="submit-request-preview-panel">
        {!fileUrl ? (
          <div className="submit-request-preview-empty">
            <FileText className="submit-request-empty-icon" />
            <p className="submit-request-empty-title">No document selected</p>
            <p className="submit-request-empty-subtitle">Upload a PDF to view preview</p>
          </div>
        ) : (
          <div
            ref={pdfWrapperRef}
            className="submit-request-pdf-wrapper"
            style={{ width: 'fit-content', minHeight: '842px' }}
          >
            <Document file={fileUrl} onLoadSuccess={handleDocumentLoadSuccess} onLoadError={(e) => console.error('PDF Load Error:', e)} className="pointer-events-none">
              <Page pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false} width={600} />
            </Document>

            {/* Visual Overlays for signatures */}
            {coordinates.map((coord, i) => (
              <SignatureBox key={i} coord={coord} onDragStop={handleDragStop} wrapperRef={pdfWrapperRef} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitRequest;
