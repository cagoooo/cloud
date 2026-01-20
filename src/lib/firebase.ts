import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    query,
    onSnapshot,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { useState, useEffect, useRef, useCallback } from 'react';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAGU5SjJn8SxJv3L41FcqyGOQT8haPjWDY",
    authDomain: "cloud-3c5cd.firebaseapp.com",
    projectId: "cloud-3c5cd",
    storageBucket: "cloud-3c5cd.firebasestorage.app",
    messagingSenderId: "425190515983",
    appId: "1:425190515983:web:89bd3d5719f1acf2daca7a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Generate anonymous user ID
const getOrCreateUserId = (): string => {
    const storageKey = 'wordcloud_user_id';
    let userId = localStorage.getItem(storageKey);
    if (!userId) {
        userId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem(storageKey, userId);
    }
    return userId;
};

export const userId = getOrCreateUserId();

// Word data interface
export interface WordData {
    text: string;
    timestamp: Timestamp;
    userId: string;
}

export interface AggregatedWord {
    text: string;
    value: number;
}

/**
 * Add a word to a session
 */
export const addWord = async (sessionId: string, text: string): Promise<void> => {
    const wordsRef = collection(db, 'sessions', sessionId, 'words');
    await addDoc(wordsRef, {
        text: text.trim().toLowerCase(),
        timestamp: serverTimestamp(),
        userId,
    });
};

/**
 * Vote for an existing word (add +1)
 */
export const voteWord = async (sessionId: string, text: string): Promise<void> => {
    // Simply add another entry with the same text to increase the count
    await addWord(sessionId, text);
};

/**
 * Real-time hook to get aggregated word frequencies
 * Includes debouncing to prevent UI jitter with high-frequency updates
 */
export const useWords = (sessionId: string, debounceMs: number = 1500) => {
    const [words, setWords] = useState<AggregatedWord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestData = useRef<AggregatedWord[]>([]);

    const aggregateWords = useCallback((docs: WordData[]): AggregatedWord[] => {
        const frequencyMap = new Map<string, number>();

        docs.forEach((doc) => {
            const text = doc.text.trim().toLowerCase();
            if (text) {
                frequencyMap.set(text, (frequencyMap.get(text) || 0) + 1);
            }
        });

        return Array.from(frequencyMap.entries())
            .map(([text, value]) => ({ text, value }))
            .sort((a, b) => b.value - a.value);
    }, []);

    useEffect(() => {
        if (!sessionId) return;

        const wordsRef = collection(db, 'sessions', sessionId, 'words');
        const q = query(wordsRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const docsData = snapshot.docs.map((doc) => doc.data() as WordData);
                const aggregated = aggregateWords(docsData);
                latestData.current = aggregated;

                // Debounce updates
                if (debounceTimer.current) {
                    clearTimeout(debounceTimer.current);
                }

                debounceTimer.current = setTimeout(() => {
                    setWords(latestData.current);
                    setLoading(false);
                }, debounceMs);
            },
            (err) => {
                console.error('Firestore error:', err);
                setError(err);
                setLoading(false);
            }
        );

        return () => {
            unsubscribe();
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [sessionId, debounceMs, aggregateWords]);

    return { words, loading, error };
};
