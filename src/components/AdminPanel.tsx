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
                        // ==================== LOGIN PANEL ====================
                        <div className="space-y-6">
                            {/* Header with icon */}
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.1 }}
                                    className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-xl shadow-violet-500/30"
                                >
                                    <span className="text-4xl">🔐</span>
                                </motion.div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    管理員登入
                                </h2>
                                <p className="text-white/50 text-sm md:text-base">
                                    請輸入管理員密碼以繼續
                                </p>
                            </div>

                            {/* Password input */}
                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                        placeholder="輸入密碼..."
                                        className="glass-input w-full px-6 py-5 rounded-2xl text-white text-lg text-center tracking-widest"
                                        autoFocus
                                    />
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center justify-center gap-2 text-red-400 text-sm"
                                    >
                                        <span>⚠️</span>
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleLogin}
                                    className="btn-primary w-full py-5 rounded-2xl font-bold text-lg text-white shadow-xl shadow-violet-500/30 flex items-center justify-center gap-3"
                                >
                                    <span>🚀</span>
                                    <span>登入管理後台</span>
                                </motion.button>
                            </div>

                            {/* Close hint */}
                            <p className="text-center text-white/30 text-xs">
                                點擊外部區域關閉
                            </p>
                        </div>
                    ) : (
                        // ==================== ADMIN DASHBOARD ====================
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                        <span className="text-2xl">⚙️</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl font-bold text-white">管理後台</h2>
                                        <p className="text-white/50 text-sm">已登入為管理員</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 text-xl"
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
                                        className={`px-5 py-4 rounded-xl text-center font-medium ${message.type === 'success'
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}
                                    >
                                        {message.text}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Room info card */}
                            <div className="glass rounded-2xl p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                    <span className="text-xl">🏠</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white/50 text-sm">目前房間</p>
                                    <p className="text-white font-bold text-xl font-mono">{sessionId}</p>
                                </div>
                                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                            </div>

                            {/* Action buttons grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Export PNG */}
                                <motion.button
                                    whileHover={{ scale: 1.03, y: -3 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleExportPng}
                                    disabled={isExporting}
                                    className="glass hover:bg-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all border border-transparent hover:border-white/20"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                        <span className="text-2xl">{isExporting ? '⏳' : '📷'}</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-semibold">匯出圖片</p>
                                        <p className="text-white/40 text-xs">PNG 高解析度</p>
                                    </div>
                                </motion.button>

                                {/* Fullscreen */}
                                <motion.button
                                    whileHover={{ scale: 1.03, y: -3 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleFullscreen}
                                    className="glass hover:bg-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all border border-transparent hover:border-white/20"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                        <span className="text-2xl">🖥️</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-semibold">全螢幕模式</p>
                                        <p className="text-white/40 text-xs">簡報投影用</p>
                                    </div>
                                </motion.button>
                            </div>

                            {/* Clear room - danger zone */}
                            <div className="space-y-3">
                                <p className="text-white/40 text-xs flex items-center gap-2">
                                    <span>⚠️</span>
                                    <span>危險操作區域</span>
                                </p>

                                {!showClearConfirm ? (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowClearConfirm(true)}
                                        className="w-full py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium flex items-center justify-center gap-3 transition-all"
                                    >
                                        <span className="text-xl">🗑️</span>
                                        <span>清除所有詞彙</span>
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="glass rounded-xl p-5 space-y-4 border border-red-500/30"
                                    >
                                        <p className="text-red-400 text-center font-medium flex items-center justify-center gap-2">
                                            <span className="text-xl">⚠️</span>
                                            <span>確定要清除所有詞彙嗎？此操作無法復原！</span>
                                        </p>
                                        <div className="flex gap-3">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setShowClearConfirm(false)}
                                                className="flex-1 py-4 rounded-xl glass hover:bg-white/10 text-white font-medium"
                                            >
                                                取消
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleClearRoom}
                                                disabled={isClearing}
                                                className="flex-1 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/30"
                                            >
                                                {isClearing ? '清除中...' : '確定清除'}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Logout */}
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                onClick={() => {
                                    setIsAuthenticated(false);
                                    setPassword('');
                                    setShowClearConfirm(false);
                                }}
                                className="w-full py-4 text-white/40 hover:text-white/60 text-sm flex items-center justify-center gap-2 transition-colors"
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
