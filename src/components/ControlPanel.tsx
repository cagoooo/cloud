import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { addWord, useWords } from '../lib/firebase';

interface ControlPanelProps {
    sessionId: string;
}

const ControlPanel = ({ sessionId }: ControlPanelProps) => {
    const [inputValue, setInputValue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { words } = useWords(sessionId);

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

    const totalVotes = words.reduce((s, w) => s + w.value, 0);
    const topWord = words.length > 0 ? words[0] : null;

    return (
        <div className="h-full flex flex-col">
            {/* V9: 緊湊型控制面板 - 適合 15 字輸入 */}
            <div className="control-panel-glass rounded-2xl p-5 flex flex-col gap-4">

                {/* 輸入區 - 緊湊版 */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                    {/* 輕量提示標題 */}
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                        <span>💭</span>
                        <span>輸入你的想法</span>
                    </div>

                    {/* 單行輸入框 + 按鈕 */}
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="輸入詞彙..."
                                maxLength={15}
                                className="control-input w-full px-4 py-3.5 rounded-xl text-white text-base font-medium focus:outline-none placeholder:text-white/30 pr-14"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs font-medium">
                                {inputValue.length}/15
                            </div>
                        </div>
                        <motion.button
                            type="submit"
                            disabled={!inputValue.trim() || isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary px-6 py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            {isSubmitting ? (
                                <motion.div
                                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    <span>送出</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>

                {/* 分隔線 */}
                <div className="h-px bg-white/10 my-4" />

                {/* 統計資訊 - 緊湊型橫向佈局 */}
                <div className="flex-shrink-0">
                    <div className="flex items-center justify-between gap-4">
                        {/* 左側：數字統計 */}
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-xl font-bold text-white">{words.length}</div>
                                <div className="text-white/40 text-xs">詞彙</div>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="text-center">
                                <div className="text-xl font-bold text-white">{totalVotes}</div>
                                <div className="text-white/40 text-xs">票數</div>
                            </div>
                        </div>

                        {/* 右側：熱門詞彙 */}
                        {topWord && topWord.value > 1 && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500/15 to-orange-500/15 rounded-lg">
                                <span>🔥</span>
                                <div>
                                    <div className="text-amber-400 font-bold text-sm truncate max-w-[100px]">
                                        {topWord.text}
                                    </div>
                                    <div className="text-white/40 text-xs">×{topWord.value}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;
