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
