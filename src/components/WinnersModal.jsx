import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function WinnersModal({ isOpen, onClose, winners, onReset, onRemoveWinners, showConfetti }) {
  // Trigger confetti on open
  useEffect(() => {
    if (isOpen && showConfetti && winners.length > 0) {
      // Muted confetti colors - professional palette
      const colors = ['#0d9488', '#14b8a6', '#0891b2', '#64748b', '#94a3b8'];
      
      const launchConfetti = () => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: colors,
          disableForReducedMotion: true,
          scalar: 0.8,
        });
      };
      
      launchConfetti();
      const timer = setTimeout(launchConfetti, 150);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, showConfetti, winners.length]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl 
                                       bg-white p-8 text-left shadow-xl transition-all">
                {/* Header */}
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold text-gray-900 text-center mb-6"
                >
                  🎯 InstantPick Winners
                </Dialog.Title>

                {/* Winners List */}
                <div className="mb-8">
                  {winners.length > 0 ? (
                    <ol className="space-y-2">
                      {winners.map((winner, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-lg"
                        >
                          <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center 
                                         bg-teal-100 text-teal-700 font-bold rounded-full text-sm">
                            {index + 1}
                          </span>
                          <span className="text-lg font-medium text-gray-800 truncate">
                            {winner}
                          </span>
                        </motion.li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No winners selected
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3 px-4 text-sm font-medium text-gray-700 
                               bg-gray-100 rounded-lg hover:bg-gray-200 
                               transition-colors duration-200"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onReset();
                        onClose();
                      }}
                      className="flex-1 py-3 px-4 text-sm font-medium text-white 
                               bg-teal-600 rounded-lg hover:bg-teal-700 
                               transition-colors duration-200"
                    >
                      Reset & Spin Again
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onRemoveWinners();
                      onReset();
                      onClose();
                    }}
                    className="w-full py-3 px-4 text-sm font-medium text-amber-700 
                             bg-amber-50 border border-amber-200 rounded-lg 
                             hover:bg-amber-100 transition-colors duration-200"
                  >
                    Remove Winners from Entries & Spin Again
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
