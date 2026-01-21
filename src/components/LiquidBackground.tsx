import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import ParticleBackground from './ParticleBackground';

interface LiquidBackgroundProps {
    children: ReactNode;
    showParticles?: boolean;
}

const LiquidBackground = ({ children, showParticles = true }: LiquidBackgroundProps) => {
    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Deep gradient base */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(125deg, #1a0a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 75%, #16082a 100%)',
                }}
            />

            {/* Animated gradient overlay */}
            <motion.div
                className="absolute inset-0"
                animate={{
                    background: [
                        'radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
                        'radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
                        'radial-gradient(ellipse at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
                        'radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
                        'radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
                    ],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />

            {/* Colorful blobs */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Large purple blob */}
                <motion.div
                    className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full opacity-70"
                    style={{
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0) 70%)',
                        filter: 'blur(60px)',
                    }}
                    animate={{
                        x: [0, 80, 40, 0],
                        y: [0, 40, 80, 0],
                        scale: [1, 1.2, 1.1, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Large cyan blob */}
                <motion.div
                    className="absolute top-1/4 -right-20 w-[550px] h-[550px] rounded-full opacity-60"
                    style={{
                        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.45) 0%, rgba(6, 182, 212, 0) 70%)',
                        filter: 'blur(50px)',
                    }}
                    animate={{
                        x: [0, -100, -50, 0],
                        y: [0, 60, -30, 0],
                        scale: [1, 1.15, 1.05, 1],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Pink/Magenta blob */}
                <motion.div
                    className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full opacity-60"
                    style={{
                        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(236, 72, 153, 0) 70%)',
                        filter: 'blur(55px)',
                    }}
                    animate={{
                        x: [0, 100, 50, 0],
                        y: [0, -60, -30, 0],
                        scale: [1, 1.1, 1.2, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Orange/Amber blob */}
                <motion.div
                    className="absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full opacity-50"
                    style={{
                        background: 'radial-gradient(circle, rgba(251, 146, 60, 0.35) 0%, rgba(251, 146, 60, 0) 70%)',
                        filter: 'blur(45px)',
                    }}
                    animate={{
                        x: [0, -80, 40, 0],
                        y: [0, 50, -40, 0],
                        scale: [1, 1.2, 0.9, 1],
                    }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Emerald blob */}
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full opacity-50"
                    style={{
                        background: 'radial-gradient(circle, rgba(52, 211, 153, 0.3) 0%, rgba(52, 211, 153, 0) 70%)',
                        filter: 'blur(40px)',
                    }}
                    animate={{
                        x: [0, 60, -40, 0],
                        y: [0, -50, 30, 0],
                        scale: [1, 1.15, 1.1, 1],
                    }}
                    transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Blue accent blob */}
                <motion.div
                    className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full opacity-40"
                    style={{
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 70%)',
                        filter: 'blur(35px)',
                    }}
                    animate={{
                        x: [0, 70, -30, 0],
                        y: [0, -40, 60, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Small rose accent */}
                <motion.div
                    className="absolute top-20 right-1/3 w-[200px] h-[200px] rounded-full opacity-50"
                    style={{
                        background: 'radial-gradient(circle, rgba(244, 63, 94, 0.35) 0%, rgba(244, 63, 94, 0) 70%)',
                        filter: 'blur(30px)',
                    }}
                    animate={{
                        x: [0, -50, 30, 0],
                        y: [0, 40, -20, 0],
                        scale: [1, 1.3, 1.1, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            {/* Sparkle particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 4,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>

            {/* Subtle vignette */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 100%)',
                }}
            />

            {/* Particle effect layer */}
            {showParticles && (
                <div className="absolute inset-0 z-5">
                    <ParticleBackground
                        particleCount={60}
                        connectionDistance={100}
                        particleColor="rgba(139, 92, 246, 0.5)"
                        lineColor="rgba(139, 92, 246, 0.12)"
                    />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};

export default LiquidBackground;
