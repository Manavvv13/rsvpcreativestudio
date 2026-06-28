import React, { useEffect, useRef } from 'react';

const Starfield = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Dimensions
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Stars array
    const stars = [];
    const starCount = Math.min(120, Math.floor((width * height) / 12000)); // slightly lower count for better constellation aesthetics

    // Cursor tracking for parallax
    let mouseX = 0;
    let mouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    class Star {
      constructor() {
        this.reset();
        // Stagger initial positions
        this.x = Math.random() * width;
        this.y = Math.random() * height;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.3; // size between 0.3px and 1.8px
        this.alpha = Math.random() * 0.7 + 0.15; // starting opacity
        this.twinkleSpeed = Math.random() * 0.01 + 0.003; // speed of twinkle
        this.twinkleFactor = Math.random() * Math.PI; // phase shift
        this.parallaxFactor = this.size * 0.015; // larger stars move slightly more
      }

      update() {
        // Twinkle effect (sine wave)
        this.twinkleFactor += this.twinkleSpeed;
        this.currentAlpha = this.alpha + Math.sin(this.twinkleFactor) * 0.12;
        this.currentAlpha = Math.max(0.05, Math.min(0.85, this.currentAlpha)); // clamp

        // Slow background drift
        this.y -= this.size * 0.03;

        // If star drifts off the top, reset to bottom
        if (this.y < 0) {
          this.reset();
          this.y = height;
        }
      }

      draw() {
        // Add parallax offset
        const offsetX = currentMouseX * this.parallaxFactor;
        const offsetY = currentMouseY * this.parallaxFactor;

        let renderX = this.x + offsetX;
        let renderY = this.y + offsetY;

        // Wrap around borders for parallax
        if (renderX < 0) renderX += width;
        if (renderX > width) renderX -= width;
        if (renderY < 0) renderY += height;
        if (renderY > height) renderY -= height;

        ctx.beginPath();
        ctx.arc(renderX, renderY, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.currentAlpha})`;
        ctx.fill();
      }
    }

    // Initialize stars
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    // Mouse movement handler
    const handleMouseMove = (e) => {
      // Calculate mouse displacement relative to center of screen
      mouseX = e.clientX - width / 2;
      mouseY = e.clientY - height / 2;
    };

    // Resize handler
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      const newStarCount = Math.min(120, Math.floor((width * height) / 12000));
      if (stars.length < newStarCount) {
        for (let i = stars.length; i < newStarCount; i++) {
          stars.push(new Star());
        }
      } else if (stars.length > newStarCount) {
        stars.splice(newStarCount);
      }
    };

    // Bind event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow (lerping)
      currentMouseX += (mouseX - currentMouseX) * 0.05;
      currentMouseY += (mouseY - currentMouseY) * 0.05;

      // 1. Update and draw stars
      stars.forEach((star) => {
        star.update();
        star.draw();
      });

      // 2. Draw constellation connection lines between nearby stars
      ctx.lineWidth = 0.5;
      const connectionThreshold = 105; // connect stars closer than 105px

      for (let i = 0; i < stars.length; i++) {
        const s1 = stars[i];
        
        // Calculate rendering position of star 1
        const s1OffsetX = currentMouseX * s1.parallaxFactor;
        const s1OffsetY = currentMouseY * s1.parallaxFactor;
        let s1RenderX = s1.x + s1OffsetX;
        let s1RenderY = s1.y + s1OffsetY;
        
        if (s1RenderX < 0) s1RenderX += width;
        if (s1RenderX > width) s1RenderX -= width;
        if (s1RenderY < 0) s1RenderY += height;
        if (s1RenderY > height) s1RenderY -= height;

        for (let j = i + 1; j < stars.length; j++) {
          const s2 = stars[j];
          
          // Calculate rendering position of star 2
          const s2OffsetX = currentMouseX * s2.parallaxFactor;
          const s2OffsetY = currentMouseY * s2.parallaxFactor;
          let s2RenderX = s2.x + s2OffsetX;
          let s2RenderY = s2.y + s2OffsetY;
          
          if (s2RenderX < 0) s2RenderX += width;
          if (s2RenderX > width) s2RenderX -= width;
          if (s2RenderY < 0) s2RenderY += height;
          if (s2RenderY > height) s2RenderY -= height;

          // Distance
          const dx = s1RenderX - s2RenderX;
          const dy = s1RenderY - s2RenderY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionThreshold) {
            // Opacity fades out as stars move further apart, and modulates with their twinkling
            const alpha = (1 - dist / connectionThreshold) * 0.12 * Math.min(s1.currentAlpha, s2.currentAlpha);
            
            ctx.beginPath();
            ctx.moveTo(s1RenderX, s1RenderY);
            ctx.lineTo(s2RenderX, s2RenderY);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="starfield-container">
      <canvas ref={canvasRef} className="starfield-canvas" />
    </div>
  );
};

export default Starfield;
