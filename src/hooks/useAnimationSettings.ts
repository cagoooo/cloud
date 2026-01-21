import { useState, useEffect, useCallback } from 'react';

export type AnimationType = 'fade' | 'fly' | 'bounce' | 'none';

interface AnimationSettings {
    entryAnimation: AnimationType;
    setEntryAnimation: (animation: AnimationType) => void;
}

const STORAGE_KEY = 'wordcloud_animation_settings';

export function useAnimationSettings(): AnimationSettings {
    const [entryAnimation, setEntryAnimationState] = useState<AnimationType>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.entryAnimation || 'fade';
            }
        } catch {
            // Ignore parse errors
        }
        return 'fade';
    });

    // Persist to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ entryAnimation }));
        } catch {
            // Ignore storage errors
        }
    }, [entryAnimation]);

    const setEntryAnimation = useCallback((animation: AnimationType) => {
        setEntryAnimationState(animation);
    }, []);

    return {
        entryAnimation,
        setEntryAnimation,
    };
}

// Animation configuration
export const animationConfigs: Record<AnimationType, {
    initial: Record<string, number | string>;
    animate: Record<string, number | string>;
    transition: Record<string, unknown>;
}> = {
    fade: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5, ease: 'easeOut' },
    },
    fly: {
        initial: { opacity: 0, x: 0, y: 0 },
        animate: { opacity: 1, x: 0, y: 0 },
        transition: { duration: 0.6, ease: 'easeOut', type: 'spring', stiffness: 100 },
    },
    bounce: {
        initial: { opacity: 0, scale: 0 },
        animate: { opacity: 1, scale: 1 },
        transition: { type: 'spring', stiffness: 300, damping: 15 },
    },
    none: {
        initial: { opacity: 1, scale: 1 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0 },
    },
};

// Get random fly direction for 'fly' animation
export function getRandomFlyDirection(): { x: number; y: number } {
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 100;
    return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
    };
}
