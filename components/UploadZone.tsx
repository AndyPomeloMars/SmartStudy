import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Loader2, CheckCircle, Image as ImageIcon, Crop, ScanLine, X, MousePointer2, Layers } from 'lucide-react';
import ReactCrop, { type Crop as CropType } from 'react-image-crop';
import { extractQuestionsFromImage } from '../services/geminiService';
import { Question, ThemeColor } from '../types';

interface UploadZoneProps {
  onQuestionsAdded: (questions: Question[]) => void;
  themeColor: ThemeColor;
}

interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onQuestionsAdded, themeColor }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isBulkScanning, setIsBulkScanning] = useState(false);
  
  // Crop State
  const [croppingFileId, setCroppingFileId] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<CropType>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isScanningCrop, setIsScanningCrop] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        id: crypto.randomUUID(),
        file: f,
        previewUrl: URL.createObjectURL(f),
        status: 'pending' as const
      }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const processFile = async (fileObj: UploadedFile): Promise<Question[] | null> => {
    try {
        const base64 = await fileToBase64(fileObj.file);
        const apiBase64 = base64.split(',')[1];
        const newQuestions = await extractQuestionsFromImage(apiBase64);
        return newQuestions;
    } catch (e) {
        throw e;
    }
  };

  const handleAutoScan = async (fileId: string) => {
    const fileObj = files.find(f => f.id === fileId);
    if (!fileObj) return;

    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'processing' } : f));

    try {
      const newQuestions = await processFile(fileObj);
      if (newQuestions) {
        onQuestionsAdded(newQuestions);
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'completed' } : f));
      }
    } catch (err) {
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'error', error: 'Failed to extract' } : f));
    }
  };

  const handleScanAll = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsBulkScanning(true);

    // Process sequentially to ensure order and avoid rate limits
    for (const fileObj of pendingFiles) {
      // Set current to processing
      setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'processing' } : f));
      
      try {
        const newQuestions = await processFile(fileObj);
        if (newQuestions) {
            onQuestionsAdded(newQuestions);
            setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'completed' } : f));
        }
      } catch (err) {
         setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error', error: 'Failed' } : f));
      }
    }

    setIsBulkScanning(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getCroppedImg = (image: HTMLImageElement, crop: CropType): string => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );
    }
    return canvas.toDataURL('image/png');
  };

  const handleCropScan = async () => {
    if (!completedCrop || !imgRef.current || !croppingFileId) return;
    
    setIsScanningCrop(true);
    try {
      const base64Crop = getCroppedImg(imgRef.current, completedCrop);
      const apiBase64 = base64Crop.split(',')[1];
      const newQuestions = await extractQuestionsFromImage(apiBase64);
      onQuestionsAdded(newQuestions);
      
      // Close modal on success
      setCroppingFileId(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
      // Mark as completed? Maybe just leave as pending since user might crop more
      setFiles(prev => prev.map(f => f.id === croppingFileId ? { ...f, status: 'completed' } : f));
    } catch (err) {
      alert("Failed to recognize text in selection. Please try again.");
    } finally {
      setIsScanningCrop(false);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="flex justify-between items-end mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-900">Scan & Upload</h2>
            <p className="text-slate-500 mt-2">Upload images to auto-scan or manually crop specific questions.</p>
        </div>
        
        {files.length > 0 && (
            <button
                onClick={handleScanAll}
                disabled={isBulkScanning || pendingCount === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all
                    ${isBulkScanning || pendingCount === 0 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                        : `bg-${themeColor}-600 text-white hover:bg-${themeColor}-700 shadow-${themeColor}-200`
                    }
                `}
            >
                {isBulkScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Layers className="w-5 h-5" />}
                {isBulkScanning ? 'Scanning...' : `Scan All Pending (${pendingCount})`}
            </button>
        )}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center text-center h-48 mb-8
          ${isDragging ? `border-${themeColor}-500 bg-${themeColor}-50` : `border-slate-300 hover:border-${themeColor}-400 bg-white`}
        `}
      >
        <input 
          type="file" 
          onChange={handleFileInput} 
          accept="image/*" 
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className={`w-12 h-12 bg-${themeColor}-50 rounded-full flex items-center justify-center mb-3`}>
          <UploadCloud className={`w-6 h-6 text-${themeColor}-600`} />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Drop files here or click to upload</h3>
      </div>

      {/* File List */}
      <div className="space-y-4">
        {files.map(file => (
          <div key={file.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-32 h-32 md:h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative group">
              <img src={file.previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button 
                 onClick={() => removeFile(file.id)}
                 className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 w-full text-center md:text-left">
              <h4 className="font-medium text-slate-800 truncate max-w-xs">{file.file.name}</h4>
              <p className="text-xs text-slate-400">{(file.file.size / 1024).toFixed(1)} KB</p>
              
              {file.status === 'processing' && (
                <div className="flex items-center gap-2 text-blue-600 text-sm mt-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing full image...
                </div>
              )}
              {file.status === 'completed' && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm mt-2">
                  <CheckCircle className="w-4 h-4" /> Extraction Complete
                </div>
              )}
              {file.status === 'error' && (
                <div className="text-red-500 text-sm mt-2">
                  Error: {file.error}
                </div>
              )}
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => setCroppingFileId(file.id)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                title="Manually select question area"
              >
                <Crop className="w-4 h-4" />
                Manual Crop
              </button>
              <button
                onClick={() => handleAutoScan(file.id)}
                disabled={file.status === 'processing'}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-sm
                  ${file.status === 'processing' ? 'bg-slate-300 cursor-not-allowed' : `bg-${themeColor}-600 hover:bg-${themeColor}-700`}
                `}
              >
                <ScanLine className="w-4 h-4" />
                Auto Scan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cropping Modal */}
      {croppingFileId && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[80vh] bg-slate-900 rounded-lg overflow-hidden relative flex flex-col">
            <div className="h-14 bg-slate-800 flex items-center justify-between px-4 border-b border-slate-700">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Crop className="w-4 h-4" />
                Select Question Area
              </h3>
              <button onClick={() => setCroppingFileId(null)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-950/50">
              <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
                <img 
                  ref={imgRef}
                  src={files.find(f => f.id === croppingFileId)?.previewUrl} 
                  alt="Crop preview"
                  className="max-h-[70vh] w-auto object-contain"
                />
              </ReactCrop>
            </div>

            <div className="h-20 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-6">
              <div className="text-slate-400 text-sm flex items-center gap-2">
                <MousePointer2 className="w-4 h-4" />
                Drag to select the question text
              </div>
              <button
                onClick={handleCropScan}
                disabled={!completedCrop?.width || !completedCrop?.height || isScanningCrop}
                className={`px-6 py-2.5 rounded-lg font-medium text-white flex items-center gap-2
                  ${(!completedCrop?.width || isScanningCrop) ? 'bg-slate-600 cursor-not-allowed' : `bg-${themeColor}-600 hover:bg-${themeColor}-500 shadow-lg shadow-${themeColor}-900/20`}
                `}
              >
                {isScanningCrop ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                {isScanningCrop ? 'Analyzing...' : 'Recognize Selection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};