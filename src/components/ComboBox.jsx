import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check } from 'lucide-react';
import MonsterIcon, { ICON_KEYS } from './MonsterIcon';

export default function ComboBox({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...", 
  label,
  icon,
  emptyMessage = "No results found."
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.id === value);

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(search.toLowerCase()) ||
    (opt.expansion && opt.expansion.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionId) => {
    onChange(optionId);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`relative w-full ${isOpen ? 'z-50' : 'z-0'}`} ref={containerRef}>
      {label && <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl glass-light border 
                   transition-all duration-200 text-left
                   ${isOpen ? 'border-gold/60 ring-1 ring-gold/20' : 'border-border/50 hover:border-border'}`}
      >
        <span className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          {selectedOption?.icon
            ? ICON_KEYS.has(selectedOption.icon)
              ? <MonsterIcon icon={selectedOption.icon} className="w-4 h-4 text-blood-light" />
              : <span className="text-lg leading-none">{selectedOption.icon}</span>
            : icon
          }
        </span>
        <span className={`flex-1 text-sm truncate ${selectedOption ? 'text-gray-100' : 'text-gray-500'}`}>
          {selectedOption?.name || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[60] left-0 right-0 glass border border-border shadow-2xl rounded-2xl 
                       overflow-hidden flex flex-col max-h-[300px]"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-border/50 bg-void/40 backdrop-blur-md sticky top-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-void/50 border border-border/50 rounded-lg py-2 pl-9 pr-3 
                             text-xs text-gray-200 outline-none focus:border-gold/40 placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="overflow-y-auto py-1 custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-gray-600 italic">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gold/10 transition-colors text-left
                               ${value === opt.id ? 'bg-gold/5' : ''}`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-[#1a1f2e] border border-[#2e3850] flex items-center justify-center flex-shrink-0">
                      {ICON_KEYS.has(opt.icon)
                        ? <MonsterIcon icon={opt.icon} className={`w-3.5 h-3.5 ${value === opt.id ? 'text-gold' : 'text-blood-light'}`} />
                        : <span className="text-base leading-none">{opt.icon}</span>
                      }
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${value === opt.id ? 'text-gold' : 'text-gray-200'}`}>
                        {opt.name}
                      </p>
                      {opt.expansion && (
                        <p className="text-[10px] text-gray-600 truncate">{opt.expansion}</p>
                      )}
                    </div>
                    {value === opt.id && <Check className="w-4 h-4 text-gold" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
