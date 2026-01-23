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
            <div className="control-panel-glass rounded-2xl p-5 flex flex-col gap-4 border border-violet-500/20">

                {/* 輸入區 - 繽紛版 */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* 繽紛提示標題 */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <span className="text-xl">💭</span>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">輸入你的想法</h3>
                            <p className="text-white/40 text-xs">按 Enter 或點擊送出</p>
                        </div>
                    </div>

                    {/* 單行輸入框 + 按鈕 - 彩色版 */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-xl blur-sm"></div>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="輸入詞彙..."
                                maxLength={15}
                                className="relative w-full px-4 py-4 rounded-xl bg-white/10 border-2 border-violet-400/30 text-white text-base font-semibold focus:outline-none focus:border-violet-400 focus:bg-white/15 focus:ring-2 focus:ring-violet-500/20 placeholder:text-white/30 pr-16 transition-all"
                            />
                            <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded ${inputValue.length > 12
                                ? 'bg-amber-500/20 text-amber-400'
                                : inputValue.length > 0
                                    ? 'bg-violet-500/20 text-violet-400'
                                    : 'text-white/30'
                                }`}>
                                {inputValue.length}/15
                            </div>
                        </div>
                        <motion.button
                            type="submit"
                            disabled={!inputValue.trim() || isSubmitting}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className="px-6 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 hover:shadow-violet-500/50 transition-all flex-shrink-0"
                        >
                            {isSubmitting ? (
                                <motion.div
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    <span>送出</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>

                {/* 分隔線 - 漸層 */}
                <div className="h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

                {/* 統計資訊 - 繽紛卡片版 */}
                <div className="flex items-center justify-between gap-3">
                    {/* 左側：數字統計卡片 */}
                    <div className="flex items-center gap-3">
                        <div className="text-center px-4 py-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
                            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{words.length}</div>
                            <div className="text-cyan-400/70 text-xs font-medium">詞彙</div>
                        </div>
                        <div className="text-center px-4 py-2 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl border border-violet-500/30">
                            <div className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">{totalVotes}</div>
                            <div className="text-violet-400/70 text-xs font-medium">票數</div>
                        </div>
                    </div>

                    {/* 右側：熱門詞彙 - 更繽紛 */}
                    {topWord && topWord.value > 1 && (
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500/25 to-orange-500/25 rounded-xl border border-amber-500/40 shadow-lg shadow-amber-500/10">
                            <span className="text-xl">🔥</span>
                            <div>
                                <div className="text-amber-400 font-bold text-sm truncate max-w-[100px]">
                                    {topWord.text}
                                </div>
                                <div className="text-amber-400/60 text-xs font-medium">×{topWord.value}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 即時排行榜 - 更繽紛 */}
            {words.length > 0 && (
                <div className="control-panel-glass rounded-2xl p-4 mt-3 flex-1 min-h-0 flex flex-col border border-violet-500/20">
                    {/* 標題區 */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                            <span className="text-sm">📊</span>
                        </div>
                        <div className="flex-1">
                            <span className="text-white font-bold text-sm">即時排行榜</span>
                        </div>
                        <span className="text-white/40 text-xs bg-white/10 px-2 py-1 rounded-lg">點擊 +1</span>
                    </div>

                    {/* 排行榜列表 - 可滾動顯示所有詞彙 */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin min-h-0">
                        {words.map((word, index) => {
                            const maxValue = words[0]?.value || 1;
                            const percentage = (word.value / maxValue) * 100;
                            const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
                            const isTop3 = index < 3;

                            return (
                                <motion.button
                                    key={word.text}
                                    onClick={() => addWord(sessionId, word.text)}
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full text-left group p-2.5 rounded-xl transition-all ${isTop3
                                        ? 'bg-gradient-to-r from-white/5 to-white/10 border border-white/10 hover:border-white/20'
                                        : 'hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* 排名 - 更大更明顯 */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${index === 0 ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/30' :
                                            index === 1 ? 'bg-gradient-to-br from-slate-400/30 to-slate-500/30' :
                                                index === 2 ? 'bg-gradient-to-br from-amber-600/30 to-orange-600/30' :
                                                    'bg-white/10'
                                            }`}>
                                            {rankIcon ? (
                                                <span className="text-lg">{rankIcon}</span>
                                            ) : (
                                                <span className="text-white/50 text-sm font-bold">{index + 1}</span>
                                            )}
                                        </div>

                                        {/* 詞彙和進度條 */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className={`truncate font-semibold ${isTop3 ? 'text-white text-sm' : 'text-white/70 text-sm'
                                                    } group-hover:text-cyan-400 transition-colors`}>
                                                    {word.text}
                                                </span>
                                                <span className={`ml-2 text-xs font-bold flex-shrink-0 px-2 py-0.5 rounded ${index === 0 ? 'bg-amber-500/20 text-amber-400' :
                                                    index === 1 ? 'bg-cyan-500/20 text-cyan-400' :
                                                        index === 2 ? 'bg-purple-500/20 text-purple-400' :
                                                            'text-white/40'
                                                    }`}>
                                                    ×{word.value}
                                                </span>
                                            </div>
                                            {/* 熱度進度條 - 更高更明顯 */}
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                                    className={`h-full rounded-full shadow-lg ${index === 0
                                                        ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 shadow-amber-500/30'
                                                        : index === 1
                                                            ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 shadow-cyan-500/30'
                                                            : index === 2
                                                                ? 'bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500 shadow-purple-500/30'
                                                                : 'bg-gradient-to-r from-white/20 to-white/40'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 使用說明區塊 - 更繽紛版本 */}
            <div className="control-panel-glass rounded-2xl p-5 mt-3 flex-shrink-0 border border-violet-500/20">
                {/* 標題區 */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <span className="text-sm">📖</span>
                    </div>
                    <span className="text-white font-bold text-sm">使用說明</span>
                </div>

                {/* 步驟說明 - 彩色卡片版 */}
                <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-violet-500/15 to-purple-500/15 rounded-xl border border-violet-500/20">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30">
                            <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-white font-bold">輸入詞彙</span>
                            <span className="text-white/50"> — 在上方輸入框輸入想法（最多 15 字）</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-xl border border-cyan-500/20">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30">
                            <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-white font-bold">即時呈現</span>
                            <span className="text-white/50"> — 送出後文字雲會即時更新顯示</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-pink-500/15 to-rose-500/15 rounded-xl border border-pink-500/20">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/30">
                            <span className="text-white text-xs font-bold">3</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-white font-bold">互動投票</span>
                            <span className="text-white/50"> — 點擊排行榜中的詞彙可 +1 投票</span>
                        </div>
                    </div>
                </div>

                {/* 分隔線 - 漸層 */}
                <div className="h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent my-4" />

                {/* 功能提示 - 彩色標籤版 */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-sky-500/15 rounded-xl border border-sky-500/20">
                        <span className="text-base">🔗</span>
                        <span className="text-sky-400/80 text-xs font-medium">複製連結邀請他人</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/15 rounded-xl border border-purple-500/20">
                        <span className="text-base">📱</span>
                        <span className="text-purple-400/80 text-xs font-medium">QR Code 快速加入</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/15 rounded-xl border border-emerald-500/20">
                        <span className="text-base">🔄</span>
                        <span className="text-emerald-400/80 text-xs font-medium">重新佈局文字雲</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/15 rounded-xl border border-amber-500/20">
                        <span className="text-base">🔧</span>
                        <span className="text-amber-400/80 text-xs font-medium">管理員清除資料</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;
