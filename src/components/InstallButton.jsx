import { useState, useEffect } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(!showIOSInstructions);
      return;
    }

    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    } finally {
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Don't show if not installable and not iOS (likely unsupported browser)
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg 
                   transition-colors duration-200 ${
                     isInstallable || isIOS
                       ? 'text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100' 
                       : 'text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed'
                   }`}
        title={isIOS ? "View install instructions for iOS" : "Install InstantPick as an app"}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Install
      </button>

      {/* iOS Instructions Popup */}
      {showIOSInstructions && isIOS && (
        <div className="absolute top-full mt-2 right-0 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <button 
            onClick={() => setShowIOSInstructions(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="font-semibold text-sm mb-2">Install on iOS</h3>
          <ol className="text-xs space-y-2 text-gray-600">
            <li className="flex gap-2">
              <span>1.</span>
              <span>Tap the Share button <span className="inline-block">⎙</span></span>
            </li>
            <li className="flex gap-2">
              <span>2.</span>
              <span>Scroll and tap "Add to Home Screen"</span>
            </li>
            <li className="flex gap-2">
              <span>3.</span>
              <span>Tap "Add" to confirm</span>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}