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
                className="glass-strong rounded-2xl md:rounded-3xl p-5 md:p-6 lg:p-8"
            >
                {/* Header - LARGER */}
                <div className="text-center mb-6 md:mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-5 rounded-2xl md:rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-500/40"
                    >
                        <span className="text-3xl md:text-4xl">💭</span>
                    </motion.div>
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 md:mb-3">
                        分享你的想法
                    </h2>
                    <p className="text-white/60 text-sm md:text-base lg:text-lg">
                        輸入詞彙，即時顯示在文字雲
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    {/* Input - LARGER */}
                    <div className="relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="輸入你想說的..."
                            maxLength={30}
                            className="glass-input w-full px-5 md:px-6 py-5 md:py-6 rounded-xl md:rounded-2xl text-white text-lg md:text-xl font-medium pr-16 md:pr-20"
                            disabled={isSubmitting}
                        />
                        <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-white/40 text-sm md:text-base font-medium">
                            {inputValue.length}/30
                        </div>
                    </div>

                    {/* Submit button - MUCH LARGER */}
                    <motion.button
                        type="submit"
                        disabled={!inputValue.trim() || isSubmitting}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-primary w-full py-5 md:py-6 lg:py-7 rounded-xl md:rounded-2xl font-bold text-xl md:text-2xl text-white flex items-center justify-center gap-3 md:gap-4 shadow-xl shadow-violet-500/30"
                    >
                        {isSubmitting ? (
                            <>
                                <motion.div
                                    className="w-7 h-7 md:w-8 md:h-8 border-3 border-white/30 border-t-white rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                                <span>發送中...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                <span>送出</span>
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Quick suggestions - LARGER BUTTONS */}
                <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-white/10">
                    <p className="text-white/50 text-sm md:text-base text-center mb-4 font-medium">
                        ⚡ 快速輸入
                    </p>
                    <div className="grid grid-cols-4 gap-2 md:gap-3">
                        {quickWords.map((word, i) => (
                            <motion.button
                                key={word.text}
                                type="button"
                                onClick={() => setInputValue(word.text)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * i }}
                                whileHover={{ scale: 1.08, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-secondary py-4 md:py-5 rounded-xl md:rounded-2xl text-white/90 hover:text-white flex flex-col items-center gap-1 md:gap-2 hover:shadow-lg transition-shadow"
                            >
                                <span className="text-2xl md:text-3xl">{word.emoji}</span>
                                <span className="text-sm md:text-base font-semibold">{word.text}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default InputInterface;
