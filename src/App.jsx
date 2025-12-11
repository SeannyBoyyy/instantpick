import { useState, useCallback, useRef, useEffect } from 'react';
import Wheel from './components/Wheel';
import EntryInput from './components/EntryInput';
import SpinButton from './components/SpinButton';
import WinnersModal from './components/WinnersModal';
import SettingsPanel from './components/SettingsPanel';
import { pickWinners } from './utils/pickWinners';

// Click sound (base64 encoded short tick)
const SPIN_SOUND = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgkKuurZNZNjRfkK+vrpNcNzZdkK2wr5RgODdbj6yxsJZiOTdaj6qyspdkOjdZjqmzs5hmOzZYjaeys5pnPDZXjKS0tJtpPTZWi6O1tZxrPjVViqK2tp1sPzRUiKG3t59uQDRTh6C4uKBwQTRShn+4uaFyQjNRhX65uqJzQzNQhH26u6N0RDJPhHy7vKR2RTJOg3u8vaV3RjFNgXq9vqZ4RzBMgHm+v6d6SDBLf3i/wKh7SS9Kfne/wamASi9Jfna/wqqBSy5IfXW/w6uDTC5HfHS+xKyFTS1GfHO+xK2HTi1Ee3K9xa6IUC1De3G9xa+JUC1Ce3G9xrCKUS1Ae3C9xrGMUi0/em+8x7KNUy0+em68x7OPUyw+emq7x7SQVCw9eWm7yLWRVSw8eWi6yLaTViw7eGe5yLaTVis7eGe5ybeTVis6eGa5ybiUVys5eGW4ybiUVys5eGW4yriVVyo5eGS3yrqWVio4d2O3yruXVyo4d2O2yryYVyk3d2K2y72ZVyk3dmG1y76bVig2dmC0y7+cVig2dl+zy8CdVic1dV6yy8GeVic1dV2xy8KfVic1dFywy8OgVSY0dFuvy8SiVSY0dFquy8WjVCY0c1muysalVCYzc1iryselViYzc1eq0celVyUzclaq0cimWCUycVWp0cqnWiQyclSo0cqpWyQxcVOn0cuqXCQxcFKm0syqXiQwcFGl0s2rYSMwb1Cj0s6tYiMvbk+i0c6uYyMvbk6g0dCwZCIublyd0dGxZiIua0uc0NKzaCEtalqZ0NOzaSEtaVmW0NO1aiEsaFiT0NS3bCAsZlaR0NW4byAraFOO0Na6cB8rZVKL0Ne7ch8rZFCIz9e9dB4qYk+Fz9nAdx4pYU2Cztm/eR0oYEt/zdrBfBwmXkl7zdzEgBsmW0d3y93HgxolWEVzyt7KhxkkVkNuyuDNixkjU0FqyOHQjhkhUj9lyOLTkRggTz1gyOPWlBcfTTtcxuTZmBYdSjlXxeXbnxYbRzhSwufdpRUaRjRNwundqhMYQy9JvurepxIXQC1EvO7hqxAVPSpAuO/krw4TOiY7te/msw0RNiU3su/ptgwPMyIyr/DsugoPMB8up/DuvwkNLRwqo+/xwgcLKRkmnO7zxQYJJRcinO73yQUHIhMclO/5zQMFHxEXjfD7zQMDGwsRhO/+0gICFwgNfPD/1wEAEgQGcfCA2gAAAAAAAAAA');

const HISTORY_STORAGE_KEY = 'instantpick_history';
const SETTINGS_STORAGE_KEY = 'instantpick_settings';

