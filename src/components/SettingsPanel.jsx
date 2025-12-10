import { Fragment } from 'react';
import { Dialog, Transition, Switch } from '@headlessui/react';

export default function SettingsPanel({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange
}) {
  const updateSetting = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl 
                                       bg-white p-6 shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Dialog.Title>

                <div className="space-y-6">
                  {/* Number of Winners */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Winners
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.winnerCount}
                      onChange={(e) => updateSetting('winnerCount', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500
                               transition-all duration-200"
                    />
                    <p className="mt-1.5 text-xs text-gray-500">
                      How many winners to pick each spin
                    </p>
                  </div>

                  {/* Toggle Options */}
                  <div className="space-y-4">
                    {/* Sound Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Sound Effects</span>
                        <p className="text-xs text-gray-500">Play sound when spinning</p>
                      </div>
                      <Switch
                        checked={settings.soundEnabled}
                        onChange={(checked) => updateSetting('soundEnabled', checked)}
                        className={`${
                          settings.soundEnabled ? 'bg-teal-600' : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                      >
                        <span
                          className={`${
                            settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow`}
                        />
                      </Switch>
                    </div>

                    {/* Confetti Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Confetti</span>
                        <p className="text-xs text-gray-500">Celebrate winners with confetti</p>
                      </div>
                      <Switch
                        checked={settings.confettiEnabled}
                        onChange={(checked) => updateSetting('confettiEnabled', checked)}
                        className={`${
                          settings.confettiEnabled ? 'bg-teal-600' : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                      >
                        <span
                          className={`${
                            settings.confettiEnabled ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow`}
                        />
                      </Switch>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="mt-6 w-full py-3 px-4 text-sm font-medium text-white 
                           bg-teal-600 rounded-lg hover:bg-teal-700 
                           transition-colors duration-200"
                >
                  Done
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
