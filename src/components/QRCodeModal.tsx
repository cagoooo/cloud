import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

interface QRCodeModalProps {
    sessionId: string;
    isOpen: boolean;
    onClose: () => void;
}

const QRCodeModal = ({ sessionId, isOpen, onClose }: QRCodeModalProps) => {
    const roomUrl = `${window.location.origin}/cloud/?room=${sessionId}`;
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(roomUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
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
                    className="glass-strong rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl overflow-hidden border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header - 更繽紛 */}
                    <div className="text-center mb-6">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
                            className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-500 flex items-center justify-center shadow-2xl shadow-cyan-500/40 border-2 border-white/20"
                        >
                            <span className="text-4xl md:text-5xl">📱</span>
                        </motion.div>
                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent mb-2">
                            掃描加入房間
                        </h2>
                        <p className="text-white/60 text-sm md:text-base">
                            掃描 QR Code 或複製連結
                        </p>
                    </div>

                    {/* QR Code - 彩色邊框 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative mb-6"
                    >
                        {/* 彩色光暈背景 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-violet-500/30 rounded-3xl blur-xl"></div>
                        <div className="relative bg-white rounded-2xl p-5 shadow-2xl border-4 border-gradient-to-r from-cyan-400 to-violet-400">
                            <QRCodeSVG
                                value={roomUrl}
                                size={240}
                                level="M"
                                className="w-full h-auto"
                                bgColor="#ffffff"
                                fgColor="#1a1a2e"
                            />
                        </div>
                    </motion.div>

                    {/* Room ID - 漸層卡片 */}
                    <div className="bg-gradient-to-r from-violet-600/50 to-fuchsia-600/50 rounded-2xl p-5 mb-5 text-center border border-violet-400/30 shadow-lg">
                        <p className="text-white/70 text-xs md:text-sm mb-2 font-medium">房間 ID</p>
                        <p className="text-white font-bold text-2xl md:text-3xl font-mono tracking-widest">{sessionId}</p>
                    </div>

                    {/* Copy URL button - 更繽紛 */}
                    <motion.button
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleCopy}
                        className={`w-full py-5 rounded-2xl font-bold text-lg md:text-xl text-white flex items-center justify-center gap-4 transition-all duration-300 border border-white/20 ${copied
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-2xl shadow-emerald-500/40'
                            : 'bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60'
                            }`}
                    >
                        {copied ? (
                            <>
                                <motion.span
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="text-2xl"
                                >
                                    ✓
                                </motion.span>
                                <span>已複製連結！</span>
                            </>
                        ) : (
                            <>
                                <span className="text-2xl">🔗</span>
                                <span>複製連結</span>
                            </>
                        )}
                    </motion.button>

                    {/* Close hint - 更明顯 */}
                    <p className="text-center text-white/40 text-sm mt-5 flex items-center justify-center gap-2">
                        <span>💡</span>
                        <span>點擊外部區域關閉</span>
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default QRCodeModal;
