import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ProductImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  productTitle?: string;
}

export const ProductImageLightbox: React.FC<ProductImageLightboxProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  productTitle
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Touch pinch-to-zoom support
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1);

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    resetZoom();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length, resetZoom]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    resetZoom();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length, resetZoom]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel((prev) => Math.min(prev + 0.5, 4));
      } else if (e.key === '-') {
        setZoomLevel((prev) => {
          const next = Math.max(prev - 0.5, 1);
          if (next === 1) setPanOffset({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === '0') {
        resetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev, resetZoom]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) {
        setPanOffset({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleDoubleClick = () => {
    if (zoomLevel > 1) {
      resetZoom();
    } else {
      setZoomLevel(2.2);
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(prev + 0.25, 4));
    } else {
      setZoomLevel((prev) => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) {
          setPanOffset({ x: 0, y: 0 });
        }
        return next;
      });
    }
  };

  // Mouse pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan & pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoomLevel;
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStartDistRef.current;
      const nextZoom = Math.min(Math.max(touchStartZoomRef.current * ratio, 1), 4);
      setZoomLevel(nextZoom);
      if (nextZoom === 1) setPanOffset({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && isDragging && zoomLevel > 1) {
      setPanOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none touch-none"
      >
        {/* Top Header Bar */}
        <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-white/70 text-xs font-mono tracking-wider px-2.5 py-1 rounded-full bg-white/10 shrink-0">
              {currentIndex + 1} / {images.length}
            </span>
            {productTitle && (
              <h3 className="text-white text-sm font-semibold truncate hidden sm:block">
                {productTitle}
              </h3>
            )}
          </div>

          {/* Zoom controls toolbar & Close */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
              title="Reduzir zoom (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={resetZoom}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 min-w-[64px] justify-center"
              title="Restaurar zoom original (100%)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{Math.round(zoomLevel * 100)}%</span>
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 4}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
              title="Aumentar zoom (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-xl bg-white/20 hover:bg-red-500/80 text-white transition-all cursor-pointer ml-2"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Main Stage (Image Area) */}
        <div
          className={`flex-1 relative w-full h-full flex items-center justify-center overflow-hidden ${
            zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
          }`}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Photo with smooth transform */}
          <div
            className="w-full h-full flex items-center justify-center pointer-events-none"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transition: isDragging ? 'none' : 'transform 0.18s cubic-bezier(0.2, 0, 0, 1)'
            }}
          >
            <img
              src={currentImage}
              alt={productTitle || 'Foto do produto'}
              className="max-h-[78vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl select-none"
              draggable={false}
            />
          </div>

          {/* Previous / Next Arrow Controls */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 z-20 shadow-lg"
                title="Foto anterior (Seta esquerda)"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 z-20 shadow-lg"
                title="Próxima foto (Seta direita)"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Thumbnails & Tips Bar */}
        <div className="relative z-20 pb-4 pt-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col items-center gap-2">
          {images.length > 1 && (
            <div className="flex items-center gap-2 max-w-[90vw] overflow-x-auto p-1.5 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    resetZoom();
                    setCurrentIndex(idx);
                  }}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    idx === currentIndex
                      ? 'border-brand-pink scale-105 shadow-md shadow-brand-pink/30'
                      : 'border-white/30 opacity-60 hover:opacity-100 hover:border-white'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <p className="text-[11px] text-white/50 text-center font-medium">
            Dica: Dê dois cliques ou use a rodinha do mouse para dar zoom • Arraste para navegar nos detalhes
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
