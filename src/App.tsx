import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import LiquidBackground from './components/LiquidBackground';
import CloudDisplay from './components/CloudDisplay';
import ControlPanel from './components/ControlPanel';
import AdminPanel from './components/AdminPanel';
import QRCodeModal from './components/QRCodeModal';
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

              {/* Room selector - 更繽紛醒目版本 */}
              <div className="flex-1 flex justify-center min-w-0 px-2">
                {isEditingRoom ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 md:gap-3 w-full max-w-xs md:max-w-md"
                  >
                    <input
                      type="text"
                      value={roomInput}
                      onChange={(e) => setRoomInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRoomChange()}
                      placeholder="輸入房間名稱..."
                      autoFocus
                      className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/10 border-2 border-violet-400/50 text-white text-base font-semibold placeholder:text-white/40 focus:border-violet-400 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-violet-400/30 transition-all"
                    />
                    <button
                      onClick={generateRandomRoom}
                      className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 transition-all flex-shrink-0"
                      title="隨機房間"
                    >
                      🎲
                    </button>
                    <button
                      onClick={handleRoomChange}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all flex-shrink-0"
                    >
                      ✓
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsEditingRoom(true)}
                    className="group flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80 border border-white/20 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
                  >
                    {/* 動態連線指示燈 */}
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 shadow-lg shadow-emerald-400/50"></span>
                    </span>
                    {/* 房間名稱 */}
                    <span className="text-white font-bold text-base md:text-lg font-mono tracking-wide truncate max-w-[100px] md:max-w-[160px] lg:max-w-[200px]">
                      {sessionId}
                    </span>
                    {/* 編輯圖示 */}
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white/70 group-hover:text-white transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </motion.button>
                )}
              </div>

              {/* Action buttons - 更繽紛醒目版本 */}
              <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                {/* Copy link - 藍色漸層 */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleCopyLink}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl font-semibold transition-all duration-300 ${copied
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/40'
                    : 'bg-gradient-to-r from-sky-500/80 to-cyan-500/80 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40'
                    }`}
                  title="複製連結"
                >
                  {copied ? (
                    <>
                      <motion.span
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="text-lg"
                      >
                        ✓
                      </motion.span>
                      <span className="hidden md:inline text-sm font-bold">已複製</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">🔗</span>
                      <span className="hidden md:inline text-sm">複製</span>
                    </>
                  )}
                </motion.button>

                {/* QR Code - 紫色漸層 */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setShowQRCode(true)}
                  className="p-2.5 md:p-3 rounded-xl bg-gradient-to-r from-violet-500/80 to-purple-500/80 text-white text-lg md:text-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
                  title="QR Code"
                >
                  📱
                </motion.button>

                {/* Admin - 橙色漸層 */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setShowAdmin(true)}
                  className="p-2.5 md:p-3 rounded-xl bg-gradient-to-r from-amber-500/80 to-orange-500/80 text-white text-lg md:text-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
                  title="管理員"
                >
                  🔧
                </motion.button>

                {/* Online count - 綠色漸層背景 */}
                <div className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-emerald-600/70 to-teal-600/70 rounded-xl border border-emerald-400/30 shadow-lg shadow-emerald-500/20">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white shadow-lg"></span>
                  </span>
                  <span className="text-white font-bold text-sm md:text-base">{onlineCount}</span>
                  <span className="hidden md:inline text-white/80 text-xs font-medium">人在線</span>
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
    <div className="rounded-t-3xl p-5 pb-7 shadow-2xl bg-gradient-to-b from-slate-900/95 via-violet-950/90 to-slate-900/95 border-t-2 border-violet-500/30 backdrop-blur-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* 繽紛標題 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-xl">💭</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-base">輸入你的想法</h3>
            <p className="text-white/50 text-xs">按 Enter 或點擊送出</p>
          </div>
        </div>

        {/* 輸入框區塊 - 彩色邊框 */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-2xl blur-md"></div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="輸入詞彙..."
            maxLength={15}
            className="relative w-full px-5 py-5 rounded-2xl bg-white/10 border-2 border-violet-400/40 text-white text-lg font-semibold pr-20 placeholder:text-white/40 focus:border-violet-400 focus:bg-white/15 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all"
            disabled={isSubmitting}
          />
          {/* 字數指示器 - 彩色版 */}
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold px-2 py-1 rounded-lg ${inputValue.length > 12
              ? 'bg-amber-500/20 text-amber-400'
              : inputValue.length > 0
                ? 'bg-violet-500/20 text-violet-400'
                : 'text-white/40'
            }`}>
            {inputValue.length}/15
          </div>
        </div>

        {/* 按鈕 - 更繽紛 */}
        <motion.button
          type="submit"
          disabled={!inputValue.trim() || isSubmitting}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 font-bold text-xl text-white flex items-center justify-center gap-4 shadow-2xl shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 hover:shadow-violet-500/60 transition-all"
        >
          {isSubmitting ? (
            <motion.div
              className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>送出</span>
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}

export default App;
