import { useState, useRef } from 'react';
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
    const [message, setMessage] = useState('');

    const handleLogin = () => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('密碼錯誤');
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
            setMessage(`已清除 ${snapshot.size} 個詞彙`);
            setShowClearConfirm(false);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Clear error:', err);
            setMessage('清除失敗');
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

            setMessage('圖片已下載');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Export error:', err);
            setMessage('匯出失敗');
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
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass-strong rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-md w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                            <span className="text-2xl">🔧</span>
                            管理員面板
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white/50 hover:text-white text-2xl"
                        >
                            ✕
                        </button>
                    </div>

                    {!isAuthenticated ? (
                        // Login form
                        <div className="space-y-4">
                            <p className="text-white/60 text-sm">請輸入管理員密碼</p>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                placeholder="密碼"
                                className="glass-input w-full px-4 py-3 rounded-xl text-white"
                                autoFocus
                            />
                            {error && (
                                <p className="text-red-400 text-sm">{error}</p>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleLogin}
                                className="btn-primary w-full py-3 rounded-xl font-bold text-white"
                            >
                                登入
                            </motion.button>
                        </div>
                    ) : (
                        // Admin functions
                        <div className="space-y-4">
                            {/* Message toast */}
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass px-4 py-3 rounded-xl text-center text-white font-medium"
                                >
                                    {message}
                                </motion.div>
                            )}

                            {/* Room info */}
                            <div className="glass rounded-xl p-4">
                                <p className="text-white/50 text-sm">目前房間</p>
                                <p className="text-white font-bold text-lg font-mono">{sessionId}</p>
                            </div>

                            {/* Action buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Export PNG */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleExportPng}
                                    disabled={isExporting}
                                    className="btn-secondary py-4 rounded-xl flex flex-col items-center gap-2"
                                >
                                    <span className="text-2xl">{isExporting ? '⏳' : '📷'}</span>
                                    <span className="text-sm font-medium">匯出圖片</span>
                                </motion.button>

                                {/* Fullscreen */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleFullscreen}
                                    className="btn-secondary py-4 rounded-xl flex flex-col items-center gap-2"
                                >
                                    <span className="text-2xl">🖥️</span>
                                    <span className="text-sm font-medium">全螢幕</span>
                                </motion.button>
                            </div>

                            {/* Clear room - with confirmation */}
                            {!showClearConfirm ? (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowClearConfirm(true)}
                                    className="w-full py-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <span className="text-xl">🗑️</span>
                                    清除所有詞彙
                                </motion.button>
                            ) : (
                                <div className="glass rounded-xl p-4 space-y-3">
                                    <p className="text-red-400 text-center font-medium">
                                        ⚠️ 確定要清除所有詞彙嗎？
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowClearConfirm(false)}
                                            className="flex-1 py-3 rounded-xl glass hover:bg-white/10 text-white"
                                        >
                                            取消
                                        </button>
                                        <button
                                            onClick={handleClearRoom}
                                            disabled={isClearing}
                                            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold"
                                        >
                                            {isClearing ? '清除中...' : '確定清除'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Logout */}
                            <button
                                onClick={() => {
                                    setIsAuthenticated(false);
                                    setPassword('');
                                }}
                                className="w-full py-3 text-white/50 hover:text-white text-sm"
                            >
                                登出管理員
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AdminPanel;
