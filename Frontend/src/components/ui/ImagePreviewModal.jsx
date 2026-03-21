import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImagePreviewModal({ images, initialIndex = 0, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => { setCurrentIndex(initialIndex); }, [initialIndex]);
  useEffect(() => { setZoom(1); setRotation(0); }, [currentIndex]);

  const goNext = useCallback(() => {
    if (currentIndex < images.length - 1) setCurrentIndex(prev => prev + 1);
  }, [currentIndex, images.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  }, [currentIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, goNext, goPrev]);

  if (!isOpen || !images || images.length === 0) return null;
  const currentImage = images[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-[90vw] h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 bg-black/40 rounded-t-xl">
            <div>
              <p className="text-sm font-medium text-white">{currentImage.name}</p>
              <p className="text-xs text-white/60">{currentImage.category} · {currentIndex + 1} of {images.length}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"><ZoomOut size={18} /></button>
              <span className="text-xs text-white/50 w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"><ZoomIn size={18} /></button>
              <button onClick={() => setRotation(r => (r + 90) % 360)} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"><RotateCw size={18} /></button>
              <div className="w-px h-5 bg-white/20 mx-1" />
              <button onClick={onClose} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"><X size={18} /></button>
            </div>
          </div>

          {/* Image Container */}
          <div className="flex-1 relative overflow-hidden bg-black/20 rounded-b-xl flex items-center justify-center">
            <motion.img
              key={currentImage.id}
              src={currentImage.url}
              alt={currentImage.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
            />

            {/* Navigation Arrows */}
            {currentIndex > 0 && (
              <button
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {currentIndex < images.length - 1 && (
              <button
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-full px-4 py-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentIndex ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