function App() {
  const [entries, setEntries] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winners, setWinners] = useState([]);
  const [showWinnersModal, setShowWinnersModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [winnerHistory, setWinnerHistory] = useState(() => {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      winnerCount: 1,
      soundEnabled: true,
      confettiEnabled: true,
    };
  });
  
  const entryInputRef = useRef(null);
  
  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);
  
  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(winnerHistory));
  }, [winnerHistory]);

  const handleSpin = useCallback(() => {
    const uniqueEntries = [...new Set(entries.filter(Boolean))];
    if (uniqueEntries.length === 0) return;
    
    setIsSpinning(true);
    
    // Pre-calculate winners (independent from wheel visual)
    const selectedWinners = pickWinners(entries, settings.winnerCount);
    setWinners(selectedWinners);
    
    // Note: History will be added when spin completes (in handleSpinComplete)
  }, [entries, settings.winnerCount, settings.soundEnabled]);

  const handleSpinComplete = useCallback(() => {
    setIsSpinning(false);
    setShowWinnersModal(true);
    
    // Add to history only after wheel animation completes
    if (winners.length > 0) {
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        winners: winners,
      };
      setWinnerHistory(prev => [historyEntry, ...prev].slice(0, 50)); // Keep last 50
    }
  }, [winners]);

  const handleReset = useCallback(() => {
    setWinners([]);
    setIsSpinning(false);
  }, []);

  const handleClearEntries = useCallback(() => {
    setEntries([]);
    setWinners([]);
    // Trigger a refresh of the entry input
    window.location.reload();
  }, []);
  
  const handleClearHistory = useCallback(() => {
    setWinnerHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  }, []);

  const handleRemoveWinnersFromEntries = useCallback(() => {
    if (winners.length === 0) return;
    // Update the entries array
    setEntries(prev => prev.filter(entry => !winners.includes(entry)));
    // Also update the text in EntryInput component
    if (entryInputRef.current) {
      entryInputRef.current.removeEntriesFromText(winners);
    }
  }, [winners]);

  const handleResetApp = useCallback(() => {
    // Clear all localStorage
    localStorage.clear();
    // Reload the page to reset everything
    window.location.reload();
  }, []);

  const uniqueEntryCount = new Set(entries.filter(Boolean)).size;
  const canSpin = uniqueEntryCount > 0 && !isSpinning;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Area */}
            <div className="flex items-center gap-4">
              {/* Company Logo */}
              <img 
                src="logo.png" 
                alt="Company Logo" 
                className="h-10 w-auto object-contain"
              />
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">InstantPick</h1>
                <p className="text-xs text-gray-500">Random Winner Selector</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 
                       rounded-lg transition-colors duration-200"
              aria-label="Settings"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Left Column - Entries + History */}
          <div className="space-y-6">
            {/* Entries Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <EntryInput 
                ref={entryInputRef}
                entries={entries} 
                setEntries={setEntries} 
              />
            </div>
            
            {/* Winner History Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Winner History
                </h2>
                {winnerHistory.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              {winnerHistory.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-2 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <p className="text-sm">No winners yet. Spin the wheel!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {winnerHistory.map((entry, historyIdx) => (
                    <div 
                      key={entry.id} 
                      className={`p-3 rounded-lg border transition-all ${
                        historyIdx === 0 
                          ? 'bg-teal-50 border-teal-200' 
                          : 'bg-gray-50 border-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {historyIdx === 0 && (
                          <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full font-medium">
                            Latest
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.winners.map((winner, idx) => (
                          <span 
                            key={idx}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${
                              historyIdx === 0 
                                ? 'bg-teal-100 text-teal-800' 
                                : 'bg-white border border-gray-200 text-gray-700'
                            }`}
                          >
                            <span className="font-bold text-xs">{idx + 1}.</span>
                            {winner}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Wheel Only */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col items-center">
              {/* Wheel */}
              <Wheel
                entries={entries}
                isSpinning={isSpinning}
                onSpinComplete={handleSpinComplete}
                winners={winners}
                soundEnabled={settings.soundEnabled}
              />
              
              {/* Stats */}
              <div className="w-full mt-6 mb-4 flex justify-center gap-8 text-sm text-gray-500">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-gray-900">
                    {uniqueEntryCount}
                  </span>
                  <span>Entries</span>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-teal-600">
                    {settings.winnerCount}
                  </span>
                  <span>Winners</span>
                </div>
              </div>
              
              {/* Spin Button */}
              <div className="w-full max-w-xs">
                <SpinButton
                  onClick={handleSpin}
                  disabled={!canSpin}
                  isSpinning={isSpinning}
                />
              </div>
              
              {/* Helper Text */}
              {uniqueEntryCount > 0 && uniqueEntryCount < settings.winnerCount && (
                <p className="mt-4 text-sm text-amber-600 text-center">
                  ⚠️ Only {uniqueEntryCount} entries available. 
                  {uniqueEntryCount === 1 ? ' 1 winner' : ` ${uniqueEntryCount} winners`} will be selected.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-sm text-gray-400">
        <p>InstantPick © {new Date().getFullYear()} • Professional Random Selection</p>
      </footer>

      {/* Modals */}
      <WinnersModal
        isOpen={showWinnersModal}
        onClose={() => setShowWinnersModal(false)}
        winners={winners}
        onReset={handleReset}
        onRemoveWinners={handleRemoveWinnersFromEntries}
        showConfetti={settings.confettiEnabled}
        soundEnabled={settings.soundEnabled}
      />
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
        onResetApp={handleResetApp}
      />
    </div>
  );
}

export default App;
