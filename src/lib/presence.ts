import { useEffect, useState, useRef } from 'react';
import {
    getDatabase,
    ref,
    onValue,
    set,
    onDisconnect,
    serverTimestamp,
    off
} from 'firebase/database';
import { initializeApp, getApps } from 'firebase/app';

// Firebase configuration (same as Firestore)
const firebaseConfig = {
    apiKey: "AIzaSyAGU5SjJn8SxJv3L41FcqyGOQT8haPjWDY",
    authDomain: "cloud-3c5cd.firebaseapp.com",
    projectId: "cloud-3c5cd",
    storageBucket: "cloud-3c5cd.firebasestorage.app",
    messagingSenderId: "425190515983",
    appId: "1:425190515983:web:89bd3d5719f1acf2daca7a",
    databaseURL: "https://cloud-3c5cd-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Realtime Database
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const rtdb = getDatabase(app);

// Get or create user ID
const getUserId = (): string => {
    const storageKey = 'wordcloud_user_id';
    let userId = localStorage.getItem(storageKey);
    if (!userId) {
        userId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem(storageKey, userId);
    }
    return userId;
};

/**
 * Hook to track presence (online users) in a room
 */
export const usePresence = (sessionId: string) => {
    const [onlineCount, setOnlineCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const userIdRef = useRef(getUserId());

    useEffect(() => {
        if (!sessionId) return;

        const userId = userIdRef.current;
        const presenceRef = ref(rtdb, `presence/${sessionId}/${userId}`);
        const roomRef = ref(rtdb, `presence/${sessionId}`);
        const connectedRef = ref(rtdb, '.info/connected');

        // Monitor connection state
        const connectedListener = onValue(connectedRef, (snapshot) => {
            if (snapshot.val() === true) {
                setIsConnected(true);

                // Set user as online
                set(presenceRef, {
                    online: true,
                    lastSeen: serverTimestamp()
                });

                // Remove user when disconnected
                onDisconnect(presenceRef).remove();
            } else {
                setIsConnected(false);
            }
        });

        // Count online users
        const roomListener = onValue(roomRef, (snapshot) => {
            if (snapshot.exists()) {
                const users = snapshot.val();
                const count = Object.keys(users).length;
                setOnlineCount(count);
            } else {
                setOnlineCount(0);
            }
        });

        return () => {
            off(connectedRef);
            off(roomRef);
            // Clean up presence on unmount
            set(presenceRef, null);
        };
    }, [sessionId]);

    return { onlineCount, isConnected };
};
