import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import cloud from 'd3-cloud';
import { useWords, voteWord, type AggregatedWord } from '../lib/firebase';

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
}

const getWordStyle = (value: number, maxValue: number, index: number) => {
    const ratio = value / maxValue;

    if (index === 0 && value > 1) {
        return {
            color: '#fbbf24',
            glowColor: 'rgba(251, 191, 36, 0.6)',
            isTop: true,
            isHot: true,
        };
    }

    if ((index < 3 && value > 1) || ratio > 0.5) {
        const hotColors = [
            { color: '#f472b6', glow: 'rgba(244, 114, 182, 0.5)' },
            { color: '#fb7185', glow: 'rgba(251, 113, 133, 0.5)' },
            { color: '#f97316', glow: 'rgba(249, 115, 22, 0.5)' },
        ];
        const c = hotColors[index % hotColors.length];
        return { color: c.color, glowColor: c.glow, isTop: false, isHot: true };
    }

    const normalColors = [
        '#c084fc', '#22d3ee', '#34d399', '#60a5fa', '#a3e635', '#e879f9', '#2dd4bf',
    ];
    return {
        color: normalColors[index % normalColors.length],
        glowColor: 'transparent',
        isTop: false,
        isHot: false,
    };
};

const CloudDisplay = ({ sessionId }: CloudDisplayProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
    const [positionedWords, setPositionedWords] = useState<PositionedWord[]>([]);
    const { words, loading, error } = useWords(sessionId);
    const previousWordsRef = useRef<string>('');

    // Pan & Zoom state
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef({ x: 0, y: 0 });
    const lastPinchDistance = useRef<number | null>(null);

    // Vote animation state
    const [voteAnimations, setVoteAnimations] = useState<{ id: number, text: string, x: number, y: number }[]>([]);
    const [votingWord, setVotingWord] = useState<string | null>(null);

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

        const maxValue = Math.max(...wordsData.map((w) => w.value));
        const scaleFactor = Math.min(dimensions.width, dimensions.height) / 400;
        const minSize = Math.max(12, 14 * scaleFactor);
        const maxSize = Math.max(50, 90 * scaleFactor);

        const layout = cloud<D3Word>()
            .size([dimensions.width * 0.92, dimensions.height * 0.88])
            .words(wordsData.slice(0, 50))
            .padding(Math.max(5, 8 * scaleFactor))
            .rotate(() => 0)
            .font('Inter, system-ui, sans-serif')
            .fontSize((d) => {
                const normalized = Math.pow((d.value || 1) / maxValue, 0.5);
                return minSize + normalized * (maxSize - minSize);
            })
            .spiral('archimedean')
            .on('end', (output) => {
                const positioned: PositionedWord[] = output.map((word, index) => {
                    const style = getWordStyle(word.value || 0, maxValue, index);
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
            <div className="w-full h-full glass rounded-2xl md:rounded-3xl flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center px-4"
                >
                    <motion.div
                        className="text-5xl md:text-6xl lg:text-7xl mb-4"
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        ☁️
                    </motion.div>
                    <h3 className="text-white/80 text-lg md:text-xl lg:text-2xl font-semibold mb-2">
                        等待詞彙
                    </h3>
                    <p className="text-white/40 text-xs md:text-sm">
                        送出文字讓文字雲動起來！
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full glass rounded-2xl md:rounded-3xl relative overflow-hidden touch-none select-none"
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
            {/* Zoom controls */}
            <div className="absolute top-3 right-3 z-20 flex gap-2">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setTransform((prev) => ({ ...prev, scale: Math.min(prev.scale * 1.2, 3) }))}
                    className="glass w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl font-bold hover:bg-white/20"
                >
                    +
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setTransform((prev) => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.5) }))}
                    className="glass w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl font-bold hover:bg-white/20"
                >
                    −
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={resetTransform}
                    className="glass w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg hover:bg-white/20"
                    title="重置"
                >
                    ⟲
                </motion.button>
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
                    <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
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
                </defs>

                <g transform={`translate(${dimensions.width / 2}, ${dimensions.height / 2})`}>
                    <AnimatePresence mode="popLayout">
                        {positionedWords.map((word) => (
                            <motion.text
                                key={word.text}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: 1,
                                    scale: word.isTop ? [1, 1.05, 1] : 1,
                                    x: word.x,
                                    y: word.y,
                                }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 100,
                                    damping: 15,
                                    scale: word.isTop ? {
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    } : undefined,
                                }}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={word.size}
                                fill={word.color}
                                filter={word.isTop ? 'url(#glow-gold)' : word.isHot ? 'url(#glow-hot)' : undefined}
                                className="word-cloud-text cursor-pointer hover:opacity-80"
                                style={{
                                    fontWeight: word.isTop ? 900 : word.size > 35 ? 800 : 600,
                                    textShadow: word.isTop
                                        ? `0 0 20px ${word.glowColor}, 0 0 40px ${word.glowColor}`
                                        : word.isHot
                                            ? `0 0 15px ${word.glowColor}`
                                            : undefined,
                                    pointerEvents: 'auto',
                                }}
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (votingWord) return;
                                    setVotingWord(word.text);

                                    // Add +1 animation
                                    const anim = { id: Date.now(), text: word.text, x: word.x, y: word.y - 20 };
                                    setVoteAnimations(prev => [...prev, anim]);
                                    setTimeout(() => setVoteAnimations(prev => prev.filter(a => a.id !== anim.id)), 1000);

                                    await voteWord(sessionId, word.text);
                                    setVotingWord(null);
                                }}
                            >
                                {word.text}
                            </motion.text>
                        ))}
                    </AnimatePresence>

                    {/* Vote +1 animations */}
                    <AnimatePresence>
                        {voteAnimations.map((anim) => (
                            <motion.text
                                key={anim.id}
                                initial={{ opacity: 1, y: anim.y, x: anim.x, scale: 1 }}
                                animate={{ opacity: 0, y: anim.y - 50, scale: 1.5 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                textAnchor="middle"
                                fontSize={24}
                                fill="#22c55e"
                                fontWeight="bold"
                            >
                                +1
                            </motion.text>
                        ))}
                    </AnimatePresence>
                </g>
            </svg>

            {/* Stats bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 z-10"
            >
                <div className="glass-strong rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                <span className="text-emerald-400 font-semibold text-sm md:text-base">即時同步</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="text-center">
                                <div className="text-white font-bold text-xl md:text-2xl lg:text-3xl">{words.length}</div>
                                <div className="text-white/50 text-xs md:text-sm">詞彙數</div>
                            </div>
                            <div className="w-px h-8 md:h-10 bg-white/20"></div>
                            <div className="text-center">
                                <div className="text-white font-bold text-xl md:text-2xl lg:text-3xl">{words.reduce((s, w) => s + w.value, 0)}</div>
                                <div className="text-white/50 text-xs md:text-sm">總投票</div>
                            </div>
                        </div>

                        {words.length > 0 && words[0].value > 1 ? (
                            <div className="flex items-center gap-2 md:gap-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3 md:px-4 py-2 md:py-3 rounded-xl">
                                <span className="text-xl md:text-2xl">🔥</span>
                                <div>
                                    <div className="text-amber-400 font-bold text-sm md:text-base lg:text-lg">{words[0].text}</div>
                                    <div className="text-white/50 text-xs">×{words[0].value} 票</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-white/30 text-xs md:text-sm">等待熱門詞彙...</div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CloudDisplay;
