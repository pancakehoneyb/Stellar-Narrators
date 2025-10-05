/* ==========================================
   Utilities - Funções utilitárias gerais
   ========================================== */

/**
 * Debounce - Evita execução excessiva de funções
 */
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(this, args);
    };
}

/**
 * Throttle - Limita a frequência de execução de funções
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Detecta se o dispositivo suporta touch
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Detecta se está em dispositivo móvel
 */
function isMobileDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['mobile', 'android', 'ios', 'iphone', 'ipad', 'tablet'];
    return mobileKeywords.some(keyword => userAgent.includes(keyword)) ||
           window.innerWidth <= 768;
}

/**
 * Detecta suporte a WebGL
 */
function supportsWebGL() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
                 canvas.getContext('webgl'));
    } catch (e) {
        return false;
    }
}

/**
 * Preload de imagens
 */
function preloadImages(imageUrls) {
    return Promise.all(
        imageUrls.map(url => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve({ url, img });
                img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${url}`));
                img.src = url;
            });
        })
    );
}

/**
 * Animação suave para um elemento
 */
function smoothTransition(element, property, targetValue, duration = 300) {
    if (!element) return Promise.reject(new Error('Elemento não encontrado'));
    
    return new Promise(resolve => {
        const startValue = parseFloat(getComputedStyle(element)[property]) || 0;
        const difference = targetValue - startValue;
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = startValue + (difference * easeOut);
            
            element.style[property] = `${currentValue}${property === 'opacity' ? '' : 'px'}`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        }
        
        requestAnimationFrame(animate);
    });
}

/**
 * Lazy loading para elementos
 */
function setupLazyLoading(selector = '[data-lazy]') {
    if (!('IntersectionObserver' in window)) {
        // Fallback para navegadores sem suporte
        document.querySelectorAll(selector).forEach(loadElement);
        return;
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadElement(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    document.querySelectorAll(selector).forEach(el => {
        observer.observe(el);
    });
    
    function loadElement(element) {
        const src = element.dataset.lazy;
        if (src) {
            if (element.tagName === 'IMG') {
                element.src = src;
            } else {
                element.style.backgroundImage = `url(${src})`;
            }
            element.classList.add('loaded');
        }
    }
}

/**
 * Gerenciador de erros global
 */
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.setupGlobalHandlers();
    }
    
    setupGlobalHandlers() {
        // Erros JavaScript
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error
            });
        });
        
        // Erros de Promise rejeitadas
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise',
                message: event.reason?.message || 'Promise rejeitada',
                reason: event.reason
            });
        });
        
        // Erros de recursos
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.logError({
                    type: 'resource',
                    message: `Falha ao carregar: ${event.target.src || event.target.href}`,
                    element: event.target.tagName,
                    src: event.target.src || event.target.href
                });
            }
        }, true);
    }
    
    logError(errorInfo) {
        const timestamp = new Date().toISOString();
        const errorEntry = { ...errorInfo, timestamp };
        
        this.errors.push(errorEntry);
        console.error('Erro capturado:', errorEntry);
        
        // Manter apenas os últimos 50 erros
        if (this.errors.length > 50) {
            this.errors.shift();
        }
        
        // Enviar para serviço de monitoramento (se configurado)
        this.reportError(errorEntry);
    }
    
    reportError(errorInfo) {
        // Aqui você pode integrar com serviços como Sentry, LogRocket, etc.
        // Por enquanto, apenas registra no console
        if (window.DEBUG) {
            console.group('🚨 Erro Detalhado');
            console.table(errorInfo);
            console.groupEnd();
        }
    }
    
    getErrorSummary() {
        const summary = {
            total: this.errors.length,
            byType: {},
            recent: this.errors.slice(-10)
        };
        
        this.errors.forEach(error => {
            summary.byType[error.type] = (summary.byType[error.type] || 0) + 1;
        });
        
        return summary;
    }
}

/**
 * Performance Monitor
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: [],
            memory: [],
            loadTimes: {}
        };
        this.isMonitoring = false;
    }
    
    start() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.monitorFPS();
        this.monitorMemory();
    }
    
    stop() {
        this.isMonitoring = false;
    }
    
    monitorFPS() {
        let lastTime = performance.now();
        let frames = 0;
        
        const calculateFPS = (currentTime) => {
            frames++;
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                this.metrics.fps.push(fps);
                
                // Manter apenas os últimos 60 valores
                if (this.metrics.fps.length > 60) {
                    this.metrics.fps.shift();
                }
                
                frames = 0;
                lastTime = currentTime;
            }
            
            if (this.isMonitoring) {
                requestAnimationFrame(calculateFPS);
            }
        };
        
        requestAnimationFrame(calculateFPS);
    }
    
    monitorMemory() {
        if (!performance.memory) return;
        
        const checkMemory = () => {
            const memory = {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
            };
            
            this.metrics.memory.push(memory);
            
            if (this.metrics.memory.length > 60) {
                this.metrics.memory.shift();
            }
            
            if (this.isMonitoring) {
                setTimeout(checkMemory, 5000); // A cada 5 segundos
            }
        };
        
        checkMemory();
    }
    
    markLoadTime(identifier) {
        this.metrics.loadTimes[identifier] = performance.now();
    }
    
    getAverageFPS() {
        if (this.metrics.fps.length === 0) return 0;
        return Math.round(
            this.metrics.fps.reduce((a, b) => a + b, 0) / this.metrics.fps.length
        );
    }
    
    getCurrentMemoryUsage() {
        if (!performance.memory || this.metrics.memory.length === 0) return null;
        return this.metrics.memory[this.metrics.memory.length - 1];
    }
    
    getReport() {
        return {
            averageFPS: this.getAverageFPS(),
            currentMemory: this.getCurrentMemoryUsage(),
            loadTimes: { ...this.metrics.loadTimes },
            isLowPerformance: this.getAverageFPS() < 30
        };
    }
}

// Inicialização global
window.utils = {
    debounce,
    throttle,
    isTouchDevice,
    isMobileDevice,
    supportsWebGL,
    preloadImages,
    smoothTransition,
    setupLazyLoading
};

// Instâncias globais
window.errorHandler = new ErrorHandler();
window.performanceMonitor = new PerformanceMonitor();

// Debug mode
if (localStorage.getItem('DEBUG') === 'true') {
    window.DEBUG = true;
    window.performanceMonitor.start();
    console.log('🔧 Modo debug ativado');
}

// Exportar para módulos se necessário
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debounce,
        throttle,
        isTouchDevice,
        isMobileDevice,
        supportsWebGL,
        preloadImages,
        smoothTransition,
        setupLazyLoading,
        ErrorHandler,
        PerformanceMonitor
    };
}