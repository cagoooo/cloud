import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addWord } from '../lib/firebase';

interface InputInterfaceProps {
    sessionId: string;
}

interface FloatingBubble {
    id: number;
    text: string;
    color: string;
}

const BUBBLE_COLORS = [
    'from-violet-500 to-purple-600',
    'from-cyan-400 to-blue-500',
    'from-pink-500 to-rose-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-orange-500',
];

const InputInterface = ({ sessionId }: InputInterfaceProps) => {
    const [inputValue, setInputValue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bubbles, setBubbles] = useState<FloatingBubble[]>([]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const text = inputValue.trim();

        if (!text || isSubmitting) return;

        setIsSubmitting(true);

        try {
            await addWord(sessionId, text);

            const newBubble: FloatingBubble = {
                id: Date.now(),
                text: text.length > 8 ? text.slice(0, 8) + '...' : text,
                color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)]
            };
            setBubbles((prev) => [...prev, newBubble]);
            setTimeout(() => {
                setBubbles((prev) => prev.filter((b) => b.id !== newBubble.id));
            }, 2000);

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
        <div className="relative w-full max-w-[400px]">
            {/* Floating bubbles */}
            <AnimatePresence>
                {bubbles.map((bubble) => (
                    <motion.div
                        key={bubble.id}
                        initial={{ opacity: 1, y: 0, scale: 1 }}
                        animate={{ opacity: 0, y: -100, scale: 0.7 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 pointer-events-none z-50"
                    >
                        <div className={`bg-gradient-to-r ${bubble.color} px-5 py-3 rounded-full text-white font-bold text-base shadow-lg whitespace-nowrap`}>
                            ✨ {bubble.text}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Main card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-strong rounded-2xl p-4 md:p-5 lg:p-6"
            >
                {/* Header */}
                <div className="text-center mb-5">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-xl md:rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30"
                    >
                        <span className="text-2xl md:text-3xl">💭</span>
                    </motion.div>
                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1">
                        分享你的想法
                    </h2>
                    <p className="text-white/50 text-xs md:text-sm">
                        輸入詞彙，即時顯示在文字雲
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Input */}
                    <div className="relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="輸入你想說的..."
                            maxLength={30}
                            className="glass-input w-full px-4 py-4 rounded-xl text-white text-base md:text-lg font-medium pr-14"
                            disabled={isSubmitting}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs font-medium">
                            {inputValue.length}/30
                        </div>
                    </div>

                    {/* Submit button */}
                    <motion.button
                        type="submit"
                        disabled={!inputValue.trim() || isSubmitting}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-primary w-full py-4 rounded-xl font-bold text-base md:text-lg text-white flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
                    >
                        {isSubmitting ? (
                            <>
                                <motion.div
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                                <span>發送中...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                <span>送出</span>
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Quick suggestions */}
                <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/40 text-xs text-center mb-3 font-medium">
                        ⚡ 快速輸入
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                        {quickWords.map((word, i) => (
                            <motion.button
                                key={word.text}
                                type="button"
                                onClick={() => setInputValue(word.text)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * i }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-secondary py-3 rounded-xl text-white/80 hover:text-white flex flex-col items-center gap-1 hover:shadow-md transition-shadow"
                            >
                                <span className="text-xl md:text-2xl">{word.emoji}</span>
                                <span className="text-xs md:text-sm font-medium">{word.text}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default InputInterface;
