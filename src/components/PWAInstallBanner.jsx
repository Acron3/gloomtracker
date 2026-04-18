import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus } from 'lucide-react';
import usePWAInstall from '../hooks/usePWAInstall';

export default function PWAInstallBanner() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Don't show if already installed or user dismissed
  if (isInstalled || dismissed) return null;
  // Show for: Chrome/Edge (isInstallable) OR iOS Safari
  if (!isInstallable && !isIOS) return null;

  return (
    <>
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-4 mb-3 rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 to-[#1e2535] p-3 flex items-center gap-3"
          >
            {/* Icon */}
            <img src="/pwa-icon-192.png" alt="Gloom Tracker" className="w-10 h-10 rounded-xl flex-shrink-0" />

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gold leading-tight">Install Gloom Tracker</p>
              <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Play offline · Add to home screen</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              {isInstallable ? (
                <button
                  onClick={install}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold text-black
                             text-xs font-bold active:scale-95 transition-transform touch-manipulation"
                >
                  <Download className="w-3.5 h-3.5" /> Install
                </button>
              ) : (
                <button
                  onClick={() => setShowIOSGuide(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold text-black
                             text-xs font-bold active:scale-95 transition-transform touch-manipulation"
                >
                  <Share className="w-3.5 h-3.5" /> How to
                </button>
              )}
              <button
                onClick={() => setDismissed(true)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500
                           hover:text-gray-300 active:scale-90 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Guide Modal */}
      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-end justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm glass rounded-2xl p-5 border border-gold/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <img src="/pwa-icon-192.png" alt="" className="w-10 h-10 rounded-xl" />
                <div>
                  <h3 className="text-base font-bold text-gold font-display">Install on iOS</h3>
                  <p className="text-[11px] text-gray-500">Add to your Home Screen</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { step: '1', icon: <Share className="w-4 h-4 text-gold" />, text: 'Tap the Share button at the bottom of Safari' },
                  { step: '2', icon: <Plus className="w-4 h-4 text-gold" />, text: 'Scroll down and tap "Add to Home Screen"' },
                  { step: '3', icon: <span className="text-gold text-sm">✓</span>, text: 'Tap "Add" — done! Launch from your home screen' },
                ].map(({ step, icon, text }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                      {icon}
                    </div>
                    <p className="text-xs text-gray-300">{text}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full mt-5 py-3 rounded-xl text-sm font-bold bg-gold text-black
                           active:scale-95 transition-transform touch-manipulation"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
