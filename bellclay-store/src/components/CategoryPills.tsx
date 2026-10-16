import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  KeyRound,
  Palette,
  Smile,
  Gem,
  HeartHandshake,
  Grid,
  Sparkles,
  Tag,
  Package,
  Bookmark
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const ICON_MAP: Record<string, React.ReactNode> = {
  KeyRound: <KeyRound className="w-4 h-4 shrink-0" />,
  Palette: <Palette className="w-4 h-4 shrink-0" />,
  Smile: <Smile className="w-4 h-4 shrink-0" />,
  Gem: <Gem className="w-4 h-4 shrink-0" />,
  HeartHandshake: <HeartHandshake className="w-4 h-4 shrink-0" />,
  Sparkles: <Sparkles className="w-4 h-4 shrink-0" />,
  Tag: <Tag className="w-4 h-4 shrink-0" />,
  Package: <Package className="w-4 h-4 shrink-0" />,
  Bookmark: <Bookmark className="w-4 h-4 shrink-0" />
};

interface CategoryPillsProps {
  layoutId?: string;
  updateHash?: boolean;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  layoutId = 'categoryActiveSectionTab',
  updateHash = true
}) => {
  const { settings, selectedCategory, setSelectedCategory } = useSettings();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const isDraggingRef = useRef(false);

  const normalize = (str: string) =>
    (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  // Scroll active category into view smoothly when changed
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeEl = scrollContainerRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCategory]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsMouseDown(true);
    isDraggingRef.current = false;
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollContainerRef.current) return;
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.4;
    if (Math.abs(walk) > 6) {
      isDraggingRef.current = true;
    }
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  };

  const handleSelect = (slug: string) => {
    if (isDraggingRef.current) return;
    setSelectedCategory(slug);
    if (updateHash) {
      const newHash = slug === 'all' ? '#produtos' : `#${slug}`;
      window.history.pushState(null, '', newHash);
    }
  };

  const isAllSelected = selectedCategory === 'all';

  return (
    <div className="w-full border-b border-brand-border/60">
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex items-center min-w-full overflow-x-auto scrollbar-none touch-pan-x cursor-grab active:cursor-grabbing select-none"
      >
        {/* All items section tab */}
        <button
          type="button"
          onClick={() => handleSelect('all')}
          data-active={isAllSelected}
          className={`relative py-3 sm:py-3.5 px-3.5 sm:px-5 shrink-0 flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
            isAllSelected
              ? 'text-brand-pink'
              : 'text-brand-muted hover:text-brand-charcoal'
          }`}
        >
          <Grid className="w-4 h-4 shrink-0" />
          <span>Todos os Artesanatos</span>
          {isAllSelected && (
            <motion.div
              layoutId={layoutId}
              className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-pink"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>

        {/* Dynamic categories from settings */}
        {settings.categories.map((cat) => {
          const isSelected =
            normalize(selectedCategory) === normalize(cat.slug) ||
            normalize(selectedCategory) === normalize(cat.name);
          const icon = ICON_MAP[cat.iconName] || <Palette className="w-4 h-4 shrink-0" />;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat.slug)}
              data-active={isSelected}
              className={`relative py-3 sm:py-3.5 px-3.5 sm:px-5 shrink-0 flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'text-brand-pink'
                  : 'text-brand-muted hover:text-brand-charcoal'
              }`}
            >
              <span className={`transition-colors ${isSelected ? 'text-brand-pink' : 'text-brand-muted'}`}>
                {icon}
              </span>
              <span>{cat.name}</span>
              {isSelected && (
                <motion.div
                  layoutId={layoutId}
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-pink"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
