/* ====================================================
   Star Canvas Animation - Otimizado para performance
   ==================================================== */

class StarField {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn(`Canvas com ID "${canvasId}" não encontrado`);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.mouseX = 0.5;
        this.mouseY = 0.5;
        this.parallaxX = 0;
        this.parallaxY = 0;
        
        // Configurações otimizadas
        this.config = {
            NUM_STARS: 400,
            MILKY_WAY_STAR_COUNT: 300,
            SHOOTING_STAR_FREQ: 0.008,
            HOVER_RADIUS_SQ: 150 * 150,
            DRIFT_SPEED: 0.00005,
            EASING: 0.05
        };
        
        this.stars = [];
        this.milkyWayStars = [];
        this.shootingStars = [];
        this.animationId = null;
        
        this.milkyWay = {
            centerX: 0,
            centerY: 0,
            width: 0,
            length: 0,
            angle: -Math.PI / 20
        };
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.setupEventListeners();
        this.createStars();
        this.animate();
    }
    
    setupEventListeners() {
        // Throttle do evento de resize para melhor performance
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.resizeCanvas(), 250);
        });
        
        // Throttle do movimento do mouse
        let mouseTimeout;
        window.addEventListener('mousemove', (e) => {
            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => {
                this.mouseX = (e.clientX / this.canvas.width) * 2 - 1;
                this.mouseY = (e.clientY / this.canvas.height) * 2 - 1;
            }, 16); // ~60fps
        });
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.updateMilkyWayConfig();
        this.createStars();
    }
    
    updateMilkyWayConfig() {
        this.milkyWay.centerX = this.canvas.width / 2;
        this.milkyWay.centerY = this.canvas.height / 2 + 50;
        this.milkyWay.width = this.canvas.height / 4;
        this.milkyWay.length = this.canvas.width * 1.2;
    }
    
    createStars() {
        this.stars = [];
        this.milkyWayStars = [];
        this.shootingStars = [];
        
        // Usar DocumentFragment para melhor performance
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < this.config.NUM_STARS; i++) {
            this.stars.push(this.createStar());
        }
        
        for (let i = 0; i < this.config.MILKY_WAY_STAR_COUNT; i++) {
            this.milkyWayStars.push(this.createMilkyWayStar());
        }
    }
    
    generateStarColor(radius) {
        const spectralType = Math.random();
        let r, g, b;
        
        if (spectralType < 0.01) { r = 155; g = 176; b = 255; }
        else if (spectralType < 0.1) { r = 170; g = 200; b = 255; }
        else if (spectralType < 0.3) { r = 235; g = 240; b = 255; }
        else if (spectralType < 0.5) { r = 255; g = 245; b = 220; }
        else if (spectralType < 0.7) { r = 255; g = 230; b = 180; }
        else if (spectralType < 0.9) { r = 255; g = 190; b = 120; }
        else { r = 255; g = 120; b = 100; }
        
        return `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}`;
    }
    
    createStar() {
        const radius = Math.random() * 1.1 + 0.1;
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            radius: radius,
            baseOpacity: Math.random() * 0.7 + 0.3,
            flickerSpeed: Math.random() * 0.1 + 0.02,
            flickerPhase: Math.random() * Math.PI * 2,
            vx: (Math.random() - 0.5) * 0.001,
            vy: (Math.random() - 0.5) * 0.001,
            color: this.generateStarColor(radius),
            glow: Math.random() < 0.25
        };
    }
    
    createMilkyWayStar() {
        const posX = (Math.random() - 0.5) * this.milkyWay.length;
        const curvature = 0.00002;
        const curveY = curvature * posX * posX;
        const posY = curveY + (Math.random() - 0.5) * this.milkyWay.width;
        
        const rotatedX = posX * Math.cos(this.milkyWay.angle) - posY * Math.sin(this.milkyWay.angle);
        const rotatedY = posX * Math.sin(this.milkyWay.angle) + posY * Math.cos(this.milkyWay.angle);
        const radius = Math.random() * 0.6 + 0.1;
        
        return {
            x: this.milkyWay.centerX + rotatedX,
            y: this.milkyWay.centerY + rotatedY,
            radius: radius,
            baseOpacity: Math.random() * 0.6 + 0.4,
            flickerSpeed: Math.random() * 0.1 + 0.05,
            flickerPhase: Math.random() * Math.PI * 2,
            color: this.generateStarColor(radius),
            glow: Math.random() < 0.3
        };
    }
    
    createShootingStar() {
        const speed = 25 + Math.random() * 20;
        const maxLife = 50 + Math.random() * 30;
        const length = 10 + Math.random() * 10;
        const startX = Math.random() * this.canvas.width;
        const startY = Math.random() * this.canvas.height * 0.7;
        const shootLeft = startX > this.canvas.width / 2;
        const baseAngle = shootLeft ? Math.PI : 0;
        const angle = baseAngle + (Math.random() - 0.5) * (Math.PI / 10);
        
        return {
            x: startX,
            y: startY,
            speed: speed,
            length: length,
            angle: angle,
            life: 0,
            maxLife: maxLife,
            color: '180, 230, 255'
        };
    }
    
    clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }
    
    drawMilkyWayGlow() {
        const gradient = this.ctx.createRadialGradient(
            this.milkyWay.centerX,
            this.milkyWay.centerY,
            this.milkyWay.width / 4,
            this.milkyWay.centerX,
            this.milkyWay.centerY,
            this.milkyWay.width
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.save();
        this.ctx.translate(this.milkyWay.centerX, this.milkyWay.centerY);
        this.ctx.rotate(this.milkyWay.angle);
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.milkyWay.length / 2, this.milkyWay.width, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    drawStar(star, offsetX = 0, offsetY = 0) {
        const x = star.x + offsetX;
        const y = star.y + offsetY;
        const opacity = this.clamp(star.baseOpacity + Math.sin(star.flickerPhase) * 0.15, 0.3, 1);
        
        // Efeito de fade ao passar o mouse
        const dx = x - (this.mouseX + 1) / 2 * this.canvas.width;
        const dy = y - (this.mouseY + 1) / 2 * this.canvas.height;
        const distSq = dx * dx + dy * dy;
        const fadeOpacity = distSq < this.config.HOVER_RADIUS_SQ ? 
            (0.2 + (distSq / this.config.HOVER_RADIUS_SQ) * 0.8) : 1;
        
        this.ctx.fillStyle = `rgba(${star.color}, ${opacity * fadeOpacity})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, star.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawShootingStar(shoot) {
        const tailLength = shoot.length;
        this.ctx.save();
        this.ctx.translate(shoot.x, shoot.y);
        this.ctx.rotate(shoot.angle);
        
        const gradient = this.ctx.createLinearGradient(0, 0, -tailLength, 0);
        gradient.addColorStop(0, `rgba(${shoot.color}, 0.7)`);
        gradient.addColorStop(0.7, `rgba(${shoot.color}, 0.4)`);
        gradient.addColorStop(1, `rgba(${shoot.color}, 0)`);
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, -2);
        this.ctx.lineTo(-tailLength, -0.5);
        this.ctx.lineTo(-tailLength, 0.5);
        this.ctx.lineTo(0, 2);
        this.ctx.closePath();
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    updateStars() {
        for (const star of this.stars) {
            star.flickerPhase += star.flickerSpeed;
            star.x += star.vx + this.config.DRIFT_SPEED;
            star.y += star.vy;
            
            // Reposiciona estrelas que saíram da tela
            if (star.x > this.canvas.width) star.x = 0;
            else if (star.x < 0) star.x = this.canvas.width;
            if (star.y > this.canvas.height) star.y = 0;
            else if (star.y < 0) star.y = this.canvas.height;
        }
        
        for (const star of this.milkyWayStars) {
            star.flickerPhase += star.flickerSpeed;
        }
    }
    
    updateShootingStars() {
        // Criar novas estrelas cadentes
        if (this.shootingStars.length === 0 && Math.random() < this.config.SHOOTING_STAR_FREQ) {
            this.shootingStars.push(this.createShootingStar());
        }
        
        // Atualizar estrelas cadentes existentes
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const shoot = this.shootingStars[i];
            shoot.life++;
            
            shoot.x += Math.cos(shoot.angle) * shoot.speed;
            shoot.y += Math.sin(shoot.angle) * shoot.speed;
            
            if (shoot.life > shoot.maxLife) {
                this.shootingStars.splice(i, 1);
            }
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Parallax suave
        this.parallaxX += (this.mouseX * 50 - this.parallaxX) * this.config.EASING;
        this.parallaxY += (this.mouseY * 30 - this.parallaxY) * this.config.EASING;
        
        // Desenhar Via Láctea
        this.drawMilkyWayGlow();
        
        // Atualizar e desenhar estrelas
        this.updateStars();
        
        for (const star of this.stars) {
            this.drawStar(star, this.parallaxX * star.radius * 0.3, this.parallaxY * star.radius * 0.3);
        }
        
        for (const star of this.milkyWayStars) {
            this.drawStar(star, this.parallaxX * star.radius * 0.2, this.parallaxY * star.radius * 0.2);
        }
        
        // Atualizar e desenhar estrelas cadentes
        this.updateShootingStars();
        for (const shoot of this.shootingStars) {
            this.drawShootingStar(shoot);
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        window.removeEventListener('resize', this.resizeCanvas);
        window.removeEventListener('mousemove', this.onMouseMove);
    }
}

// Inicialização automática quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const starCanvas = document.getElementById('starCanvas');
    if (starCanvas) {
        window.starField = new StarField('starCanvas');
    }
});

// Exportar para uso em módulos (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StarField;
}