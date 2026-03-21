import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileImage, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageUpload({ images = [], onImagesChange, disabled = false, maxFiles = 10, maxSizeMB = 10 }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  const simulateUpload = useCallback((file) => {
    return new Promise((resolve) => {
      const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadProgress(prev => { const next = { ...prev }; delete next[id]; return next; });
          resolve({
            id,
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file),
            uploadedAt: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
            status: 'pending',
            category: file.name.toLowerCase().includes('bom') ? 'BoM Diagram' :
                      file.name.toLowerCase().includes('sketch') ? 'Design Sketch' :
                      file.name.toLowerCase().includes('doc') ? 'Document' : 'Product Image',
          });
        }
        setUploadProgress(prev => ({ ...prev, [id]: Math.min(progress, 100) }));
      }, 150);
    });
  }, []);

  const handleFiles = useCallback(async (files) => {
    if (disabled) return;
    const validFiles = Array.from(files).filter(f => {
      if (!allowedTypes.includes(f.type)) return false;
      if (f.size > maxSizeMB * 1024 * 1024) return false;
      return true;
    }).slice(0, maxFiles - images.length);

    const results = await Promise.all(validFiles.map(f => simulateUpload(f)));
    onImagesChange([...images, ...results]);
  }, [disabled, images, onImagesChange, simulateUpload, maxFiles, maxSizeMB]);

  const handleDragOver = (e) => { e.preventDefault(); if (!disabled) setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); };
  const handleInputChange = (e) => { handleFiles(e.target.files); e.target.value = ''; };

  const removeImage = (imgId) => {
    if (disabled) return;
    onImagesChange(images.filter(img => img.id !== imgId));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          disabled ? 'border-surface-200 bg-surface-50 cursor-not-allowed opacity-60' :
          isDragging ? 'border-primary-400 bg-primary-50 scale-[1.01]' :
          'border-surface-300 hover:border-primary-300 hover:bg-primary-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            isDragging ? 'bg-primary-100' : 'bg-surface-100'
          }`}>
            <Upload size={24} className={isDragging ? 'text-primary-500' : 'text-surface-400'} />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-700">
              {isDragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
            </p>
            <p className="text-xs text-surface-400 mt-1">
              JPG, PNG, WebP, PDF · Max {maxSizeMB}MB per file · {maxFiles - images.length} slots remaining
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {Object.entries(uploadProgress).map(([id, progress]) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary-50 rounded-lg p-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                <FileImage size={14} className="text-primary-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-primary-700">Uploading...</span>
                  <span className="text-xs text-primary-500">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-primary-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.15 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Uploaded Thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <AnimatePresence>
            {images.map((img) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`group relative bg-white rounded-xl border overflow-hidden ${
                  img.reviewStatus === 'approved' ? 'border-success-300 ring-1 ring-success-200' :
                  img.reviewStatus === 'rejected' ? 'border-danger-300 ring-1 ring-danger-200' :
                  'border-surface-200 hover:border-surface-300'
                }`}
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-surface-50 flex items-center justify-center overflow-hidden">
                  {img.type === 'application/pdf' ? (
                    <div className="flex flex-col items-center gap-1">
                      <FileImage size={32} className="text-surface-400" />
                      <span className="text-[10px] text-surface-400 font-medium">PDF</span>
                    </div>
                  ) : (
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5">
                  <p className="text-xs font-medium text-surface-700 truncate">{img.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-surface-400">{formatSize(img.size)}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-100 text-surface-500 font-medium">{img.category}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={10} className="text-surface-300" />
                    <span className="text-[10px] text-surface-300">{img.uploadedAt}</span>
                  </div>
                </div>

                {/* Remove Button */}
                {!disabled && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                  >
                    <X size={12} />
                  </button>
                )}

                {/* Review Status Badge */}
                {img.reviewStatus && (
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    img.reviewStatus === 'approved' ? 'bg-success-500 text-white' :
                    img.reviewStatus === 'rejected' ? 'bg-danger-500 text-white' :
                    'bg-warning-500 text-white'
                  }`}>
                    {img.reviewStatus === 'approved' ? '✓ Approved' : img.reviewStatus === 'rejected' ? '✗ Rejected' : '● Pending'}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Hint */}
      {!disabled && (
        <div className="flex items-start gap-2 text-xs text-surface-400">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>Uploaded images are part of this ECO and will only be applied to the product after approval. They do not replace existing images until the ECO is completed.</span>
        </div>
      )}
    </div>
  );
}
