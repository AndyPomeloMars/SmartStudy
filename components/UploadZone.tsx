import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Loader2, CheckCircle, Image as ImageIcon, Crop, ScanLine, X, MousePointer2, Layers, QrCode } from 'lucide-react';
import ReactCrop, { type Crop as CropType } from 'react-image-crop';
import { extractQuestionsFromImage } from '../services/geminiService';
import { Question, ThemeColor, UploadedFile, Language, QuestionType, Difficulty } from '../types';
import { t } from '../utils/translations';
import { Html5Qrcode } from "html5-qrcode";

interface UploadZoneProps {
  uploads: UploadedFile[];
  onUploadFiles: (files: File[]) => void;
  onQueueFile: (id: string) => void;
  onQueueAll: () => void;
  onRemoveFile: (id: string) => void;
  onManualQuestionsAdded: (questions: Question[]) => void;
  themeColor: ThemeColor;
  lang: Language;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ 
    uploads, 
    onUploadFiles, 
    onQueueFile, 
    onQueueAll, 
    onRemoveFile, 
    onManualQuestionsAdded,
    themeColor, 
    lang
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  // Crop State (Local)
  const [croppingFileId, setCroppingFileId] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<CropType>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isScanningCrop, setIsScanningCrop] = useState(false);

  // QR Scanner State
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isProcessingQR, setIsProcessingQR] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!isQRModalOpen) return;

    // Flag to prevent state updates if unmounted
    let isMounted = true;

    const initScanner = async () => {
        // Wait for modal transition/DOM
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (!isMounted) return;

        // Cleanup any existing instance (defensive)
        if (scannerRef.current) {
             try {
                 await scannerRef.current.stop();
                 await scannerRef.current.clear();
             } catch (e) {
                 // ignore cleanup errors
             }
        }

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        try {
            await html5QrCode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    if (isMounted) handleQRScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // Ignore frame scan errors
                }
            );
            if (isMounted) setQrError(null);
        } catch (err) {
            if (isMounted) {
                console.error("Failed to start scanner", err);
                setQrError(t('upload.cameraError', lang));
            }
        }
    };

    initScanner();

    return () => {
        isMounted = false;
        const scanner = scannerRef.current;
        if (scanner) {
            scanner.stop()
                .then(() => scanner.clear())
                .catch((err) => {
                    // Suppress "Cannot transition to a new state" errors which happen 
                    // if stop() is called while starting or already stopping.
                    console.debug("Scanner stop/clear handled:", err);
                });
            scannerRef.current = null;
        }
    };
  }, [isQRModalOpen, lang]);

  const handleQRScanSuccess = async (decodedText: string) => {
      if (isProcessingQR) return;
      
      setIsProcessingQR(true);
      
      // Stop scanning on success
      if (scannerRef.current) {
          try {
             await scannerRef.current.stop();
             await scannerRef.current.clear();
             scannerRef.current = null;
          } catch (e) { console.debug(e); }
      }
      
      try {
          let questionsData: any[] = [];
          
          // Check if it is a URL or JSON string
          if (decodedText.trim().startsWith('http')) {
              // It's a URL
              const response = await fetch(decodedText);
              if (!response.ok) throw new Error('Failed to fetch from URL');
              const json = await response.json();
              questionsData = Array.isArray(json) ? json : (json.questions || []);
          } else if (decodedText.trim().startsWith('[')) {
              // It's likely JSON
              questionsData = JSON.parse(decodedText);
          } else {
              throw new Error("Invalid QR code format. Must be URL or JSON array.");
          }

          if (!Array.isArray(questionsData) || questionsData.length === 0) {
               throw new Error("No questions found in data.");
          }

          // Normalize and add IDs
          const newQuestions: Question[] = questionsData.map((q: any) => ({
              id: crypto.randomUUID(),
              originalText: q.originalText || q.question || "Untitled Question",
              type: q.type || QuestionType.UNKNOWN,
              options: q.options || [],
              answer: q.answer || "",
              subject: q.subject || "General",
              difficulty: q.difficulty || Difficulty.MEDIUM,
              source: "QR Scan",
              selected: false
          }));

          onManualQuestionsAdded(newQuestions);
          setIsQRModalOpen(false); // Close modal on success
      } catch (err) {
          console.error("QR Process Error", err);
          setQrError("Failed to process QR code. Ensure it contains valid JSON or a URL to a JSON endpoint.");
      } finally {
          setIsProcessingQR(false);
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const validFiles = Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'));
      if(validFiles.length > 0) onUploadFiles(validFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const validFiles = Array.from(e.target.files).filter((f: File) => f.type.startsWith('image/'));
      if(validFiles.length > 0) onUploadFiles(validFiles);
    }
  };

  // Helper for manual crop
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
      onManualQuestionsAdded(newQuestions);
      setCroppingFileId(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
    } catch (err) {
      alert("Failed to recognize text in selection. Please try again.");
    } finally {
      setIsScanningCrop(false);
    }
  };

  const pendingCount = uploads.filter(f => f.status === 'pending').length;
  const isBulkScanning = uploads.some(f => f.status === 'queued' || f.status === 'processing');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t('upload.title', lang)}</h2>
            <p className="text-slate-500 mt-1">{t('upload.subtitle', lang)}</p>
        </div>
        
        <div className="flex gap-3">
             <button
                onClick={() => setIsQRModalOpen(true)}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 shadow-sm`}
            >
                <QrCode className="w-4 h-4 mr-2" />
                {t('upload.qr', lang)}
            </button>

            {uploads.length > 0 && (
                <button
                    onClick={onQueueAll}
                    disabled={isBulkScanning || pendingCount === 0}
                    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2
                        ${isBulkScanning || pendingCount === 0 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                            : `bg-${themeColor}-600 text-white hover:bg-${themeColor}-700`
                        }
                    `}
                >
                    {isBulkScanning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Layers className="w-4 h-4 mr-2" />}
                    {isBulkScanning ? t('upload.scanning', lang) : `${t('upload.scanAll', lang)} (${pendingCount})`}
                </button>
            )}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed p-8 transition-all duration-200 flex flex-col items-center justify-center text-center h-48
          ${isDragging ? `border-${themeColor}-500 bg-${themeColor}-50` : `border-slate-200 hover:border-${themeColor}-400 hover:bg-slate-50 bg-white`}
        `}
      >
        <input 
          type="file" 
          onChange={handleFileInput} 
          accept="image/*" 
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className={`w-12 h-12 bg-${themeColor}-50 rounded-full flex items-center justify-center mb-4`}>
          <UploadCloud className={`w-6 h-6 text-${themeColor}-600`} />
        </div>
        <h3 className="text-sm font-medium text-slate-900">{t('upload.drop', lang)}</h3>
        <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG</p>
      </div>

      {/* File List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {uploads.map(file => (
          <div key={file.id} className="group relative flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md overflow-hidden">
            {/* Preview Image Area */}
            <div className="relative h-48 w-full bg-slate-100">
              <img src={file.previewUrl} alt="Preview" className="h-full w-full object-cover" />
              <button 
                 onClick={() => onRemoveFile(file.id)}
                 className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-all hover:bg-red-500 group-hover:opacity-100"
                 title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Status Badge Overlay */}
              <div className="absolute bottom-2 left-2 right-2 flex justify-start">
                 {file.status === 'queued' && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm">
                       <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" /> Waiting
                    </span>
                 )}
                 {file.status === 'processing' && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50/90 px-2 py-1 text-xs font-medium text-blue-700 shadow-sm backdrop-blur-sm">
                       <Loader2 className="h-3 w-3 animate-spin" /> Processing
                    </span>
                 )}
                 {file.status === 'completed' && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50/90 px-2 py-1 text-xs font-medium text-emerald-700 shadow-sm backdrop-blur-sm">
                       <CheckCircle className="h-3 w-3" /> Done
                    </span>
                 )}
                 {file.status === 'error' && (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50/90 px-2 py-1 text-xs font-medium text-red-700 shadow-sm backdrop-blur-sm">
                       Error
                    </span>
                 )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-start justify-between mb-3">
                 <h4 className="font-medium text-slate-900 truncate flex-1 mr-2" title={file.file.name}>{file.file.name}</h4>
                 <span className="text-xs text-slate-400 whitespace-nowrap">{(file.file.size / 1024).toFixed(0)} KB</span>
              </div>
              
              {file.status === 'error' && file.error && (
                <p className="text-xs text-red-500 mb-3 bg-red-50 p-2 rounded">{file.error}</p>
              )}

              <div className="mt-auto grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCroppingFileId(file.id)}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                >
                  <Crop className="mr-2 h-3.5 w-3.5" />
                  {t('upload.manual', lang)}
                </button>
                <button
                  onClick={() => onQueueFile(file.id)}
                  disabled={file.status === 'processing' || file.status === 'queued'}
                  className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${file.status === 'processing' || file.status === 'queued' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : `bg-${themeColor}-600 hover:bg-${themeColor}-700 focus:ring-${themeColor}-600`}
                  `}
                >
                  <ScanLine className="mr-2 h-3.5 w-3.5" />
                  {t('upload.auto', lang)}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QR Scanner Modal */}
      {isQRModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl relative">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <QrCode className="w-5 h-5" />
                        {t('upload.qrTitle', lang)}
                    </h3>
                    <button 
                        onClick={() => setIsQRModalOpen(false)}
                        className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {qrError ? (
                        <div className="text-center py-8">
                            <p className="text-red-500 text-sm font-medium mb-2">{qrError}</p>
                            <button 
                                onClick={() => setIsQRModalOpen(false)}
                                className="text-xs text-slate-500 hover:text-slate-900 underline"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div id="reader" className="w-full rounded-lg overflow-hidden bg-black/5 aspect-square relative">
                                {isProcessingQR && (
                                    <div className="absolute inset-0 z-10 bg-white/80 flex flex-col items-center justify-center backdrop-blur-sm">
                                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                                        <p className="text-sm font-medium text-slate-700">Fetching Questions...</p>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-center text-slate-500 px-4">
                                {t('upload.qrDesc', lang)}
                            </p>
                        </div>
                    )}
                </div>
            </div>
          </div>
      )}

      {/* Cropping Modal */}
      {croppingFileId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[80vh] bg-slate-900 rounded-lg overflow-hidden relative flex flex-col shadow-2xl">
            <div className="h-14 bg-slate-800 flex items-center justify-between px-4 border-b border-slate-700">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Crop className="w-4 h-4" />
                Select Question Area
              </h3>
              <button onClick={() => setCroppingFileId(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-slate-950/50">
              <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
                <img 
                  ref={imgRef}
                  src={uploads.find(f => f.id === croppingFileId)?.previewUrl} 
                  alt="Crop preview"
                  className="max-h-[65vh] w-auto object-contain shadow-2xl"
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
                className={`px-6 py-2.5 rounded-md font-medium text-white flex items-center gap-2 transition-all
                  ${(!completedCrop?.width || isScanningCrop) ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : `bg-${themeColor}-600 hover:bg-${themeColor}-500 shadow-lg`}
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