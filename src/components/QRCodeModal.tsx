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
                    className="glass-strong rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="text-center mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.1 }}
                            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/30"
                        >
                            <span className="text-3xl">📱</span>
                        </motion.div>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                            掃描加入房間
                        </h2>
                        <p className="text-white/50 text-sm">
                            掃描 QR Code 或複製連結
                        </p>
                    </div>

                    {/* QR Code */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-4 mb-6 shadow-lg overflow-hidden"
                    >
                        <QRCodeSVG
                            value={roomUrl}
                            size={240}
                            level="M"
                            className="w-full h-auto"
                            bgColor="#ffffff"
                            fgColor="#1a1a2e"
                        />
                    </motion.div>

                    {/* Room ID */}
                    <div className="glass rounded-xl p-4 mb-4 text-center overflow-hidden">
                        <p className="text-white/50 text-xs mb-1">房間 ID</p>
                        <p className="text-white font-bold text-2xl font-mono tracking-wider">{sessionId}</p>
                    </div>

                    {/* Copy URL button with feedback */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCopy}
                        className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-3 transition-all duration-300 ${copied
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30'
                                : 'btn-primary'
                            }`}
                    >
                        {copied ? (
                            <>
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-xl"
                                >
                                    ✓
                                </motion.span>
                                <span>已複製連結！</span>
                            </>
                        ) : (
                            <>
                                <span>🔗</span>
                                <span>複製連結</span>
                            </>
                        )}
                    </motion.button>

                    {/* Close hint */}
                    <p className="text-center text-white/30 text-xs mt-4">
                        點擊外部區域關閉
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default QRCodeModal;
