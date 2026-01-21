import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import LiquidBackground from './components/LiquidBackground';
import CloudDisplay from './components/CloudDisplay';
import ControlPanel from './components/ControlPanel';
import AdminPanel from './components/AdminPanel';
import QRCodeModal from './components/QRCodeModal';
import ThemeSwitcher from './components/ThemeSwitcher';
import { usePresence } from './lib/presence';

function App() {
  const [sessionId, setSessionId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlRoom = urlParams.get('room');
    const savedRoom = localStorage.getItem('wordcloud_room');
    return urlRoom || savedRoom || 'main';
  });

  const [roomInput, setRoomInput] = useState(sessionId);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [copied, setCopied] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cloudRef = useRef<HTMLDivElement>(null);

  // Track online users
  const { onlineCount } = usePresence(sessionId);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/cloud/?room=${sessionId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    localStorage.setItem('wordcloud_room', sessionId);
    const url = new URL(window.location.href);
    url.searchParams.set('room', sessionId);
    window.history.replaceState({}, '', url.toString());
  }, [sessionId]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ESC to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleRoomChange = () => {
    if (roomInput.trim()) {
      setSessionId(roomInput.trim());
    }
    setIsEditingRoom(false);
  };

  const generateRandomRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomInput(randomId);
    setSessionId(randomId);
    setIsEditingRoom(false);
  };

  // Fullscreen mode
  if (isFullscreen) {
    return (
      <LiquidBackground>
        <div className="w-full h-full relative">
          <div ref={cloudRef} className="w-full h-full">
            <CloudDisplay sessionId={sessionId} />
          </div>
          {/* Exit button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={() => setIsFullscreen(false)}
            className="absolute bottom-4 right-4 glass px-4 py-2 rounded-xl text-white/60 hover:text-white flex items-center gap-2 text-sm"
          >
            <span>ESC</span>
            <span>退出全螢幕</span>
          </motion.button>
        </div>
      </LiquidBackground>
    );
  }

  return (
    <LiquidBackground>
      <div className="w-full h-full flex flex-col">
        {/* Header */}
        {/* V7: 精簡化 Header - 滿版設計 */}
        <header className="flex-shrink-0 p-2 md:p-3 lg:p-4">
          <div className="glass-header rounded-xl md:rounded-2xl px-3 md:px-4 lg:px-6 py-2.5 md:py-3 lg:py-4">
            <div className="flex items-center justify-between gap-2 md:gap-3">
              {/* Logo - 精簡版 */}
              <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/40"
                >
                  <span className="text-lg md:text-xl lg:text-2xl">☁️</span>
                </motion.div>
                <h1 className="hidden md:block text-white font-bold text-base lg:text-xl">文字雲</h1>
              </div>

              {/* Room selector - 置中 */}
              <div className="flex-1 flex justify-center min-w-0 px-2">
                {isEditingRoom ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 md:gap-2 w-full max-w-xs md:max-w-sm"
                  >
                    <input
                      type="text"
                      value={roomInput}
                      onChange={(e) => setRoomInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRoomChange()}
                      placeholder="房間 ID"
                      autoFocus
                      className="glass-input flex-1 min-w-0 px-2.5 md:px-3 py-2 md:py-2.5 rounded-lg text-white text-sm font-medium"
                    />
                    <button
                      onClick={generateRandomRoom}
                      className="btn-secondary p-2 rounded-lg text-base flex-shrink-0"
                    >
                      🎲
                    </button>
                    <button
                      onClick={handleRoomChange}
                      className="btn-primary px-3 py-2 rounded-lg text-white text-sm font-bold flex-shrink-0"
                    >
                      ✓
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditingRoom(true)}
                    className="btn-secondary flex items-center gap-1.5 md:gap-2 px-2.5 md:px-4 py-1.5 md:py-2.5 rounded-lg md:rounded-xl"
                  >
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-dot shadow-lg shadow-emerald-400/50" />
                    <span className="text-white font-bold text-sm md:text-base font-mono truncate max-w-[80px] md:max-w-[120px]">{sessionId}</span>
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </motion.button>
                )}
              </div>

              {/* Action buttons - 緊湊排列 */}
              <div className="flex items-center gap-1 md:gap-1.5 flex-shrink-0">
                {/* Copy link */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-medium transition-all duration-300 ${copied
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
                    : 'btn-secondary text-white/80 hover:text-white'
                    }`}
                >
                  {copied ? (
                    <>
                      <motion.span
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="text-base"
                      >
                        ✓
                      </motion.span>
                      <span className="hidden lg:inline text-xs font-bold">已複製</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">🔗</span>
                      <span className="hidden lg:inline text-xs">複製</span>
                    </>
                  )}
                </motion.button>

                {/* QR Code */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowQRCode(true)}
                  className="btn-secondary p-1.5 md:p-2 rounded-lg text-base md:text-lg"
                  title="QR Code"
                >
                  📱
                </motion.button>

                {/* Theme Switcher */}
                <ThemeSwitcher />

                {/* Admin */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAdmin(true)}
                  className="btn-secondary p-1.5 md:p-2 rounded-lg text-base md:text-lg"
                  title="管理員"
                >
                  🔧
                </motion.button>

                {/* Online count - 更緊湊版本 */}
                <div className="flex items-center gap-1.5 px-2 md:px-2.5 py-1.5 md:py-2 glass rounded-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-white font-medium text-xs md:text-sm">{onlineCount}</span>
                  <span className="hidden md:inline text-white/50 text-xs">人</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row gap-2 md:gap-4 lg:gap-6 p-2 md:p-4 lg:p-6">
          {isMobile ? (
            <>
              <div ref={cloudRef} className="flex-1 min-h-0">
                <CloudDisplay sessionId={sessionId} />
              </div>
              <div className="flex-shrink-0">
                <InputInterfaceMobile sessionId={sessionId} />
              </div>
            </>
          ) : (
            <>
              {/* V7: 左側控制面板 */}
              <aside className="w-[320px] lg:w-[360px] xl:w-[380px] flex-shrink-0 h-full">
                <ControlPanel sessionId={sessionId} />
              </aside>

              {/* V7: 右側視覺化舞台 */}
              <div ref={cloudRef} className="flex-1 min-w-0 h-full visualization-stage rounded-2xl overflow-hidden">
                <CloudDisplay sessionId={sessionId} />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <AdminPanel
        sessionId={sessionId}
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
        cloudRef={cloudRef}
        onFullscreen={() => setIsFullscreen(true)}
      />
      <QRCodeModal
        sessionId={sessionId}
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
      />
    </LiquidBackground>
  );
}

// Compact mobile input interface
import { type FormEvent } from 'react';
import { addWord } from './lib/firebase';

function InputInterfaceMobile({ sessionId }: { sessionId: string }) {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addWord(sessionId, text);
      setInputValue('');
    } catch (error) {
      console.error('Failed to submit word:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mobile-input-container rounded-t-3xl p-4 pb-6 shadow-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* 輸入框區塊 */}
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="💭 輸入詞彙..."
            maxLength={15}
            className="mobile-input w-full px-5 py-4 rounded-2xl text-white text-lg font-medium pr-16"
            disabled={isSubmitting}
          />
          {/* 字數指示器 */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium">
            {inputValue.length}/15
          </div>
        </div>

        {/* 按鈕列 */}
        <div className="flex gap-3">
          <motion.button
            type="submit"
            disabled={!inputValue.trim() || isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex-1 py-4 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-3 shadow-lg shadow-violet-500/40 disabled:opacity-50"
          >
            {isSubmitting ? (
              <motion.div
                className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>送出</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}

export default App;
