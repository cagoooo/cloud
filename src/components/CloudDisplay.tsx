import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import cloud from 'd3-cloud';
import { useWords, type AggregatedWord } from '../lib/firebase';
import { useAnimationSettings, getRandomFlyDirection } from '../hooks/useAnimationSettings';

interface CloudDisplayProps {
    sessionId: string;
}

interface D3Word extends AggregatedWord {
    x?: number;
    y?: number;
    size?: number;
    rotate?: number;
}

interface PositionedWord extends AggregatedWord {
    x: number;
    y: number;
    size: number;
    rotate: number;
    color: string;
    isHot: boolean;
    isTop: boolean;
    glowColor: string;
    isOutline: boolean;
    opacity: number;
    fontWeight: number;
    // Animation properties
    initialX?: number;
    initialY?: number;
}

// Cyberpunk-style color palette
const neonPalette = [
    '#00F0FF', // Neon Cyan
    '#FF00AA', // Neon Pink  
    '#00FF99', // Neon Green
    '#FFE600', // Cyber Yellow
    '#A855F7', // Electric Purple
    '#38BDF8', // Sky Blue
    '#FB7185', // Rose
    '#4ADE80', // Emerald
];

// V8: 增強的樣式分層系統
const getWordStyle = (value: number, _maxValue: number, index: number, _totalWords: number) => {

    // Top 1 - 金色王冠，最大發光，脈動動畫
    if (index === 0 && value > 1) {
        return {
            color: '#fbbf24',
            glowColor: 'rgba(251, 191, 36, 0.8)',
            isTop: true,
            isHot: true,
            isOutline: false,
            opacity: 1,
            fontWeight: 900,
        };
    }

    // Top 2-3 - 霓虹熱門色，強發光
    if (index < 3 && value > 1) {
        const hotColors = [
            { color: '#00F0FF', glow: 'rgba(0, 240, 255, 0.6)' },   // 青色
            { color: '#FF00AA', glow: 'rgba(255, 0, 170, 0.6)' },   // 粉色
        ];
        const c = hotColors[(index - 1) % hotColors.length];
        return { color: c.color, glowColor: c.glow, isTop: false, isHot: true, isOutline: false, opacity: 1, fontWeight: 800 };
    }

    // Top 4-6 - 次熱門，微弱發光
    if (index < 6) {
        const colorIndex = (index * 7) % neonPalette.length;
        return {
            color: neonPalette[colorIndex],
            glowColor: `${neonPalette[colorIndex]}40`, // 25% 發光
            isTop: false,
            isHot: false,
            isOutline: false,
            opacity: 0.95,
            fontWeight: 700,
        };
    }

    // Top 7-15 - 中層，無發光
    if (index < 15) {
        const colorIndex = (index * 5) % neonPalette.length;
        return {
            color: neonPalette[colorIndex],
            glowColor: 'transparent',
            isTop: false,
            isHot: false,
            isOutline: false,
            opacity: 0.75,
            fontWeight: 600,
        };
    }

    // 16-25 - 背景層，半透明
    if (index < 25) {
        const colorIndex = (index * 3) % neonPalette.length;
        return {
            color: neonPalette[colorIndex],
            glowColor: 'transparent',
            isTop: false,
            isHot: false,
            isOutline: false,
            opacity: 0.45,
            fontWeight: 500,
        };
    }

    // 26+ - 輪廓層，最遠景
    return {
        color: 'rgba(150, 150, 180, 0.35)',
        glowColor: 'transparent',
        isTop: false,
        isHot: false,
        isOutline: true,
        opacity: 0.3,
        fontWeight: 400,
    };
};

