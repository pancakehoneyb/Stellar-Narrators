// Variáveis para controlar a posição do carrossel
const trilho = document.querySelector('.carrossel-trilho');
const slides = document.querySelectorAll('.quadro-foto');

// Índice do slide atual (começa no primeiro slide)
let slideAtual = 0; 
// Total de slides
const totalSlides = slides.length; 
// Largura de um slide (igual ao width do .quadro-foto)
const larguraSlide = 532; 

/**
 * Move o carrossel para a próxima ou anterior imagem.
 * @param {number} direcao - 1 para Próximo, -1 para Anterior.
 */
function mudarSlide(direcao) {
    // Calcula o novo índice do slide
    slideAtual += direcao;

    // Lógica para loop: Se passar do último, volta para o primeiro
    if (slideAtual >= totalSlides) {
        slideAtual = 0;
    } 
    // Se passar do primeiro (para trás), vai para o último
    else if (slideAtual < 0) {
        slideAtual = totalSlides - 1;
    }

    // Calcula a quantidade de pixels para mover: -(índice atual * largura de um slide)
    const deslocamento = -slideAtual * larguraSlide;

    // Aplica a transformação ao trilho (movimento horizontal)
    trilho.style.transform = `translateX(${deslocamento}px)`;
}

// Opcional: Chama a função para garantir que o carrossel esteja na posição inicial
document.addEventListener('DOMContentLoaded', () => {
    mudarSlide(0); 
});

document.addEventListener('DOMContentLoaded', function() {
    const carrossel = document.getElementById('carouselExampleFade');
    const mostrarImagemBtn = document.getElementById('mostrarImagemBtn');
    
    // Suas variáveis e lógica anteriores para mostrar/esconder a imagem no quadro
    const imagemBotao = document.getElementById('imagemBotao');
    const imageUrl = 'sua-imagem-secreta.png'; // Lembre-se de mudar!

    // =======================================================
    // 1. LÓGICA PARA ALTERNAR A IMAGEM NO QUADRO (DO CLIQUE)
    // =======================================================
    mostrarImagemBtn.addEventListener('click', function() {
        if (imagemBotao.style.display === 'block') {
            imagemBotao.style.opacity = '0';
            setTimeout(() => {
                imagemBotao.style.display = 'none';
                imagemBotao.src = ''; 
            }, 500); 
        } else {
            imagemBotao.src = imageUrl;
            imagemBotao.style.display = 'block';
            imagemBotao.offsetHeight; 
            imagemBotao.style.opacity = '1';
        }
    });

    // =======================================================
    // 2. LÓGICA PARA MOSTRAR/ESCONDER O BOTÃO COM O SLIDE
    // =======================================================
    if (carrossel) {
        // Monitora o evento disparado APÓS o carrossel ter mudado de slide
        carrossel.addEventListener('slid.bs.carousel', function(event) {
            
            // O Bootstrap 5 armazena o índice do slide ativo na propriedade 'to' do evento
            // O índice começa em 0.
            // Slide 1 = índice 0
            // Slide 2 = índice 1  <-- Este é o que queremos!
            // Slide 3 = índice 2
            
            const indiceAtivo = event.to;

            if (indiceAtivo === 1) {
                // Estamos no Slide 2
                mostrarImagemBtn.style.display = 'block'; // Ou 'flex' se você estiver usando display: flex no CSS
            } else {
                // Não estamos no Slide 2 (Slide 1 ou 3)
                mostrarImagemBtn.style.display = 'none';
                
                // Opcional: Esconder a imagem do quadro se o usuário sair do Slide 2
                imagemBotao.style.display = 'none';
            }
        });
        
        // =======================================================
        // 3. VERIFICAÇÃO INICIAL (PARA O CASO DE JÁ ESTAR NO SLIDE 2)
        // =======================================================
        
        // Verifica qual slide está ativo quando a página carrega.
        // O Slide 1 (índice 0) está ativo por padrão. Se precisar que comece no 2:
         const slideAtivoNoCarregamento = carrossel.querySelector('.carousel-item.active');
         if (slideAtivoNoCarregamento && slideAtivoNoCarregamento === carrossel.children[1]) {
             mostrarImagemBtn.style.display = 'block';
         }
    }
});