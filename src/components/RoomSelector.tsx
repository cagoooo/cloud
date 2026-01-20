import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';

interface RoomSelectorProps {
    currentRoom: string;
    onRoomChange: (roomId: string) => void;
}

const RoomSelector = ({ currentRoom, onRoomChange }: RoomSelectorProps) => {
    const [inputValue, setInputValue] = useState(currentRoom);
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const newRoom = inputValue.trim() || 'main';
        onRoomChange(newRoom);
        setIsEditing(false);
    };

    const generateRandomRoom = () => {
        const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        setInputValue(randomId);
        onRoomChange(randomId);
        setIsEditing(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-4"
        >
            {isEditing ? (
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="輸入房間 ID..."
                        maxLength={20}
                        autoFocus
                        className="glass-input flex-1 px-4 py-2 rounded-xl text-white text-sm placeholder-white/40"
                    />
                    <button
                        type="button"
                        onClick={generateRandomRoom}
                        className="glass-button px-4 py-2 rounded-xl text-white/80 text-sm hover:text-white"
                    >
                        隨機
                    </button>
                    <button
                        type="submit"
                        className="glass-button px-4 py-2 rounded-xl text-white font-medium text-sm"
                    >
                        確認
                    </button>
                </form>
            ) : (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-white/60 text-sm">房間:</span>
                        <span className="text-white font-mono font-medium">{currentRoom}</span>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-white/40 hover:text-white/80 transition-colors text-sm"
                    >
                        切換房間
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default RoomSelector;
