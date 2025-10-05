
const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');

/*
 * Fundo de estrelas otimizado para melhor desempenho no navegador.
 * Este código melhora a performance reduzindo cálculos no loop de animação
 * e otimizando o desenho de elementos como brilho e chuvas de estrelas.
 */

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let parallaxX = 0;
let parallaxY = 0;

// Constantes otimizadas para melhor performance
const NUM_STARS = 400;
const MILKY_WAY_STAR_COUNT = 300;
const SHOOTING_STAR_FREQ = 0.008; // Frequência de 0.8%
const HOVER_RADIUS_SQ = 150 * 150; // Usar distância ao quadrado para evitar Math.sqrt

// Objeto para a Via Láctea
const milkyWay = {
  centerX: 0,
  centerY: 0,
  width: 0,
  length: 0,
  angle: -Math.PI / 20,
};

let stars = [];
let milkyWayStars = [];
let shootingStars = [];

// Função auxiliar para limitar valores
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Geração de cores otimizada, apenas o string RGBA
function generateStarColor(radius) {
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

// Cria uma estrela aleatória no canvas
function createStar() {
  const radius = Math.random() * 1.1 + 0.1;
  const color = generateStarColor(radius);
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: radius,
    baseOpacity: Math.random() * 0.7 + 0.3,
    flickerSpeed: Math.random() * 0.1 + 0.02,
    flickerPhase: Math.random() * Math.PI * 2,
    vx: (Math.random() - 0.5) * 0.001,
    vy: (Math.random() - 0.5) * 0.001,
    color: color,
    glow: Math.random() < 0.25,
  };
}

// Cria uma estrela na banda da Via Láctea
function createMilkyWayStar() {
  const posX = (Math.random() - 0.5) * milkyWay.length;
  const curvature = 0.00002;
  const curveY = curvature * posX * posX;
  const posY = curveY + (Math.random() - 0.5) * milkyWay.width;

  const rotatedX = posX * Math.cos(milkyWay.angle) - posY * Math.sin(milkyWay.angle);
  const rotatedY = posX * Math.sin(milkyWay.angle) + posY * Math.cos(milkyWay.angle);
  const radius = Math.random() * 0.6 + 0.1;

  const color = generateStarColor(radius);

  return {
    x: milkyWay.centerX + rotatedX,
    y: milkyWay.centerY + rotatedY,
    radius: radius,
    baseOpacity: Math.random() * 0.6 + 0.4,
    flickerSpeed: Math.random() * 0.1 + 0.05,
    flickerPhase: Math.random() * Math.PI * 2,
    color: color,
    glow: Math.random() < 0.3,
  };
}

// Cria uma chuva de estrelas
function createShootingStar() {
  const speed = 25 + Math.random() * 20;
  const maxLife = 50 + Math.random() * 30;
  const length = 10 + Math.random() * 10;
  const startX = Math.random() * canvas.width;
  const startY = Math.random() * canvas.height * 0.7;
  const shootLeft = startX > canvas.width / 2;
  const baseAngle = shootLeft ? Math.PI : 0;
  const angle = baseAngle + (Math.random() - 0.5) * (Math.PI / 10);
  const color = '180, 230, 255'; // Cor padrão

  return {
    x: startX,
    y: startY,
    speed: speed,
    length: length,
    angle: angle,
    life: 0,
    maxLife: maxLife,
    color: color,
  };
}