const CloudDisplay = ({ sessionId }: CloudDisplayProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
    const [positionedWords, setPositionedWords] = useState<PositionedWord[]>([]);
    const { words, loading, error } = useWords(sessionId);
    const previousWordsRef = useRef<string>('');

    // Animation settings
    const { entryAnimation, setEntryAnimation } = useAnimationSettings();
    const [showAnimationSelector, setShowAnimationSelector] = useState(false);

    // Pan & Zoom state
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef({ x: 0, y: 0 });
    const lastPinchDistance = useRef<number | null>(null);


    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: Math.max(rect.width - 32, 200),
                    height: Math.max(rect.height - 80, 200),
                });
            }
        };

        updateDimensions();
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, []);

    const generateCloud = useCallback((wordsData: AggregatedWord[]) => {
        if (wordsData.length === 0) {
            setPositionedWords([]);
            return;
        }

        // Truncate long words to ensure they fit
        const processedWords = wordsData.map(w => ({
            ...w,
            text: w.text.length > 15 ? w.text.slice(0, 15) + '…' : w.text
        }));

        const wordCount = processedWords.length;
        const maxValue = Math.max(...processedWords.map((w) => w.value));
        const scaleFactor = Math.min(dimensions.width, dimensions.height) / 400;

        // V8: 動態尺寸範圍 - 根據詞彙數量調整
        let minSize: number, maxSize: number;
        if (wordCount <= 5) {
            minSize = 18 * scaleFactor;
            maxSize = 55 * scaleFactor;
        } else if (wordCount <= 15) {
            minSize = 14 * scaleFactor;
            maxSize = 50 * scaleFactor;
        } else if (wordCount <= 30) {
            minSize = 12 * scaleFactor;
            maxSize = 45 * scaleFactor;
        } else {
            minSize = 10 * scaleFactor;
            maxSize = 40 * scaleFactor;
        }
        minSize = Math.max(10, minSize);
        maxSize = Math.max(25, maxSize);

        // Create canvas with proper size and font for accurate CJK measurement
        const canvas = document.createElement('canvas');
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.font = 'bold 32px "Microsoft JhengHei", "PingFang TC", system-ui, sans-serif';
        }

        // V8: 檢測中文字符比例的輔助函數
        const getCJKRatio = (text: string): number => {
            const cjkChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
            return text.length > 0 ? cjkChars / text.length : 0;
        };

        const layout = cloud<D3Word>()
            .size([dimensions.width * 0.95, dimensions.height * 0.88])
            .words(processedWords.slice(0, 50))
            // V8: 動態 padding - 中文越多 padding 越大，長字串 padding 更小
            .padding((d) => {
                const cjkRatio = getCJKRatio(d.text || '');
                const textLen = d.text?.length || 0;
                const basePadding = textLen > 10 ? 8 : 12; // 長字串減少 padding
                return basePadding + cjkRatio * 10; // 8-22 之間
            })
            .rotate(() => 0)
            .font('"Microsoft JhengHei", "PingFang TC", system-ui, sans-serif')
            // V8: 優化的 fontSize 計算 - 排名加成 + 隨機微調
            .fontSize((d) => {
                // 找到這個詞的排名
                const wordIndex = processedWords.findIndex(w => w.text === d.text);

                // 基礎尺寸（基於票數的正規化）
                const valueNormalized = Math.pow((d.value || 1) / maxValue, 0.5);
                const baseSize = minSize + valueNormalized * (maxSize - minSize);

                // V8: 排名加成 - 前幾名獲得尺寸獎勵
                let rankBonus = 1.0;
                if (wordIndex === 0) rankBonus = 1.30;       // 第 1 名 +30%
                else if (wordIndex === 1) rankBonus = 1.20;  // 第 2 名 +20%
                else if (wordIndex === 2) rankBonus = 1.15;  // 第 3 名 +15%
                else if (wordIndex < 5) rankBonus = 1.10;    // 第 4-5 名 +10%
                else if (wordIndex < 10) rankBonus = 1.05;   // 第 6-10 名 +5%
                else rankBonus = Math.max(0.75, 1.0 - (wordIndex - 10) * 0.015); // 10 名後逐漸縮小

                // V8: 長度懲罰（長文字縮小，但保持可讀性）
                const textLen = d.text?.length || 0;
                const lengthPenalty = Math.max(0.5, 1 - textLen * 0.025); // 更溫和的懲罰

                // V8: 隨機微調 ±5%（讓相同票數的詞也有差異）
                const randomJitter = 0.95 + Math.random() * 0.1;

                return Math.max(minSize, baseSize * rankBonus * lengthPenalty * randomJitter);
            })
            .spiral('archimedean')
            .canvas(() => canvas as HTMLCanvasElement);

        layout.on('end', (output) => {
            const positioned: PositionedWord[] = output.map((word, index) => {
                const style = getWordStyle(word.value || 0, maxValue, index, output.length);
                return {
                    text: word.text || '',
                    value: word.value || 0,
                    x: word.x || 0,
                    y: word.y || 0,
                    size: word.size || minSize,
                    rotate: word.rotate || 0,
                    ...style,
                };
            });
            setPositionedWords(positioned);
        });

        layout.start();
    }, [dimensions]);

    useEffect(() => {
        const wordsKey = JSON.stringify(words);
        if (wordsKey !== previousWordsRef.current) {
            previousWordsRef.current = wordsKey;
            generateCloud(words);
        }
    }, [words, generateCloud]);

    // Mouse/Touch handlers for pan & zoom
    const handlePointerDown = (e: React.PointerEvent) => {
        if (e.pointerType === 'touch') return; // Handle touch separately
        setIsPanning(true);
        panStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isPanning || e.pointerType === 'touch') return;
        setTransform((prev) => ({
            ...prev,
            x: e.clientX - panStart.current.x,
            y: e.clientY - panStart.current.y,
        }));
    };

    const handlePointerUp = () => {
        setIsPanning(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setTransform((prev) => ({
            ...prev,
            scale: Math.min(Math.max(prev.scale * delta, 0.5), 3),
        }));
    };

    // Touch handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            setIsPanning(true);
            panStart.current = {
                x: e.touches[0].clientX - transform.x,
                y: e.touches[0].clientY - transform.y
            };
        } else if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            lastPinchDistance.current = dist;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 1 && isPanning) {
            setTransform((prev) => ({
                ...prev,
                x: e.touches[0].clientX - panStart.current.x,
                y: e.touches[0].clientY - panStart.current.y,
            }));
        } else if (e.touches.length === 2 && lastPinchDistance.current) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const delta = dist / lastPinchDistance.current;
            lastPinchDistance.current = dist;
            setTransform((prev) => ({
                ...prev,
                scale: Math.min(Math.max(prev.scale * delta, 0.5), 3),
            }));
        }
    };

    const handleTouchEnd = () => {
        setIsPanning(false);
        lastPinchDistance.current = null;
    };

    const resetTransform = () => {
        setTransform({ x: 0, y: 0, scale: 1 });
    };

    if (loading) {
        return (
            <div className="w-full h-full glass rounded-2xl md:rounded-3xl flex items-center justify-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-4">
                    <motion.div
                        className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 rounded-full border-3 border-violet-500/30 border-t-violet-400"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-white/60 text-sm">連接中...</p>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full glass rounded-2xl md:rounded-3xl flex items-center justify-center p-4">
                <div className="text-center max-w-xs">
                    <div className="text-4xl mb-3">⚠️</div>
                    <h3 className="text-white text-base font-bold mb-2">連線錯誤</h3>
                    <p className="text-white/50 text-xs break-all">{error.message}</p>
                </div>
            </div>
        );
    }

    if (words.length === 0) {
        return (
            <div className="w-full h-full word-cloud-glass flex items-center justify-center relative overflow-hidden">
                {/* Radar scan effect */}
                <motion.div
                    className="absolute inset-0 opacity-20"
                    style={{
                        background: 'conic-gradient(from 0deg, transparent 0%, rgba(0, 255, 200, 0.3) 10%, transparent 20%)',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(0,255,200,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,200,0.2) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center px-4 z-10"
                >
                    {/* Breathing brain/cloud icon */}
                    <motion.div
                        className="text-6xl md:text-7xl lg:text-8xl mb-6"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.4, 0.8, 0.4],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        🧠
                    </motion.div>
                    <h3 className="text-cyan-400/80 text-lg md:text-xl lg:text-2xl font-semibold mb-2 tracking-wider">
                        準備就緒
                    </h3>
                    <p className="text-white/40 text-xs md:text-sm">
                        [ 等待輸入詞彙... ]
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full word-cloud-glass relative overflow-hidden touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        >
            {/* Floating HUD Control Capsule */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1 p-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                {/* Zoom In */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setTransform((prev) => ({ ...prev, scale: Math.min(prev.scale * 1.2, 3) }))}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-cyan-400 hover:bg-white/10 transition-colors"
                    title="放大"
                >
                    <span className="text-lg font-bold">+</span>
                </motion.button>
                {/* Zoom Out */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setTransform((prev) => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.5) }))}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-cyan-400 hover:bg-white/10 transition-colors"
                    title="縮小"
                >
                    <span className="text-lg font-bold">−</span>
                </motion.button>
                {/* Divider */}
                <div className="w-px h-5 bg-white/20" />
                {/* Reset */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={resetTransform}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-pink-400 hover:bg-white/10 transition-colors"
                    title="重置視角"
                >
                    <span className="text-base">⟲</span>
                </motion.button>
                {/* Refresh Layout */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => generateCloud(words)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-400 hover:bg-white/10 transition-colors"
                    title="重新佈局"
                >
                    <span className="text-base">🔄</span>
                </motion.button>
                {/* Divider */}
                <div className="w-px h-5 bg-white/20" />
                {/* Animation Selector Toggle */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowAnimationSelector(!showAnimationSelector)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${showAnimationSelector ? 'bg-violet-500/30 text-violet-400' : 'text-violet-400 hover:bg-white/10'
                            }`}
                        title="進場動畫"
                    >
                        <span className="text-base">✨</span>
                    </motion.button>
                    {/* Animation Dropdown */}
                    <AnimatePresence>
                        {showAnimationSelector && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute top-full right-0 mt-2 p-2 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 shadow-lg min-w-[140px]"
                            >
                                <div className="text-white/40 text-[10px] uppercase tracking-wider mb-2 px-2">進場動畫</div>
                                {(['fade', 'fly', 'bounce', 'none'] as const).map((type) => (
                                    <motion.button
                                        key={type}
                                        whileHover={{ x: 4 }}
                                        onClick={() => {
                                            setEntryAnimation(type);
                                            setShowAnimationSelector(false);
                                        }}
                                        className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center gap-2 transition-colors ${entryAnimation === type
                                            ? 'bg-violet-500/20 text-violet-300'
                                            : 'text-white/70 hover:bg-white/10'
                                            }`}
                                    >
                                        <span>{type === 'fade' ? '🌟' : type === 'fly' ? '🚀' : type === 'bounce' ? '🎾' : '⏸️'}</span>
                                        <span>{type === 'fade' ? '淡入' : type === 'fly' ? '飛入' : type === 'bounce' ? '彈跳' : '無'}</span>
                                        {entryAnimation === type && (
                                            <span className="ml-auto text-violet-400">✓</span>
                                        )}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Hint badge */}
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 3, duration: 1 }}
                className="absolute top-3 left-3 z-20 glass px-3 py-2 rounded-lg text-white/60 text-xs"
            >
                🖐️ 拖曳移動 · 🔍 捏合縮放
            </motion.div>

            <svg
                width={dimensions.width}
                height={dimensions.height}
                className="absolute top-1/2 left-1/2"
                style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    transform: `translate(-50%, -50%) translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                }}
            >
                <defs>
                    {/* Gold glow filter */}
                    <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="glow-hot" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Animated gold gradient for Top 1 */}
                    <linearGradient id="liquid-gold" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fbbf24">
                            <animate attributeName="stop-color" values="#fbbf24;#f59e0b;#fcd34d;#fbbf24" dur="3s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="50%" stopColor="#f59e0b">
                            <animate attributeName="stop-color" values="#f59e0b;#fcd34d;#fbbf24;#f59e0b" dur="3s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" stopColor="#fcd34d">
                            <animate attributeName="stop-color" values="#fcd34d;#fbbf24;#f59e0b;#fcd34d" dur="3s" repeatCount="indefinite" />
                        </stop>
                    </linearGradient>

                    {/* Animated gradient for Top 2-3 */}
                    <linearGradient id="liquid-hot" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00C6FF">
                            <animate attributeName="stop-color" values="#00C6FF;#0072FF;#9D50BB;#00C6FF" dur="4s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="50%" stopColor="#0072FF">
                            <animate attributeName="stop-color" values="#0072FF;#9D50BB;#F472B6;#0072FF" dur="4s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" stopColor="#9D50BB">
                            <animate attributeName="stop-color" values="#9D50BB;#F472B6;#00C6FF;#9D50BB" dur="4s" repeatCount="indefinite" />
                        </stop>
                    </linearGradient>
                </defs>

                <g transform={`translate(${dimensions.width / 2}, ${dimensions.height / 2})`}>
                    {positionedWords.map((word, index) => {
                        // Generate animation initial state based on selected animation type
                        const getInitialState = () => {
                            switch (entryAnimation) {
                                case 'fade':
                                    return { opacity: 0, scale: 0.8, x: word.x, y: word.y };
                                case 'fly': {
                                    const flyDir = getRandomFlyDirection();
                                    return { opacity: 0, x: word.x + flyDir.x, y: word.y + flyDir.y };
                                }
                                case 'bounce':
                                    return { opacity: 0, scale: 0, x: word.x, y: word.y };
                                case 'none':
                                default:
                                    return { opacity: 1, scale: 1, x: word.x, y: word.y };
                            }
                        };

                        const getTransition = () => {
                            const baseDelay = index * 0.03; // Stagger animation
                            switch (entryAnimation) {
                                case 'fade':
                                    return { duration: 0.5, ease: 'easeOut' as const, delay: baseDelay };
                                case 'fly':
                                    return { type: 'spring' as const, stiffness: 100, damping: 15, delay: baseDelay };
                                case 'bounce':
                                    return { type: 'spring' as const, stiffness: 300, damping: 12, delay: baseDelay };
                                case 'none':
                                default:
                                    return { duration: 0 };
                            }
                        };

                        return (
                            <motion.text
                                key={word.text}
                                initial={getInitialState()}
                                animate={{
                                    opacity: word.opacity,
                                    scale: word.isTop ? [1, 1.05, 1] : 1,
                                    x: word.x,
                                    y: word.y,
                                }}
                                transition={{
                                    ...getTransition(),
                                    scale: word.isTop ? {
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    } : undefined,
                                }}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={word.size}
                                fill={
                                    word.isOutline ? 'transparent'
                                        : word.isTop ? 'url(#liquid-gold)'
                                            : word.isHot ? 'url(#liquid-hot)'
                                                : word.color
                                }
                                filter={word.isTop ? 'url(#glow-gold)' : word.isHot ? 'url(#glow-hot)' : undefined}
                                className={`word-cloud-text cursor-pointer hover:opacity-80 ${word.isTop ? 'word-top-glow' : ''} ${word.isOutline ? 'tag-outline' : ''}`}
                                style={{
                                    fontWeight: word.fontWeight,
                                    textShadow: word.isTop
                                        ? `0 0 20px ${word.glowColor}, 0 0 40px ${word.glowColor}`
                                        : word.isHot
                                            ? `0 0 15px ${word.glowColor}`
                                            : word.glowColor !== 'transparent'
                                                ? `0 0 8px ${word.glowColor}`
                                                : undefined,
                                    WebkitTextStroke: word.isOutline ? '1px rgba(150, 150, 180, 0.3)' : undefined,
                                }}
                            >
                                {word.text}
                            </motion.text>
                        );
                    })}

                </g>
            </svg>

            {/* Heatmap Legend - Weight indicator */}
            <div className="absolute bottom-16 left-4 z-10 flex items-center gap-2 text-[10px] text-white/40 font-mono tracking-widest opacity-50 hover:opacity-100 transition-opacity">
                <span>LOW</span>
                <div className="w-16 h-1 rounded-full bg-gradient-to-r from-gray-600 via-cyan-500 to-amber-400" />
                <span>HIGH</span>
            </div>

            {/* V7: 簡化版同步狀態指示器 */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 glass px-3 py-2 rounded-lg opacity-60 hover:opacity-100 transition-opacity">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 text-xs font-medium">即時同步</span>
            </div>
        </div >
    );
};

export default CloudDisplay;
