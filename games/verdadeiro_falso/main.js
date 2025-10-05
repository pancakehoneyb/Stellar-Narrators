// =====================
// Quiz Questions JSON
// =====================
const questions = [
    {
        question: "The Earth's magnetosphere is a static, impenetrable shield that completely prevents solar particles from entering our planet.",
        hint: "Think about whether the Earth's 'shield' can be affected by strong solar events.",
        answer: false,
        justification: "The magnetosphere is dynamic and can be compressed by strong solar winds, allowing particles to enter the Earth's atmosphere, especially at the poles."
    },
    {
        question: "Coronal Mass Ejections (CMEs) are plasma clouds that travel slower than normal solar wind, making their impact always predictable.",
        hint: "Consider the speed and intensity of a solar storm compared to constant solar wind.",
        answer: false,
        justification: "CMEs can travel faster than solar wind, and their trajectory and impact are hard to predict, requiring complex models and monitoring."
    },
    {
        question: "The primary cause of polar auroras is the interaction of solar wind particles with Earth's magnetic field.",
        hint: "Remember what happens when the energy of solar particles is transferred to Earth's atmosphere.",
        answer: true,
        justification: "Auroras occur when charged particles from the solar wind interact with the magnetosphere and collide with atoms in the upper atmosphere, emitting light."
    },
    {
        question: "Geomagnetic storms are dangerous for astronauts on the ISS because they can cause short circuits in onboard electronics.",
        hint: "Consider the main health concern for humans exposed to solar events in space.",
        answer: false,
        justification: "The main risk is increased radiation exposure, which can pose serious long-term health risks, though the ISS provides some protection."
    },
    {
        question: "Interference in GPS and satellite communications during space weather events is mainly caused by radio waves emitted by the Sun.",
        hint: "Think about what happens to Earth's atmosphere when hit by solar particles and energy.",
        answer: false,
        justification: "The interference is caused by ionization of the ionosphere by solar events, which affects the path and integrity of radio signals, not directly by the Sun's radio waves."
    },
    {
        question: "Coronal holes on the Sun are low-density and temperature areas in the corona, from which the solar wind flows slower than normal.",
        hint: "Consider the magnetic field in these holes and how it affects solar wind speed.",
        answer: false,
        justification: "Coronal holes are sources of high-speed solar wind. Open magnetic field lines allow plasma to escape rapidly into interplanetary space."
    },
    {
        question: "The Solar Corona is the innermost layer of the Sun's atmosphere, just above the photosphere.",
        hint: "Think about the order of the Sun's layers from inside out.",
        answer: false,
        justification: "The Solar Corona is the outermost, hottest layer of the Sun's atmosphere, extending millions of kilometers into space."
    },
    {
        question: "Auroras seen at higher latitudes (far from the poles) are usually a sign of a strong geomagnetic storm.",
        hint: "Consider the effect of a strong geomagnetic storm on Earth's magnetosphere shape and size.",
        answer: true,
        justification: "A strong geomagnetic storm expands the auroral oval toward the equator, making auroras visible at lower latitudes than usual."
    },
    {
        question: "During Solar Maximum, the Sun shows more sunspots but less flare and CME activity than usual.",
        hint: "The name 'Solar Maximum' already hints at the Sun's activity level.",
        answer: false,
        justification: "Solar Maximum is the peak of the 11-year solar cycle, with many sunspots and increased flare and CME occurrence."
    },
    {
        question: "A Solar Particle Event (SPE) emits high-energy ions that can penetrate spacecraft shielding and damage equipment and health.",
        hint: "Consider the type of particles and energy in a solar radiation event.",
        answer: true,
        justification: "SPEs emit high-energy radiation capable of damaging electronics and posing a real health risk to astronauts, even through shielding."
    }
];

// =====================
// DOM Elements
// =====================
const quizContainer = document.getElementsByClassName('quiz-container');
const questionText = document.getElementById('question-text');
const answerButtons = document.getElementById('answer-buttons');
const feedbackContainer = document.getElementById('feedback-container');
const feedbackText = document.getElementById('feedback-text');
const nextButton = document.getElementById('next-btn');
const hintBtn = document.getElementById('hint-btn');
const hintContainer = document.getElementById('hint-container');
const hintText = document.getElementById('hint-text');
const winMessage = document.getElementById('win-message');
const finalScoreText = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

let currentQuestionIndex = 0;
let score = 0;

// =====================
// Start Quiz
// =====================
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    winMessage.classList.add('hidden');
    answerButtons.classList.remove('hide');
    hintBtn.classList.remove('hide');
    showQuestion();
}

// =====================
// Show Question
// =====================
function showQuestion() {
    resetState();
    const currentQuestion = questions[currentQuestionIndex];
    questionText.innerText = currentQuestion.question;
}

// =====================
// Reset State
// =====================
function resetState() {
    nextButton.classList.add('hide');
    feedbackContainer.classList.add('hide');
    hintContainer.classList.add('hide');
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }

    const trueButton = document.createElement('button');
    trueButton.classList.add('btn');
    trueButton.innerText = "True";
    trueButton.dataset.answer = 'true';
    trueButton.addEventListener('click', selectAnswer);

    const falseButton = document.createElement('button');
    falseButton.classList.add('btn');
    falseButton.innerText = "False";
    falseButton.dataset.answer = 'false';
    falseButton.addEventListener('click', selectAnswer);

    answerButtons.appendChild(trueButton);
    answerButtons.appendChild(falseButton);
}

// =====================
// Show Hint
// =====================
function showHint() {
    const currentQuestion = questions[currentQuestionIndex];
    hintText.innerText = currentQuestion.hint;
    hintContainer.classList.remove('hide');
}

hintBtn.addEventListener('click', showHint);

// =====================
// Select Answer
// =====================
function selectAnswer(e) {
    const selectedButton = e.target;
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedButton.dataset.answer === currentQuestion.answer.toString();

    feedbackContainer.classList.remove('hide');

    if (isCorrect) {
        selectedButton.classList.add('correct');
        feedbackText.innerText = `Correct! ${currentQuestion.justification}`;
        score++;
    } else {
        selectedButton.classList.add('wrong');
        feedbackText.innerText = `Incorrect. ${currentQuestion.justification}`;
    }

    // Disable buttons
    Array.from(answerButtons.children).forEach(button => {
        button.disabled = true;
        if (button.dataset.answer === currentQuestion.answer.toString()) {
            button.classList.add('correct');
        }
    });

    nextButton.classList.remove('hide');
}

// =====================
// Handle Next Question
// =====================
function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        endQuiz();
    }
}

// =====================
// End Quiz
// =====================
function endQuiz() {
    answerButtons.classList.add('hide');
    hintBtn.classList.add('hide');
    feedbackContainer.classList.add('hide');
    nextButton.classList.add('hide');
    quizContainer[0].classList.add('hide');

    finalScoreText.innerText = `🎉 Your score: ${score} / ${questions.length}`;
    // Opcional: mostrar a última justificativa ou mensagem personalizada
    document.getElementById('final-feedback').innerText = 
        questions[currentQuestionIndex - 1].justification;

    winMessage.classList.remove('hidden');
}


// =====================
// Restart Quiz
// =====================
restartBtn.addEventListener('click', () => {
    startQuiz();
});

nextButton.addEventListener('click', handleNextButton);

// =====================
// Initialize
// =====================
startQuiz();