// Desenha a banda da Via Láctea
function drawMilkyWayGlow() {
  const gradient = ctx.createRadialGradient(
    milkyWay.centerX,
    milkyWay.centerY,
    milkyWay.width / 4,
    milkyWay.centerX,
    milkyWay.centerY,
    milkyWay.width
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.save();
  ctx.translate(milkyWay.centerX, milkyWay.centerY);
  ctx.rotate(milkyWay.angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, milkyWay.length / 2, milkyWay.width, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Desenha uma estrela
function drawStar(star, offsetX = 0, offsetY = 0) {
  const x = star.x + offsetX;
  const y = star.y + offsetY;
  const opacity = clamp(star.baseOpacity + Math.sin(star.flickerPhase) * 0.15, 0.3, 1);

  // Aplica o efeito de opacidade ao passar o mouse
  const dx = x - (mouseX + 1) / 2 * canvas.width;
  const dy = y - (mouseY + 1) / 2 * canvas.height;
  const distSq = dx * dx + dy * dy;
  const fadeOpacity = distSq < HOVER_RADIUS_SQ ? (0.2 + (distSq / HOVER_RADIUS_SQ) * 0.8) : 1;

  ctx.fillStyle = `rgba(${star.color}, ${opacity * fadeOpacity})`;
  ctx.beginPath();
  ctx.arc(x, y, star.radius, 0, Math.PI * 2);
  ctx.fill();
}

// Desenha uma chuva de estrelas otimizada
function drawShootingStar(shoot) {
  const tailLength = shoot.length;
  ctx.save();
  ctx.translate(shoot.x, shoot.y);
  ctx.rotate(shoot.angle);
  
  // Gradiente para a cauda da estrela
  const gradient = ctx.createLinearGradient(0, 0, -tailLength, 0);
  gradient.addColorStop(0, `rgba(${shoot.color}, 0.7)`);
  gradient.addColorStop(0.7, `rgba(${shoot.color}, 0.4)`);
  gradient.addColorStop(1, `rgba(${shoot.color}, 0)`);

  // Desenha a cauda
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.lineTo(-tailLength, -0.5);
  ctx.lineTo(-tailLength, 0.5);
  ctx.lineTo(0, 2);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.restore();
}

// Redimensiona o canvas e reinicializa as estrelas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  milkyWay.centerX = canvas.width / 2;
  milkyWay.centerY = canvas.height / 2 + 50;
  milkyWay.width = canvas.height / 4;
  milkyWay.length = canvas.width * 1.2;

  stars = [];
  milkyWayStars = [];
  shootingStars = [];

  for (let i = 0; i < NUM_STARS; i++) stars.push(createStar());
  for (let i = 0; i < MILKY_WAY_STAR_COUNT; i++) milkyWayStars.push(createMilkyWayStar());
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Evento de movimento do mouse
function onMouseMove(e) {
  mouseX = (e.clientX / canvas.width) * 2 - 1;
  mouseY = (e.clientY / canvas.height) * 2 - 1;
}
window.addEventListener('mousemove', onMouseMove);

// Loop principal de animação
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const easing = 0.05;
  parallaxX += (mouseX * 50 - parallaxX) * easing;
  parallaxY += (mouseY * 30 - parallaxY) * easing;

  drawMilkyWayGlow();

  const driftSpeed = 0.00005;

  // Desenha estrelas normais e da Via Láctea
  for (const star of stars) {
    star.flickerPhase += star.flickerSpeed;
    star.x += star.vx + driftSpeed;
    star.y += star.vy;

    // Reposiciona a estrela ao sair da tela
    if (star.x > canvas.width) star.x = 0;
    else if (star.x < 0) star.x = canvas.width;
    if (star.y > canvas.height) star.y = 0;
    else if (star.y < 0) star.y = canvas.height;

    drawStar(star, parallaxX * star.radius * 0.3, parallaxY * star.radius * 0.3);
  }

  for (const star of milkyWayStars) {
    star.flickerPhase += star.flickerSpeed;
    drawStar(star, parallaxX * star.radius * 0.2, parallaxY * star.radius * 0.2);
  }

  // Lógica de chuvas de estrelas
  if (shootingStars.length === 0 && Math.random() < SHOOTING_STAR_FREQ) {
    shootingStars.push(createShootingStar());
  }

  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const shoot = shootingStars[i];
    shoot.life++;

    // Atualiza a posição
    shoot.x += Math.cos(shoot.angle) * shoot.speed;
    shoot.y += Math.sin(shoot.angle) * shoot.speed;

    // Desenha a estrela cadente
    drawShootingStar(shoot);

    // Remove a estrela cadente quando a vida útil termina
    if (shoot.life > shoot.maxLife) {
      shootingStars.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

animate();
