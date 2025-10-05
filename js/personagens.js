document.addEventListener("DOMContentLoaded", function () {
    const carrossel = document.getElementById('carouselExampleFade');
    if (!carrossel) return;

    const botaoAnterior = carrossel.querySelector(".carousel-control-prev");
    const botaoProximo = carrossel.querySelector(".carousel-control-next");
    const slidesBootstrap = carrossel.querySelectorAll(".carousel-item");

    const mostrarImagemBtn = document.getElementById('mostrarImagemBtn');
    const imagemBotao = document.getElementById('imagemBotao');
    const completionMessage = document.getElementById("completion-message");

    if (completionMessage) {
        completionMessage.style.display = "none"; // começa escondida
    }

    if (botaoAnterior) {
        botaoAnterior.addEventListener("click", function (event) {
            const slideAtivo = carrossel.querySelector(".carousel-item.active");
            if (slidesBootstrap.length && slideAtivo === slidesBootstrap[0]) {
                event.preventDefault();
                window.history.back();
            }
        });
    }

    if (botaoProximo) {
        botaoProximo.addEventListener("click", function (event) {
            const slideAtivo = carrossel.querySelector(".carousel-item.active");
            if (slidesBootstrap.length && slideAtivo === slidesBootstrap[slidesBootstrap.length - 1]) {
                event.preventDefault();

                // Marca que o quadrinho foi completado
                localStorage.setItem("comicCompleted", "true");

                // Mostrar mensagem
                if (completionMessage) {
                    completionMessage.style.display = "block";
                    completionMessage.classList.add("fade-in"); // se quiser animação
                }

                // Redireciona depois de 2 segundos
                setTimeout(() => {
                    window.location.href = "../lobby.html";
                }, 2000);
            }
        });
    }

    if (mostrarImagemBtn && imagemBotao) {
        mostrarImagemBtn.addEventListener('click', function () {
            if (imagemBotao.style.display === 'block') {
                imagemBotao.style.opacity = '0';
                setTimeout(() => {
                    imagemBotao.style.display = 'none';
                    imagemBotao.src = '';
                }, 500);
            } else {
                imagemBotao.src = 'sua-imagem-secreta.png';
                imagemBotao.style.display = 'block';
                imagemBotao.offsetHeight;
                imagemBotao.style.opacity = '1';
            }
        });

        carrossel.addEventListener('slid.bs.carousel', function (event) {
            const indiceAtivo = event.to;
            if (indiceAtivo === 1) {
                mostrarImagemBtn.style.display = 'flex';
            } else {
                mostrarImagemBtn.style.display = 'none';
                imagemBotao.style.display = 'none';
            }
        });
    }
});



//audio 

document.addEventListener('DOMContentLoaded', function () {
    const carouselElement = document.getElementById('carouselExampleFade');
    const iniciarBtn = document.getElementById('iniciarAudioBtn');
    
    // NOVO: Variável de controle para o primeiro clique
    let audioIsActive = false; 
    
    // Referências aos áudios (MANTENHA os IDs no seu HTML)
    const audioSlide1 = document.getElementById('audioSlide1'); 
    const completionMessage = document.getElementById("completion-message");
    
    const audios = [
        audioSlide1,
        document.getElementById('audioSlide2'),
        document.getElementById('audioSlide3'),
        document.getElementById('audioSlide4'),
        document.getElementById('audioSlide5')
    ];

    // Função para parar e resetar todos os áudios
    function stopAllAudios() {
        audios.forEach(audio => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }

    // =======================================================
    // 1. LÓGICA DO BOTÃO 'INICIAR' (AGORA CONFIGURA audioIsActive)
    // =======================================================
    if (iniciarBtn && audioSlide1) {
        iniciarBtn.addEventListener('click', function() {
            // SÓ TOCA SE AINDA NÃO ESTIVER ATIVO
            if (!audioIsActive) {
                audioSlide1.play().then(() => {
                    // Se o play for bem-sucedido:
                    audioIsActive = true; 
                   
                }).catch(error => {
                    console.error("Erro ao tentar tocar o primeiro áudio:", error);
                    // Opcional: manter o botão visível se o play falhar
                });
            }
        });
    }

    // =======================================================
    // 2. LÓGICA DO CARROSSEL (AGORA DEPENDE DE audioIsActive)
    // =======================================================

    // Detecta o INÍCIO da mudança de slide (para parar o áudio anterior)
    carouselElement.addEventListener('slide.bs.carousel', function (event) {
        if (audioIsActive) { // SÓ PARA SE JÁ ESTIVER ATIVO
            stopAllAudios();
        }
    });
    
    // NOVO: Função para exibir a mensagem de conclusão
    function showCompletionMessage() {
        if (completionMessage) {
            // Marca o quadrinho como completado aqui, se for o momento correto
            // localStorage.setItem("comicCompleted", "true"); 
            completionMessage.style.display = "block";
            completionMessage.classList.add("fade-in");
        }
    }
    
    // Detecta o FIM da mudança de slide (para tocar o novo áudio)
    carouselElement.addEventListener('slid.bs.carousel', function (event) {
        // SÓ TOCA ÁUDIOS SUBSEQUENTES SE JÁ TIVER CLICADO NO BOTÃO INICIAR
        if (audioIsActive) {
            const newSlideIndex = event.to; 
            const audioToPlay = audios[newSlideIndex];
            const isLastSlide = newSlideIndex === audios.length - 1; 

            if (audioToPlay) {
                audioToPlay.play().catch(error => {
                    console.log("Audio play failed on slide change.", error);
                });

                // NOVO: Verifica se é o último áudio e adiciona o evento 'ended'
                if (isLastSlide) {
                    audioToPlay.removeEventListener('ended', showCompletionMessage); // Previne duplicidade
                    audioToPlay.addEventListener('ended', showCompletionMessage);
                }
            }
        }
    });
});