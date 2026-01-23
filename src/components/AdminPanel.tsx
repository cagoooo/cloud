import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toPng } from 'html-to-image';

interface AdminPanelProps {
    sessionId: string;
    isOpen: boolean;
    onClose: () => void;
    cloudRef: React.RefObject<HTMLDivElement | null>;
    onFullscreen: () => void;
}

const ADMIN_PASSWORD = 'smes1234';

const AdminPanel = ({ sessionId, isOpen, onClose, cloudRef, onFullscreen }: AdminPanelProps) => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');
    const [isClearing, setIsClearing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleLogin = () => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('密碼錯誤，請重試');
            setPassword('');
        }
    };

    const handleClearRoom = async () => {
        setIsClearing(true);
        try {
            const wordsRef = collection(db, 'sessions', sessionId, 'words');
            const snapshot = await getDocs(wordsRef);

            const deletePromises = snapshot.docs.map((docSnapshot) =>
                deleteDoc(doc(db, 'sessions', sessionId, 'words', docSnapshot.id))
            );

            await Promise.all(deletePromises);
            showMessage(`✓ 已成功清除 ${snapshot.size} 個詞彙`, 'success');
            setShowClearConfirm(false);
        } catch (err) {
            console.error('Clear error:', err);
            showMessage('✗ 清除失敗，請重試', 'error');
        } finally {
            setIsClearing(false);
        }
    };

    const handleExportPng = async () => {
        if (!cloudRef.current) return;

        setIsExporting(true);
        try {
            const dataUrl = await toPng(cloudRef.current, {
                backgroundColor: '#1a1a2e',
                pixelRatio: 2,
            });

            const link = document.createElement('a');
            link.download = `wordcloud-${sessionId}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            showMessage('✓ 圖片已下載', 'success');
        } catch (err) {
            console.error('Export error:', err);
            showMessage('✗ 匯出失敗，請重試', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const handleFullscreen = () => {
        onFullscreen();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="glass-strong rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {!isAuthenticated ? (
                        // ==================== LOGIN PANEL - 更繽紛版本 ====================
                        <div className="space-y-8">
                            {/* Header with icon - 更大更繽紛 */}
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
                                    className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-violet-500/40 border-2 border-white/20"
                                >
                                    <span className="text-5xl md:text-6xl">🔐</span>
                                </motion.div>
                                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent mb-3">
                                    管理員登入
                                </h2>
                                <p className="text-white/60 text-base md:text-lg">
                                    請輸入管理員密碼以繼續
                                </p>
                            </div>

                            {/* Password input - 更大更明顯 */}
                            <div className="space-y-5">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-2xl blur-xl"></div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                        placeholder="● ● ● ● ● ● ● ●"
                                        className="relative w-full px-8 py-6 rounded-2xl bg-white/10 border-2 border-violet-400/40 text-white text-xl md:text-2xl text-center tracking-[0.5em] font-bold placeholder:text-white/30 placeholder:tracking-[0.3em] focus:border-violet-400 focus:bg-white/15 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all"
                                        autoFocus
                                    />
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className="flex items-center justify-center gap-3 px-5 py-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-base font-medium"
                                    >
                                        <span className="text-xl">⚠️</span>
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02, y: -3 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleLogin}
                                    className="w-full py-6 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 font-bold text-xl md:text-2xl text-white shadow-2xl shadow-violet-500/40 flex items-center justify-center gap-4 border border-white/20 hover:shadow-violet-500/60 transition-all"
                                >
                                    <span className="text-2xl">🚀</span>
                                    <span>登入管理後台</span>
                                </motion.button>
                            </div>

                            {/* Close hint - 更明顯 */}
                            <p className="text-center text-white/40 text-sm flex items-center justify-center gap-2">
                                <span>💡</span>
                                <span>點擊外部區域關閉</span>
                            </p>
                        </div>
                    ) : (
                        // ==================== ADMIN DASHBOARD - 更繽紛版本 ====================
                        <div className="space-y-6">
                            {/* Header - 更繽紛 */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 200 }}
                                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40 border-2 border-white/20"
                                    >
                                        <span className="text-3xl">⚙️</span>
                                    </motion.div>
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">管理後台</h2>
                                        <p className="text-emerald-400/70 text-sm font-medium">已登入為管理員</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 text-xl transition-all"
                                >
                                    ✕
                                </motion.button>
                            </div>

                            {/* Message toast */}
                            <AnimatePresence>
                                {message.text && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        className={`px-5 py-4 rounded-xl text-center font-bold text-base ${message.type === 'success'
                                            ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-400 border-2 border-emerald-500/40'
                                            : 'bg-gradient-to-r from-red-500/25 to-rose-500/25 text-red-400 border-2 border-red-500/40'
                                            }`}
                                    >
                                        {message.text}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Room info card - 更繽紛 */}
                            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl p-5 flex items-center gap-4 border border-cyan-500/30 shadow-lg">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/40">
                                    <span className="text-2xl">🏠</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-cyan-400/70 text-sm font-medium">目前房間</p>
                                    <p className="text-white font-bold text-2xl font-mono tracking-wide">{sessionId}</p>
                                </div>
                                <div className="relative flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 shadow-lg shadow-emerald-400/50"></span>
                                </div>
                            </div>

                            {/* Action buttons grid - 更繽紛 */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Export PNG */}
                                <motion.button
                                    whileHover={{ scale: 1.03, y: -4 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleExportPng}
                                    disabled={isExporting}
                                    className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 rounded-2xl p-6 flex flex-col items-center gap-4 transition-all border border-amber-500/30 hover:border-amber-500/50 shadow-lg"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-2xl shadow-orange-500/40 border border-white/20">
                                        <span className="text-3xl">{isExporting ? '⏳' : '📷'}</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-bold text-base">匯出圖片</p>
                                        <p className="text-amber-400/60 text-xs font-medium">PNG 高解析度</p>
                                    </div>
                                </motion.button>

                                {/* Fullscreen */}
                                <motion.button
                                    whileHover={{ scale: 1.03, y: -4 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleFullscreen}
                                    className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 rounded-2xl p-6 flex flex-col items-center gap-4 transition-all border border-purple-500/30 hover:border-purple-500/50 shadow-lg"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/40 border border-white/20">
                                        <span className="text-3xl">🖥️</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-bold text-base">全螢幕模式</p>
                                        <p className="text-purple-400/60 text-xs font-medium">簡報投影用</p>
                                    </div>
                                </motion.button>
                            </div>

                            {/* Clear room - danger zone - 更明顯 */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                    <span className="text-base">⚠️</span>
                                    <span className="text-red-400/80 text-xs font-bold">危險操作區域</span>
                                </div>

                                {!showClearConfirm ? (
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowClearConfirm(true)}
                                        className="w-full py-5 rounded-xl bg-gradient-to-r from-red-500/15 to-rose-500/15 hover:from-red-500/25 hover:to-rose-500/25 border-2 border-red-500/40 hover:border-red-500/60 text-red-400 font-bold text-base flex items-center justify-center gap-3 transition-all"
                                    >
                                        <span className="text-xl">🗑️</span>
                                        <span>清除所有詞彙</span>
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-gradient-to-r from-red-500/15 to-rose-500/15 rounded-2xl p-5 space-y-4 border-2 border-red-500/40"
                                    >
                                        <p className="text-red-400 text-center font-bold text-base flex items-center justify-center gap-2">
                                            <span className="text-2xl">⚠️</span>
                                            <span>確定要清除所有詞彙嗎？此操作無法復原！</span>
                                        </p>
                                        <div className="flex gap-3">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setShowClearConfirm(false)}
                                                className="flex-1 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-all"
                                            >
                                                取消
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleClearRoom}
                                                disabled={isClearing}
                                                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold shadow-2xl shadow-red-500/40 transition-all"
                                            >
                                                {isClearing ? '清除中...' : '確定清除'}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Logout - 更明顯 */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={() => {
                                    setIsAuthenticated(false);
                                    setPassword('');
                                    setShowClearConfirm(false);
                                }}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white/50 hover:text-white/80 text-sm font-medium flex items-center justify-center gap-2 transition-all"
                            >
                                <span>🚪</span>
                                <span>登出管理員</span>
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AdminPanel;
