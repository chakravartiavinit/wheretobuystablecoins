import React, { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
        this.history = [];
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.3 + 0.1;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.hue = Math.random() * 60 + 260; // Purple to pink range
      }

      update() {
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > 10) {
          this.history.shift();
        }

        this.x += this.speedX + Math.sin(time * 0.001 + this.y * 0.01) * 0.5;
        this.y += this.speedY;

        if (this.y > canvas.height + 10) {
          this.reset();
        }
        if (this.x > canvas.width + 10 || this.x < -10) {
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        // Draw trail
        for (let i = 0; i < this.history.length; i++) {
          const point = this.history[i];
          const alpha = (i / this.history.length) * this.opacity * 0.5;
          ctx.fillStyle = `hsla(${this.hue}, 70%, 70%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(point.x, point.y, this.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw particle
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
        gradient.addColorStop(0, `hsla(${this.hue}, 80%, 75%, ${this.opacity})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 80%, 75%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const numberOfParticles = Math.floor((canvas.width * canvas.height) / 12000);
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    // Draw animated nebula background
    const drawNebula = () => {
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.3 + Math.sin(time * 0.0005) * 100,
        canvas.height * 0.4 + Math.cos(time * 0.0003) * 100,
        0,
        canvas.width * 0.3,
        canvas.height * 0.4,
        canvas.width * 0.6
      );
      gradient1.addColorStop(0, 'rgba(93, 71, 154, 0.15)'); // #5D479A
      gradient1.addColorStop(0.5, 'rgba(105, 71, 134, 0.08)'); // #694786
      gradient1.addColorStop(1, 'rgba(26, 19, 71, 0)'); // #1A1347

      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.7 + Math.cos(time * 0.0004) * 150,
        canvas.height * 0.6 + Math.sin(time * 0.0006) * 150,
        0,
        canvas.width * 0.7,
        canvas.height * 0.6,
        canvas.width * 0.5
      );
      gradient2.addColorStop(0, 'rgba(164, 134, 176, 0.12)'); // #A486B0
      gradient2.addColorStop(0.5, 'rgba(241, 183, 234, 0.06)'); // #F1B7EA
      gradient2.addColorStop(1, 'rgba(60, 45, 87, 0)'); // #3C2D57

      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Draw flowing waves
    const drawWaves = () => {
      ctx.strokeStyle = 'rgba(241, 183, 234, 0.1)'; // #F1B7EA
      ctx.lineWidth = 2;

      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 5) {
          const y = canvas.height * (0.5 + i * 0.1) + 
                   Math.sin(x * 0.01 + time * 0.001 + i) * 30 +
                   Math.cos(x * 0.02 + time * 0.002 + i * 2) * 20;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    };

    const animate = () => {
      // Dark base background
      ctx.fillStyle = '#1A1347';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated nebula clouds
      drawNebula();

      // Flowing waves
      drawWaves();

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      time++;
      animationFrameId = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default AnimatedBackground;
