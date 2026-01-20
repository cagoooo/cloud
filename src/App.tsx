import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidBackground from './components/LiquidBackground';
import InputInterface from './components/InputInterface';
import CloudDisplay from './components/CloudDisplay';
import AdminPanel from './components/AdminPanel';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cloudRef = useRef<HTMLDivElement>(null);

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
        <header className="flex-shrink-0 p-2 md:p-4 lg:p-5">
          <div className="max-w-7xl mx-auto">
            <div className="glass-strong rounded-xl md:rounded-2xl lg:rounded-3xl px-3 md:px-6 lg:px-8 py-2 md:py-4 lg:py-5">
              <div className="flex items-center justify-between gap-2 md:gap-4">
                {/* Logo */}
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg md:rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/40"
                  >
                    <span className="text-xl md:text-3xl lg:text-4xl">☁️</span>
                  </motion.div>
                  <div className="hidden sm:block">
                    <h1 className="text-white font-bold text-base md:text-xl lg:text-2xl">WordCloud</h1>
                    <p className="text-white/60 text-xs md:text-sm">即時互動文字雲</p>
                  </div>
                </div>

                {/* Room selector */}
                <div className="flex-1 flex justify-center max-w-xs md:max-w-md">
                  {isEditingRoom ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 md:gap-3 w-full"
                    >
                      <input
                        type="text"
                        value={roomInput}
                        onChange={(e) => setRoomInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRoomChange()}
                        placeholder="房間 ID"
                        autoFocus
                        className="glass-input flex-1 min-w-0 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl text-white text-sm md:text-base font-medium"
                      />
                      <button
                        onClick={generateRandomRoom}
                        className="btn-secondary p-2 md:p-3 rounded-lg md:rounded-xl text-base md:text-xl flex-shrink-0"
                      >
                        🎲
                      </button>
                      <button
                        onClick={handleRoomChange}
                        className="btn-primary px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl text-white text-sm md:text-base font-bold flex-shrink-0"
                      >
                        ✓
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditingRoom(true)}
                      className="btn-secondary flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl"
                    >
                      <span className="w-2 h-2 md:w-3 md:h-3 bg-emerald-400 rounded-full animate-pulse-dot shadow-lg shadow-emerald-400/50" />
                      <span className="text-white font-bold text-sm md:text-lg font-mono truncate max-w-[100px] md:max-w-none">{sessionId}</span>
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-white/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </motion.button>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  {/* Copy link button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyLink}
                    className={`flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 flex-shrink-0 ${copied
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'btn-secondary text-white/80 hover:text-white'
                      }`}
                  >
                    {copied ? (
                      <>
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-lg md:text-xl"
                        >
                          ✓
                        </motion.span>
                        <span className="hidden sm:inline text-sm md:text-base">已複製！</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg md:text-xl">🔗</span>
                        <span className="hidden sm:inline text-sm md:text-base">複製連結</span>
                      </>
                    )}
                  </motion.button>

                  {/* Admin button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAdmin(true)}
                    className="btn-secondary p-2 md:p-3 rounded-lg md:rounded-xl text-lg md:text-xl"
                    title="管理員"
                  >
                    🔧
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content - SPLIT VIEW FOR MOBILE */}
        <main className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row gap-2 md:gap-4 lg:gap-6 p-2 md:p-4 lg:p-6">
          {isMobile ? (
            // Mobile: Vertical stack - Cloud on top, Input on bottom
            <>
              {/* Cloud display - top half */}
              <div ref={cloudRef} className="flex-1 min-h-0">
                <CloudDisplay sessionId={sessionId} />
              </div>

              {/* Input interface - bottom, scrollable */}
              <div className="flex-shrink-0">
                <InputInterfaceMobile sessionId={sessionId} />
              </div>
            </>
          ) : (
            // Desktop: Side by side
            <>
              <div ref={cloudRef} className="flex-1 min-w-0 h-full">
                <CloudDisplay sessionId={sessionId} />
              </div>
              <div className="w-[340px] lg:w-[400px] xl:w-[420px] flex-shrink-0 h-full flex items-center justify-center overflow-y-auto">
                <InputInterface sessionId={sessionId} />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Admin Panel Modal */}
      <AdminPanel
        sessionId={sessionId}
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
        cloudRef={cloudRef}
        onFullscreen={() => setIsFullscreen(true)}
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

  const quickWords = [
    { emoji: '😊', text: '開心' },
    { emoji: '💪', text: '加油' },
    { emoji: '👍', text: '讚' },
    { emoji: '❤️', text: '愛' },
  ];

  return (
    <div className="glass-strong rounded-2xl p-4">
      {/* Input row */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="輸入你想說的..."
          maxLength={30}
          className="glass-input flex-1 min-w-0 px-5 py-4 rounded-xl text-white text-lg font-medium"
          disabled={isSubmitting}
        />
        <motion.button
          type="submit"
          disabled={!inputValue.trim() || isSubmitting}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn-primary px-6 py-4 rounded-xl font-bold text-lg text-white flex items-center gap-2 flex-shrink-0 shadow-lg shadow-violet-500/30"
        >
          {isSubmitting ? (
            <motion.div
              className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
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
      </form>

      {/* Quick buttons - LARGER */}
      <div className="grid grid-cols-4 gap-2">
        {quickWords.map((word) => (
          <motion.button
            key={word.text}
            type="button"
            onClick={() => setInputValue(word.text)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary py-3 rounded-xl text-white/90 hover:text-white flex flex-col items-center gap-1"
          >
            <span className="text-2xl">{word.emoji}</span>
            <span className="text-sm font-semibold">{word.text}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default App;
