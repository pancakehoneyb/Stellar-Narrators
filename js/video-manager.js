/* ===========================================
   Video Manager - Gerenciamento de vídeos
   =========================================== */

class VideoManager {
    constructor() {
        this.videos = new Map();
        this.currentVideo = null;
        this.autoplayAttempts = 0;
        this.maxAutoplayAttempts = 10;
    }
    
    /**
     * Registra um vídeo para gerenciamento
     * @param {string} id - ID único do vídeo
     * @param {HTMLVideoElement} videoElement - Elemento de vídeo
     * @param {Object} options - Opções do vídeo
     */
    registerVideo(id, videoElement, options = {}) {
        if (!videoElement) {
            console.warn(`Elemento de vídeo não encontrado para ID: ${id}`);
            return false;
        }
        
        const videoConfig = {
            element: videoElement,
            muted: options.muted ?? true,
            loop: options.loop ?? true,
            autoplay: options.autoplay ?? true,
            sources: options.sources || [],
            ...options
        };
        
        this.videos.set(id, videoConfig);
        this.setupVideoEvents(id, videoConfig);
        
        return true;
    }
    
    /**
     * Configura eventos para um vídeo específico
     */
    setupVideoEvents(id, config) {
        const { element } = config;
        
        element.addEventListener('loadeddata', () => {
            console.log(`Vídeo ${id} carregado com sucesso`);
        });
        
        element.addEventListener('error', (e) => {
            console.error(`Erro ao carregar vídeo ${id}:`, e);
        });
        
        element.addEventListener('ended', () => {
            if (config.onEnded) {
                config.onEnded(element);
            }
        });
        
        // Tentar autoplay quando os metadados estiverem carregados
        element.addEventListener('loadedmetadata', () => {
            if (config.autoplay) {
                this.attemptAutoplay(id);
            }
        });
    }
    
    /**
     * Tenta reproduzir vídeo com som, fallback para mudo
     */
    async attemptAutoplay(id, withSound = false) {
        const config = this.videos.get(id);
        if (!config) return false;
        
        const { element } = config;
        
        try {
            element.muted = !withSound;
            await element.play();
            
            if (!withSound && this.autoplayAttempts < this.maxAutoplayAttempts) {
                // Tentar novamente com som após interação do usuário
                this.scheduleAudioAutoplay(id);
            }
            
            console.log(`Vídeo ${id} iniciado ${withSound ? 'com' : 'sem'} som`);
            return true;
            
        } catch (error) {
            if (withSound && this.autoplayAttempts < this.maxAutoplayAttempts) {
                console.warn(`Falha no autoplay com som para ${id}, tentando sem som`);
                return this.attemptAutoplay(id, false);
            }
            
            console.error(`Falha no autoplay para vídeo ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Agenda tentativas de autoplay com som
     */
    scheduleAudioAutoplay(id) {
        const attemptAudioPlay = () => {
            if (this.autoplayAttempts >= this.maxAutoplayAttempts) return;
            
            this.autoplayAttempts++;
            
            // Simular interação do usuário
            const events = ['click', 'touchstart', 'keydown'];
            
            const tryAudioPlay = () => {
                this.attemptAutoplay(id, true).then(success => {
                    if (success) {
                        // Remover listeners após sucesso
                        events.forEach(event => {
                            window.removeEventListener(event, tryAudioPlay);
                        });
                    }
                });
            };
            
            events.forEach(event => {
                window.addEventListener(event, tryAudioPlay, { once: true });
            });
            
            // Tentar novamente após um delay
            setTimeout(attemptAudioPlay, 1000);
        };
        
        requestAnimationFrame(attemptAudioPlay);
    }
    
    /**
     * Troca a fonte de um vídeo
     */
    async changeVideoSource(id, newSource) {
        const config = this.videos.get(id);
        if (!config) {
            console.warn(`Vídeo ${id} não encontrado`);
            return false;
        }
        
        const { element } = config;
        
        try {
            element.pause();
            
            // Limpar sources existentes
            const sources = element.querySelectorAll('source');
            sources.forEach(source => source.remove());
            
            // Adicionar nova source
            const sourceElement = document.createElement('source');
            sourceElement.src = newSource;
            sourceElement.type = this.getVideoType(newSource);
            element.appendChild(sourceElement);
            
            // Recarregar e reproduzir
            element.load();
            
            return new Promise((resolve) => {
                element.addEventListener('loadeddata', async () => {
                    const success = await this.attemptAutoplay(id);
                    resolve(success);
                }, { once: true });
            });
            
        } catch (error) {
            console.error(`Erro ao trocar fonte do vídeo ${id}:`, error);
            return false;
        }
    }
    
    /**
     * Determina o tipo MIME do vídeo baseado na extensão
     */
    getVideoType(src) {
        const extension = src.split('.').pop().toLowerCase();
        const types = {
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'ogg': 'video/ogg',
            'avi': 'video/avi',
            'mov': 'video/quicktime'
        };
        
        return types[extension] || 'video/mp4';
    }
    
    /**
     * Aplica efeitos visuais a um vídeo
     */
    applyVideoEffect(id, effect) {
        const config = this.videos.get(id);
        if (!config) return false;
        
        const { element } = config;
        
        switch (effect) {
            case 'blur':
                element.classList.add('video-background--blur');
                break;
            case 'brightness':
                element.style.filter = 'brightness(1.2) saturate(1.3)';
                break;
            case 'normal':
                element.classList.remove('video-background--blur');
                element.style.filter = '';
                break;
            default:
                element.style.filter = effect;
        }
        
        return true;
    }
    
    /**
     * Pausa todos os vídeos
     */
    pauseAll() {
        this.videos.forEach((config, id) => {
            config.element.pause();
        });
    }
    
    /**
     * Para e limpa um vídeo específico
     */
    stopVideo(id) {
        const config = this.videos.get(id);
        if (!config) return false;
        
        const { element } = config;
        element.pause();
        element.currentTime = 0;
        
        return true;
    }
    
    /**
     * Remove um vídeo do gerenciamento
     */
    unregisterVideo(id) {
        const config = this.videos.get(id);
        if (config) {
            this.stopVideo(id);
            this.videos.delete(id);
            return true;
        }
        return false;
    }
    
    /**
     * Limpa todos os vídeos
     */
    destroy() {
        this.pauseAll();
        this.videos.clear();
        this.currentVideo = null;
    }
}

// Exportar instância global
window.VideoManager = VideoManager;

// Criar instância global
if (!window.videoManager) {
    window.videoManager = new VideoManager();
}

// Exportar para módulos se necessário
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoManager;
}