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

const ParticleBackground = ({
    particleCount = 80,
    connectionDistance = 120,
    particleColor = 'rgba(139, 92, 246, 0.6)',
    lineColor = 'rgba(139, 92, 246, 0.15)',
    enabled = true,
}: ParticleBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationIdRef = useRef<number>(0);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    // Initialize particles
    const initParticles = useCallback((width: number, height: number) => {
        const particles: Particle[] = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.3,
            });
        }
        particlesRef.current = particles;
    }, [particleCount]);

    // Animation loop
    const animate = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
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

            // Mouse interaction - gentle repulsion
            const dx = particle.x - mouse.x;
            const dy = particle.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                const force = (100 - dist) / 100;
                particle.vx += (dx / dist) * force * 0.02;
                particle.vy += (dy / dist) * force * 0.02;
            }

            // Limit velocity
            const maxSpeed = 1;
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

            // Draw connections
            for (let j = i + 1; j < particles.length; j++) {
                const other = particles[j];
                const distX = particle.x - other.x;
                const distY = particle.y - other.y;
                const distance = Math.sqrt(distX * distX + distY * distY);

                if (distance < connectionDistance) {
                    const opacity = (1 - distance / connectionDistance) * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.strokeStyle = lineColor.replace('0.15', String(opacity));
                    ctx.lineWidth = 0.5;
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

        // Initial setup
        handleResize();

        // Start animation
        animate(ctx, canvas.width, canvas.height);

        // Event listeners
        window.addEventListener('resize', handleResize);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            cancelAnimationFrame(animationIdRef.current);
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [enabled, initParticles, animate]);

    if (!enabled) return null;

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-auto"
            style={{ opacity: 0.7 }}
        />
    );
};

export default ParticleBackground;
