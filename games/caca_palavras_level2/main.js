const wordsToFind = [
    'AURORAS', 'PARTICLES', 'ENERGY', 'GEOMAGNETIC', 'BLACKOUTS', 'SOLARFLARE', 'RADIATIONSTORM','CORONALMASSEJECTION', 
];

// Função para gerar o grid automaticamente
function generateWordSearch(words, size = 20) {
    const grid = Array.from({ length: size }, () => Array(size).fill(''));

    // Apenas horizontal e vertical
    const directions = [
        [1, 0],  // vertical para baixo
        [-1, 0], // vertical para cima
        [0, 1],  // horizontal direita
        [0, -1]  // horizontal esquerda
    ];

    function canPlace(word, row, col, dir) {
        const [dx, dy] = dir;
        for (let i = 0; i < word.length; i++) {
            const x = row + dx * i;
            const y = col + dy * i;
            if (x < 0 || y < 0 || x >= size || y >= size) return false;
            if (grid[x][y] && grid[x][y] !== word[i]) return false;
        }
        return true;
    }

    function placeWord(word) {
        let placed = false;
        let tries = 0;
        while (!placed && tries < 1000) {
            tries++;
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const row = Math.floor(Math.random() * size);
            const col = Math.floor(Math.random() * size);
            if (canPlace(word, row, col, dir)) {
                const [dx, dy] = dir;
                for (let i = 0; i < word.length; i++) {
                    const x = row + dx * i;
                    const y = col + dy * i;
                    grid[x][y] = word[i];
                }
                placed = true;
            }
        }
        return placed;
    }

    words.forEach(word => {
        if (!placeWord(word.toUpperCase())) {
            console.warn(`⚠️ Não consegui posicionar: ${word}`);
        }
    });

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (!grid[i][j]) {
                grid[i][j] = alphabet[Math.floor(Math.random() * alphabet.length)];
            }
        }
    }

    return grid;
}

const gridData = generateWordSearch(wordsToFind, 20);

const grid = document.getElementById('grid');
const wordList = document.getElementById('word-list');

let selectedCells = [];
let isSelecting = false;
let foundWords = [];

function createGrid() {
    grid.innerHTML = '';
    const numRows = gridData.length;
    const numCols = gridData[0].length;
    grid.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.innerText = gridData[r][c];
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('mousedown', handleMouseDown);
            cell.addEventListener('mouseenter', handleMouseEnter);
            cell.addEventListener('mouseup', handleMouseUp);
            grid.appendChild(cell);
        }
    }
}

function createWordList() {
    wordList.innerHTML = '';
    wordsToFind.forEach(word => {
        const li = document.createElement('li');
        li.innerText = word.toUpperCase();
        li.id = `word-${word}`;
        wordList.appendChild(li);
    });
}

function handleMouseDown(e) {
    if (e.button !== 0) return;
    isSelecting = true;
    clearSelection();
    const cell = e.target;
    cell.classList.add('selected');
    selectedCells.push(cell);
}

function handleMouseEnter(e) {
    if (!isSelecting) return;
    const cell = e.target;
    if (!selectedCells.includes(cell)) {
        cell.classList.add('selected');
        selectedCells.push(cell);
    }
}

function handleMouseUp() {
    isSelecting = false;
    if (selectedCells.length > 1) {
        checkSelection();
    } else {
        clearSelection();
    }
}

function clearSelection() {
    selectedCells.forEach(cell => cell.classList.remove('selected'));
    selectedCells = [];
}

function checkSelection() {
    const selectedWord = selectedCells.map(cell => cell.innerText).join('');
    const reversedWord = selectedCells.map(cell => cell.innerText).reverse().join('');
    
    let found = false;
    let wordIndex = -1;

    for (let i = 0; i < wordsToFind.length; i++) {
        const word = wordsToFind[i];
        if ((selectedWord === word.toUpperCase() || reversedWord === word.toUpperCase()) && !foundWords.includes(word)) {
            found = true;
            wordIndex = i;
            break;
        }
    }

    if (found) {
        const foundWord = wordsToFind[wordIndex];
        foundWords.push(foundWord);
        markAsFound();
        const listItem = document.getElementById(`word-${foundWord}`);
        if (listItem) listItem.classList.add('found-word');
        clearSelection();

        // Mostrar div de vitória
        if (foundWords.length === wordsToFind.length) {
            setTimeout(() => {
                const winDiv = document.getElementById('win-message');
                winDiv.classList.remove('hidden');

                document.getElementById('next-btn').onclick = () => {
                    window.location.href = "../../lobby.html"; // coloque o link desejado
                };
            }, 500);
        }
    } else {
        setTimeout(clearSelection, 300);
    }
}

function markAsFound() {
    selectedCells.forEach(cell => {
        cell.classList.remove('selected');
        cell.classList.add('found');
    });
}

// Iniciar jogo
createGrid();
createWordList();
