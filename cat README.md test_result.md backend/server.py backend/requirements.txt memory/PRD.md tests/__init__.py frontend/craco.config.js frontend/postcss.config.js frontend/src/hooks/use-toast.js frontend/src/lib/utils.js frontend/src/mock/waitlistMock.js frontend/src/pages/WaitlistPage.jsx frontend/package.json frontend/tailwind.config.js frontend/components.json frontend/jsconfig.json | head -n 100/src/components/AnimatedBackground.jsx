import React, { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 1500;
        this.size = Math.random() * 2 + 0.5;
        this.velocity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.z -= this.velocity * 3;
        if (this.z <= 0) {
          this.reset();
          this.z = 1500;
        }
      }

      draw() {
        const x = (this.x - canvas.width / 2) * (1000 / this.z) + canvas.width / 2;
        const y = (this.y - canvas.height / 2) * (1000 / this.z) + canvas.height / 2;
        const size = (1 - this.z / 1500) * this.size * 3;
        const opacity = 1 - this.z / 1500;

        ctx.fillStyle = `rgba(164, 134, 176, ${opacity * 0.6})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Floating geometric shapes
    class GeometricShape {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 60 + 30;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.1 + 0.05;
        this.type = Math.floor(Math.random() * 3);
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.x < -this.size) this.x = canvas.width + this.size;
        if (this.x > canvas.width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = canvas.height + this.size;
        if (this.y > canvas.height + this.size) this.y = -this.size;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.strokeStyle = `rgba(93, 71, 154, ${this.opacity})`;
        ctx.lineWidth = 2;

        if (this.type === 0) {
          // Triangle
          ctx.beginPath();
          ctx.moveTo(0, -this.size / 2);
          ctx.lineTo(this.size / 2, this.size / 2);
          ctx.lineTo(-this.size / 2, this.size / 2);
          ctx.closePath();
          ctx.stroke();
        } else if (this.type === 1) {
          // Square
          ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
          // Hexagon
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = Math.cos(angle) * this.size / 2;
            const y = Math.sin(angle) * this.size / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    // Energy lines
    class EnergyLine {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -50;
        this.length = Math.random() * 150 + 100;
        this.speed = Math.random() * 3 + 2;
        this.opacity = Math.random() * 0.3 + 0.2;
        this.width = Math.random() * 2 + 1;
      }

      update() {
        this.y += this.speed;
        if (this.y > canvas.height + this.length) {
          this.reset();
        }
      }

      draw() {
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.length);
        gradient.addColorStop(0, `rgba(241, 183, 234, 0)`);
        gradient.addColorStop(0.5, `rgba(241, 183, 234, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(93, 71, 154, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.width;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.stroke();
      }
    }

    const particles = Array.from({ length: 150 }, () => new Particle());
    const shapes = Array.from({ length: 15 }, () => new GeometricShape());
    const energyLines = Array.from({ length: 20 }, () => new EnergyLine());

    // Draw 3D grid
    const drawGrid = () => {
      const gridSize = 50;
      const perspective = 500;
      const gridY = canvas.height * 0.85;

      ctx.strokeStyle = 'rgba(93, 71, 154, 0.15)';
      ctx.lineWidth = 1;

      // Horizontal lines
      for (let i = -10; i <= 10; i++) {
        const z = i * gridSize + (time * 2) % gridSize;
        const scale = perspective / (perspective + z);
        const y = gridY + z * scale;
        const x1 = canvas.width / 2 - 500 * scale;
        const x2 = canvas.width / 2 + 500 * scale;

        if (scale > 0 && y < canvas.height) {
          ctx.globalAlpha = Math.max(0, 1 - z / 500);
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.stroke();
        }
      }

      // Vertical lines
      for (let i = -10; i <= 10; i++) {
        ctx.beginPath();
        const x = canvas.width / 2 + i * gridSize;
        ctx.moveTo(x, gridY);
        
        for (let z = 0; z < 500; z += 10) {
          const zPos = z + (time * 2) % gridSize;
          const scale = perspective / (perspective + zPos);
          const y = gridY + zPos * scale;
          const xProjected = canvas.width / 2 + (i * gridSize - canvas.width / 2) * scale + canvas.width / 2 * (1 - scale);
          
          if (scale > 0 && y < canvas.height) {
            ctx.globalAlpha = Math.max(0, 1 - zPos / 500) * 0.15;
            ctx.lineTo(xProjected, y);
          }
        }
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    };

    // Draw scan lines
    const drawScanLines = () => {
      ctx.strokeStyle = 'rgba(93, 71, 154, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.height; i += 4) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
    };

    // Draw glowing orbs
    const drawOrbs = () => {
      const orbCount = 3;
      for (let i = 0; i < orbCount; i++) {
        const x = canvas.width * (0.2 + i * 0.3) + Math.sin(time * 0.001 + i * 2) * 100;
        const y = canvas.height * 0.3 + Math.cos(time * 0.0015 + i * 2) * 80;
        const radius = 150 + Math.sin(time * 0.002 + i) * 50;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(93, 71, 154, 0.08)');
        gradient.addColorStop(0.5, 'rgba(105, 71, 134, 0.03)');
        gradient.addColorStop(1, 'rgba(93, 71, 154, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const animate = () => {
      // Clear with black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw glowing orbs
      drawOrbs();

      // Draw 3D grid
      drawGrid();

      // Draw scan lines
      drawScanLines();

      // Update and draw geometric shapes
      shapes.forEach(shape => {
        shape.update();
        shape.draw();
      });

      // Update and draw energy lines
      energyLines.forEach(line => {
        line.update();
        line.draw();
      });

      // Update and draw particles with depth
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      time++;
      animationFrameId = requestAnimationFrame(animate);
    };

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
