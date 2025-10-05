import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  speed: number;
  phase: number;
  baseX: number;
  baseY: number;
  returnSpeed: number;
}

interface Beam {
  angleBase: number;
  progress: number;
  launchTime: number;
  active: boolean;
  floatSeed: number;
}

interface Mouse {
  x: number;
  y: number;
}

export default function SpaceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<Mouse>({ x: -1000, y: -1000 });
  const starsRef = useRef<Star[]>([]);
  const beamsRef = useRef<Beam[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };

    const initStars = () => {
      starsRef.current = [];
      for (let i = 0; i < 350; i++) {
        starsRef.current.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.5 + Math.random() * 1.2,
          speed: 0.7 + Math.random() * 1.7,
          phase: Math.random() * Math.PI * 2,
          baseX: Math.random() * W,
          baseY: Math.random() * H,
          returnSpeed: 0.02 + Math.random() * 0.03
        });
      }
    };

    const initBeams = () => {
      beamsRef.current = [];
      for (let i = 0; i < 24; i++) {
        beamsRef.current.push({
          angleBase: (2 * Math.PI / 24) * i,
          progress: 0,
          launchTime: i * 40,
          active: true,
          floatSeed: Math.random() * 100
        });
      }
    };

    const moveStars = () => {
      const mouse = mouseRef.current;
      for (let s of starsRef.current) {
        const dx = s.x - mouse.x;
        const dy = s.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 80;

        if (dist < repelRadius && dist > 0) {
          const force = (repelRadius - dist) / repelRadius;
          const angle = Math.atan2(dy, dx);
          const repelStrength = 12 * force * force;

          s.x += Math.cos(angle) * repelStrength;
          s.y += Math.sin(angle) * repelStrength;
        }

        s.y += s.speed;

        if (s.y > H) {
          s.y = 0;
          s.x = Math.random() * W;
        }
        if (s.x < 0) s.x = W;
        if (s.x > W) s.x = 0;
      }
    };

    const drawStars = (tick: number) => {
      for (let s of starsRef.current) {
        ctx.globalAlpha = 0.7 + 0.3 * Math.sin(tick / 30 + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 12;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    const drawSmallFireBeam = (
      cx: number,
      cy: number,
      baseRadius: number,
      flameLength: number,
      angle: number,
      tick: number,
      color1: string,
      color2: string,
      opacity: number,
      flameDetail = 7
    ) => {
      const points: { x: number; y: number; t: number }[] = [];
      for (let j = 0; j <= flameDetail; j++) {
        const t = j / flameDetail;
        const flicker = Math.sin(angle * 4 + tick / 13 + t * 6) * (2 + 11 * t) * Math.pow(t, 1.2);
        const r = baseRadius + t * flameLength + flicker;
        const a = angle + Math.sin(tick / 31 + t * 10 + angle) * 0.14 * (1 - t);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        points.push({ x, y, t });
      }

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let j = 1; j < points.length; j++) {
        ctx.lineTo(points[j].x, points[j].y);
      }
      for (let j = points.length - 2; j >= 0; j--) {
        const a = angle + (Math.PI / 32) * (1 - points[j].t);
        const r = baseRadius + points[j].t * flameLength + 2 + Math.sin(tick / 16 + points[j].t * 12) * 1.5;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        ctx.lineTo(x, y);
      }
      ctx.closePath();

      const grad = ctx.createLinearGradient(
        cx + Math.cos(angle) * baseRadius,
        cy + Math.sin(angle) * baseRadius,
        cx + Math.cos(angle) * (baseRadius + flameLength),
        cy + Math.sin(angle) * (baseRadius + flameLength)
      );
      grad.addColorStop(0, color1);
      grad.addColorStop(0.6, color2);
      grad.addColorStop(1, 'rgba(220,0,255,0)');
      ctx.fillStyle = grad;
      ctx.globalAlpha = opacity;
      ctx.shadowColor = '#c028fc';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.restore();
    };

    const animateBeams = (tick: number, blackHoleRadius: number, ringRadius: number, flameLength: number) => {
      const orbitRadius = ringRadius;
      const enterSpeed = 0.008;
      const launchInterval = 65;

      for (let i = 0; i < 24; i++) {
        const beam = beamsRef.current[i];
        const shouldEnter = Math.floor(tick / launchInterval) % 24 === i;
        if (shouldEnter && beam.progress === 0) {
          beam.progress = 0.01;
        }
        if (beam.progress > 0 && beam.progress < 1) {
          beam.progress += enterSpeed;
          if (beam.progress >= 1) {
            beam.progress = 0;
          }
        }

        const baseAngle = beam.angleBase;
        const slowRotation = tick / 55;
        const floatAngle = Math.sin(tick / 70 + beam.floatSeed) * 0.14;
        const angle = baseAngle + slowRotation + floatAngle;
        const floatRadius = Math.sin(tick / 80 + beam.floatSeed) * 5;
        const radius = orbitRadius * (1 - beam.progress) + blackHoleRadius * beam.progress + floatRadius;
        const length = flameLength * (1 - beam.progress) + 2 * beam.progress;
        let opacity = 0.48 + 0.22 * Math.sin(tick / 16 + angle * 5);
        if (beam.progress > 0.7) {
          opacity *= 1 - (beam.progress - 0.7) / 0.3;
        }

        drawSmallFireBeam(
          W / 2,
          H / 2,
          radius,
          length,
          angle,
          tick,
          'rgba(220,0,255,0.8)',
          'rgba(120,0,210,0.35)',
          opacity
        );
      }
    };

    const drawCosmicHome = () => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const tick = performance.now() / 20;
      const blackHoleRadius = Math.min(W, H) * 0.13;
      const ringRadius = Math.min(W, H) * 0.14;
      const flameLength = Math.min(W, H) * 0.09;

      moveStars();
      drawStars(tick);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, blackHoleRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#000';
      ctx.shadowColor = '#222';
      ctx.shadowBlur = 36;
      ctx.fill();
      ctx.restore();

      const ringCount = 6;
      for (let i = 1; i <= ringCount; i++) {
        const baseRadius = Math.min(W, H) * (0.15 + 0.04 * i);
        const pulse = Math.sin(tick / 6 + i) * 3;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius + pulse, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(${120 + 20 * i},0,${200 - i * 12},${0.22 + 0.07 * Math.cos(tick / 15 + 2 * i)})`;
        ctx.lineWidth = 9 - i;
        ctx.shadowColor = '#c028fc';
        ctx.shadowBlur = 18 + i * 3;
        ctx.stroke();
        ctx.restore();
      }

      animateBeams(tick, blackHoleRadius, ringRadius, flameLength);

      animationFrameRef.current = requestAnimationFrame(drawCosmicHome);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    resize();
    initStars();
    initBeams();
    drawCosmicHome();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-screen h-screen block"
      style={{ zIndex: 1 }}
    />
  );
}
