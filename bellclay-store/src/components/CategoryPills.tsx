import React from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Palette, Smile, Gem, HeartHandshake, Grid } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const ICON_MAP: Record<string, React.ReactNode> = {
  KeyRound: <KeyRound className="w-4 h-4" />,
  Palette: <Palette className="w-4 h-4" />,
  Smile: <Smile className="w-4 h-4" />,
  Gem: <Gem className="w-4 h-4" />,
  HeartHandshake: <HeartHandshake className="w-4 h-4" />
};

export const CategoryPills: React.FC = () => {
  const { settings, selectedCategory, setSelectedCategory } = useSettings();

  return (
    <div className="w-full py-2 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-1 sm:px-2">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-max pb-1">
          {/* All items pill */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-xs ${
              selectedCategory === 'all'
                ? 'bg-brand-charcoal text-white shadow-md'
                : 'bg-white hover:bg-[#F5EFE6] text-brand-charcoal border border-brand-border/80'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Todos os Artesanatos</span>
          </motion.button>

          {/* Dynamic categories from settings */}
          {settings.categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
            const icon = ICON_MAP[cat.iconName] || <Palette className="w-4 h-4" />;

            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-brand-pink text-white shadow-pink-soft'
                    : 'bg-white hover:bg-brand-pink-subtle text-brand-charcoal border border-brand-border/80 hover:border-brand-pink/30'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-brand-pink'}>
                  {icon}
                </span>
                <span>{cat.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
