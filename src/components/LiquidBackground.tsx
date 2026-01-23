import type { ReactNode } from 'react';

interface LiquidBackgroundProps {
    children: ReactNode;
    showParticles?: boolean;
}

// V8 Performance: Completely static background - removed all animations for maximum performance
const LiquidBackground = ({ children }: LiquidBackgroundProps) => {
    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Static gradient base */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(125deg, #1a0a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 75%, #16082a 100%)',
                }}
            />

            {/* Static accent blobs - no animation, just visual depth */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full opacity-40"
                    style={{
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0) 70%)',
                        filter: 'blur(60px)',
                    }}
                />
                <div
                    className="absolute top-1/3 -right-20 w-[450px] h-[450px] rounded-full opacity-35"
                    style={{
                        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, rgba(6, 182, 212, 0) 70%)',
                        filter: 'blur(50px)',
                    }}
                />
                <div
                    className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] rounded-full opacity-35"
                    style={{
                        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0) 70%)',
                        filter: 'blur(50px)',
                    }}
                />
            </div>

            {/* Subtle vignette */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 100%)',
                }}
            />

            {/* Content */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};

export default LiquidBackground;
