import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTheme, type ThemeType, themes } from '../context/ThemeContext';

const themeLabels: Record<ThemeType, { label: string; icon: string }> = {
    dark: { label: '深色', icon: '🌙' },
    light: { label: '淺色', icon: '☀️' },
    cyberpunk: { label: '賽博龐克', icon: '🤖' },
    sunset: { label: '日落', icon: '🌅' },
};

const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all ${isOpen ? 'bg-violet-500/30' : 'btn-secondary'
                    }`}
                title="切換主題"
            >
                <span className="text-lg md:text-xl">{themeLabels[theme].icon}</span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 z-50 p-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl min-w-[160px]"
                        >
                            <div className="text-white/40 text-[10px] uppercase tracking-wider mb-2 px-2">
                                主題
                            </div>

                            {(Object.keys(themes) as ThemeType[]).map((themeKey) => (
                                <motion.button
                                    key={themeKey}
                                    whileHover={{ x: 4 }}
                                    onClick={() => {
                                        setTheme(themeKey);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-3 py-2.5 rounded-lg text-left text-sm flex items-center gap-3 transition-colors ${theme === themeKey
                                            ? 'bg-violet-500/20 text-violet-300'
                                            : 'text-white/70 hover:bg-white/10'
                                        }`}
                                >
                                    <span className="text-lg">{themeLabels[themeKey].icon}</span>
                                    <span>{themeLabels[themeKey].label}</span>
                                    {theme === themeKey && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="ml-auto text-violet-400"
                                        >
                                            ✓
                                        </motion.span>
                                    )}
                                </motion.button>
                            ))}

                            {/* Theme preview colors */}
                            <div className="mt-2 pt-2 border-t border-white/10">
                                <div className="px-2 flex items-center gap-1.5">
                                    {(Object.keys(themes) as ThemeType[]).map((themeKey) => (
                                        <motion.button
                                            key={themeKey}
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => {
                                                setTheme(themeKey);
                                                setIsOpen(false);
                                            }}
                                            className={`w-6 h-6 rounded-full transition-all ${theme === themeKey ? 'ring-2 ring-white ring-offset-2 ring-offset-black/90' : ''
                                                }`}
                                            style={{
                                                background: `linear-gradient(135deg, ${themes[themeKey].accent}, ${themes[themeKey].accentSecondary})`,
                                            }}
                                            title={themeLabels[themeKey].label}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThemeSwitcher;
