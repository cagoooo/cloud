import { useEffect, useRef, useCallback } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
}

interface ParticleBackgroundProps {
    particleCount?: number;
    connectionDistance?: number;
    particleColor?: string;
    lineColor?: string;
    enabled?: boolean;
}

// V8 Performance: Reduced default particle count from 80 to 30
const ParticleBackground = ({
    particleCount = 30,
    connectionDistance = 80,
    particleColor = 'rgba(139, 92, 246, 0.6)',
    lineColor = 'rgba(139, 92, 246, 0.15)',
    enabled = true,
}: ParticleBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationIdRef = useRef<number>(0);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const frameCountRef = useRef(0);
    const isVisibleRef = useRef(true);

    // Initialize particles
    const initParticles = useCallback((width: number, height: number) => {
        const particles: Particle[] = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4, // Slightly slower
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 1.5 + 0.8, // Slightly smaller
                opacity: Math.random() * 0.4 + 0.2,
            });
        }
        particlesRef.current = particles;
    }, [particleCount]);

    // Animation loop with frame skipping for performance
    const animate = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        // V8 Performance: Skip frames when page is not visible
        if (!isVisibleRef.current) {
            animationIdRef.current = requestAnimationFrame(() => animate(ctx, width, height));
            return;
        }

        // V8 Performance: Frame skipping - render every 2nd frame
        frameCountRef.current++;
        if (frameCountRef.current % 2 !== 0) {
            animationIdRef.current = requestAnimationFrame(() => animate(ctx, width, height));
            return;
        }

        ctx.clearRect(0, 0, width, height);

        const particles = particlesRef.current;
        const mouse = mouseRef.current;

        // Update and draw particles
        particles.forEach((particle, i) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off edges
            if (particle.x < 0 || particle.x > width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > height) particle.vy *= -1;

            // Keep in bounds
            particle.x = Math.max(0, Math.min(width, particle.x));
            particle.y = Math.max(0, Math.min(height, particle.y));

            // Mouse interaction - gentle repulsion (reduced intensity)
            const dx = particle.x - mouse.x;
            const dy = particle.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
                const force = (80 - dist) / 80;
                particle.vx += (dx / dist) * force * 0.01;
                particle.vy += (dy / dist) * force * 0.01;
            }

            // Limit velocity
            const maxSpeed = 0.8;
            const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            if (speed > maxSpeed) {
                particle.vx = (particle.vx / speed) * maxSpeed;
                particle.vy = (particle.vy / speed) * maxSpeed;
            }

            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particleColor.replace('0.6', String(particle.opacity));
            ctx.fill();

            // V8 Performance: Only check connections for nearby particles (spatial optimization)
            for (let j = i + 1; j < particles.length; j++) {
                const other = particles[j];
                const distX = particle.x - other.x;
                const distY = particle.y - other.y;

                // Quick rejection test before expensive sqrt
                if (Math.abs(distX) > connectionDistance || Math.abs(distY) > connectionDistance) {
                    continue;
                }

                const distance = Math.sqrt(distX * distX + distY * distY);

                if (distance < connectionDistance) {
                    const opacity = (1 - distance / connectionDistance) * 0.2;
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.strokeStyle = lineColor.replace('0.15', String(opacity));
                    ctx.lineWidth = 0.4;
                    ctx.stroke();
                }
            }
        });

        animationIdRef.current = requestAnimationFrame(() => animate(ctx, width, height));
    }, [particleColor, lineColor, connectionDistance]);

    useEffect(() => {
        if (!enabled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const handleResize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;

            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
            initParticles(canvas.width, canvas.height);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        // V8 Performance: Pause animation when page is not visible
        const handleVisibilityChange = () => {
            isVisibleRef.current = !document.hidden;
        };

        // Initial setup
        handleResize();

        // Start animation
        animate(ctx, canvas.width, canvas.height);

        // Event listeners
        window.addEventListener('resize', handleResize);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            cancelAnimationFrame(animationIdRef.current);
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [enabled, initParticles, animate]);

    if (!enabled) return null;

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-auto"
            style={{ opacity: 0.6 }}
        />
    );
};

export default ParticleBackground;
