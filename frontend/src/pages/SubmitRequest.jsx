import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, CheckCircle2, ArrowRight, Save, MousePointerClick, FileText, GripHorizontal } from 'lucide-react';
import Draggable from 'react-draggable';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const SignatureBox = ({ coord, onDragStop }) => {
  const nodeRef = useRef(null);
  
  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: coord.renderX, y: coord.renderY }}
      onStop={(e, data) => onDragStop(coord.role, data.x, data.y)}
      handle=".drag-handle"
    >
      <div
        ref={nodeRef}
        className={`absolute flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm shadow-xl rounded-md cursor-move
          ${coord.role === 'FACULTY' ? 'border-2 border-blue-500 text-blue-800' : 'border-2 border-purple-500 text-purple-800'}`}
        style={{
          width: '150px',
          height: '50px',
          left: 0,
          top: 0
        }}
      >
        <div className="drag-handle w-full h-4 bg-gray-100/80 rounded-t-sm flex items-center justify-center border-b border-gray-200 shadow-sm">
           <GripHorizontal size={12} className="text-gray-500" />
        </div>
        <div className="flex-1 flex items-center justify-center text-xs font-bold px-2 py-1 whitespace-nowrap overflow-hidden">
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

  const handleDragStop = (role, newRenderX, newRenderY) => {
    if (!pdfWrapperRef.current) return;
    
    const rect = pdfWrapperRef.current.getBoundingClientRect();
    
    // Convert the dragged physical pixels to percentage ratio of the current live canvas container.
    // Constrain mathematically between 0 and 1 here to manually enforce bounds cleanly.
    let ratioX = newRenderX / rect.width;
    let ratioY = newRenderY / rect.height;

    ratioX = Math.max(0, Math.min(ratioX, 1 - (150 / rect.width)));
    ratioY = Math.max(0, Math.min(ratioY, 1 - (50 / rect.height)));

    // Set render coordinates bounded to valid area
    const safeRenderX = ratioX * rect.width;
    const safeRenderY = ratioY * rect.height;

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
      await axios.post('http://localhost:5000/api/requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/student/history');
    } catch (error) {
      alert('Error submitting request: ' + (error.response?.data?.message || error.message));
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 h-[calc(100vh-8rem)]">
      
      {/* Left panel: Form and Tools */}
      <div className="lg:w-1/3 flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Submit New Request</h2>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Request Type</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 font-medium text-gray-700"
              >
                <option value="PERMISSION_LETTER">Permission Letter</option>
                <option value="SCHOLARSHIP_FORM">Scholarship Form</option>
                <option value="OTHER">Other Department Request</option>
              </select>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-sm font-semibold text-gray-700">Upload Document (PDF)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="space-y-2 text-center">
                  <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                  <div className="flex justify-center text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 px-2">
                      <span>Upload a file</span>
                      <input type="file" className="sr-only" accept=".pdf" onChange={onFileChange} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PDF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {fileUrl && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
              <MousePointerClick size={18} className="mr-2 text-primary-600" />
              Signature Placement
            </h3>
            <p className="text-sm text-gray-500 mb-6">Click a button below to add a signature box, then drag it to your desired position.</p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleAddSignature('FACULTY')}
                disabled={coordinates.some(c=>c.role==='FACULTY')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${coordinates.some(c=>c.role==='FACULTY') ? 'border-green-200 bg-green-50 text-green-700 cursor-not-allowed opacity-70' : 'border-gray-200 hover:border-primary-300 text-gray-600'}`}
              >
                <span className="font-semibold text-sm">Faculty Advisor Signature</span>
                {coordinates.some(c=>c.role==='FACULTY') ? <CheckCircle2 size={18} className="text-green-500" /> : <span className="text-xs uppercase tracking-wider font-bold text-primary-600">+ Add Box</span>}
              </button>

              <button
                onClick={() => handleAddSignature('HOD')}
                disabled={coordinates.some(c=>c.role==='HOD')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${coordinates.some(c=>c.role==='HOD') ? 'border-green-200 bg-green-50 text-green-700 cursor-not-allowed opacity-70' : 'border-gray-200 hover:border-primary-300 text-gray-600'}`}
              >
                <span className="font-semibold text-sm">HOD Signature</span>
                {coordinates.some(c=>c.role==='HOD') ? <CheckCircle2 size={18} className="text-green-500" /> : <span className="text-xs uppercase tracking-wider font-bold text-primary-600">+ Add Box</span>}
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full mt-8 flex items-center justify-center space-x-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white transition-all ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-800 hover:bg-primary-900 shadow-lg hover:-translate-y-0.5'}`}
            >
              <Save size={18} />
              <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Right panel: PDF Preview */}
      <div className="lg:w-2/3 bg-gray-200 rounded-2xl shadow-inner border border-gray-300 overflow-auto flex justify-center relative items-start pt-8 pb-16">
        {!fileUrl ? (
          <div className="text-center text-gray-500 self-center">
            <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4 opacity-50" />
            <p className="font-medium">No document selected</p>
            <p className="text-sm mt-1">Upload a PDF to view preview</p>
          </div>
        ) : (
          <div 
            ref={pdfWrapperRef}
            className="relative bg-white shadow-xl"
            style={{ width: 'fit-content', minHeight: '842px' }}
          >
            <Document file={fileUrl} onLoadSuccess={handleDocumentLoadSuccess} onLoadError={(e) => console.error('PDF Load Error:', e)} className="pointer-events-none">
              <Page pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false} width={600} />
            </Document>
            
            {/* Visual Overlays for signatures */}
            {coordinates.map((coord, i) => (
              <SignatureBox key={i} coord={coord} onDragStop={handleDragStop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitRequest;
