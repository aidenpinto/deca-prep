// Exam State
let timeRemaining = 70 * 60; // 70 minutes in seconds
let timerInterval;
let userAnswers = {};
let examSubmitted = false;
let examStarted = false;
const STORAGE_KEY = 'deca_exam_answers';
const TIME_STORAGE_KEY = 'deca_exam_time';
const EXAM_STARTED_KEY = 'deca_exam_started';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    
    // Check if exam was previously started
    const wasStarted = localStorage.getItem(EXAM_STARTED_KEY);
    if (wasStarted === 'true') {
        // Resume exam
        examQuestions = examQuestions_ICDC_HT;
        document.getElementById('exam-header').querySelector('h1').textContent = '2025 ICDC - Hospitality and Tourism';
        
        loadSavedProgress();
        showExamPage();
        renderQuestions();
        startTimer();
        updateProgressIndicator();
    }
});

// Start exam function
function startExam(examId) {
    examStarted = true;
    localStorage.setItem(EXAM_STARTED_KEY, 'true');
    localStorage.setItem('current_exam_id', examId);
    
    // Load ICDC exam
    examQuestions = examQuestions_ICDC_HT;
    timeRemaining = 70 * 60; // 70 minutes
    document.getElementById('exam-header').querySelector('h1').textContent = '2025 ICDC - Hospitality and Tourism';
    
    showExamPage();
    renderQuestions();
    startTimer();
    updateProgressIndicator();
}

// Show exam page and hide landing
function showExamPage() {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('exam-header').style.display = 'block';
    document.getElementById('exam-section').style.display = 'block';
    examStarted = true;
}

// Auto-save functionality
function saveProgress() {
    if (!examSubmitted) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userAnswers));
        localStorage.setItem(TIME_STORAGE_KEY, timeRemaining.toString());
    }
}

function loadSavedProgress() {
    const savedAnswers = localStorage.getItem(STORAGE_KEY);
    const savedTime = localStorage.getItem(TIME_STORAGE_KEY);
    
    if (savedAnswers) {
        userAnswers = JSON.parse(savedAnswers);
    }
    
    if (savedTime) {
        timeRemaining = parseInt(savedTime);
    }
}

function clearSavedProgress() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIME_STORAGE_KEY);
}

// Update progress indicator
function updateProgressIndicator() {
    const answeredCount = Object.keys(userAnswers).length;
    const totalCount = examQuestions.length;
    const percentage = (answeredCount / totalCount) * 100;
    
    document.getElementById('answered-count').textContent = answeredCount;
    document.getElementById('total-count').textContent = totalCount;
    document.getElementById('progress-bar').style.width = `${percentage}%`;
    
    // Update floating header
    document.getElementById('floating-answered-count').textContent = answeredCount;
    document.getElementById('floating-total-count').textContent = totalCount;
    document.getElementById('floating-progress-bar').style.width = `${percentage}%`;
}

// Render all questions
function renderQuestions() {
    const form = document.getElementById('exam-form');
    
    examQuestions.forEach((q, index) => {
        const questionBlock = document.createElement('div');
        questionBlock.className = 'question-block';
        questionBlock.id = `question-${q.number}`;
        
        let optionsHTML = '';
        q.options.forEach((option, optionIndex) => {
            optionsHTML += `
                <label class="option-label">
                    <input type="radio" name="question-${q.number}" value="${optionIndex}" />
                    <span>${String.fromCharCode(65 + optionIndex)}. ${option}</span>
                </label>
            `;
        });
        
        questionBlock.innerHTML = `
            <div class="question-number">Question ${q.number}</div>
            <div class="question-text">${q.question}</div>
            <div class="options">
                ${optionsHTML}
            </div>
        `;
        
        form.appendChild(questionBlock);
    });
    
    // Restore saved answers
    Object.keys(userAnswers).forEach(questionNumber => {
        const radio = document.querySelector(`input[name="question-${questionNumber}"][value="${userAnswers[questionNumber]}"]`);
        if (radio) {
            radio.checked = true;
            // Add visual indicator
            const questionBlock = document.getElementById(`question-${questionNumber}`);
            if (questionBlock) {
                questionBlock.classList.add('answered');
            }
        }
    });
}

// Timer functionality
function startTimer() {
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        // Warning when 5 minutes remaining
        if (timeRemaining === 5 * 60) {
            document.getElementById('timer').classList.add('warning');
            alert('5 minutes remaining!');
        }
        
        // Auto-submit when time is up
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            alert('Time is up! Your exam will be submitted automatically.');
            submitExam();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer').textContent = display;
    document.getElementById('floating-timer').textContent = display;
    
    // Add warning class to floating timer too
    if (timeRemaining <= 5 * 60) {
        document.getElementById('floating-timer').classList.add('warning');
    }
}

// Event listeners
function setupEventListeners() {
    // Track answers
    document.getElementById('exam-form').addEventListener('change', function(e) {
        if (e.target.type === 'radio') {
            const questionNumber = e.target.name.split('-')[1];
            userAnswers[questionNumber] = parseInt(e.target.value);
            
            // Save progress and update indicator
            saveProgress();
            updateProgressIndicator();
            
            // Add visual feedback
            const questionBlock = document.getElementById(`question-${questionNumber}`);
            if (questionBlock) {
                questionBlock.classList.add('answered');
            }
        }
    });
    
    // Submit button
    document.getElementById('submit-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to submit your exam? You cannot change your answers after submission.')) {
            submitExam();
        }
    });
    
    // Floating submit button
    document.getElementById('floating-submit-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to submit your exam? You cannot change your answers after submission.')) {
            submitExam();
        }
    });
    
    // Exit buttons
    document.getElementById('exit-btn').addEventListener('click', function() {
        exitExam();
    });
    
    document.getElementById('floating-exit-btn').addEventListener('click', function() {
        exitExam();
    });
    
    document.getElementById('exit-btn-header').addEventListener('click', function() {
        exitExam();
    });
    
    // Restart button
    document.getElementById('restart-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to retake the exam? This will reset all your answers.')) {
            restartExam();
        }
    });
    
    // Scroll to top button and floating header
    const scrollBtn = document.getElementById('scroll-to-top');
    const floatingHeader = document.getElementById('floating-header');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        
        // Show floating header after scrolling past main header (around 250px)
        if (scrolled > 250 && examStarted && !examSubmitted) {
            floatingHeader.classList.add('visible');
        } else {
            floatingHeader.classList.remove('visible');
        }
        
        // Show scroll to top button
        if (scrolled > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
    
    scrollBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S to save (provide feedback)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveProgress();
            showNotification('Progress saved!');
        }
        
        // Ctrl/Cmd + Enter to submit (when not in results)
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !examSubmitted) {
            e.preventDefault();
            document.getElementById('submit-btn').click();
        }
    });
}

// Show temporary notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Exit exam and return to landing
function exitExam() {
    const answeredCount = Object.keys(userAnswers).length;
    let message = 'Are you sure you want to exit? All your progress will be deleted.';
    
    if (answeredCount > 0) {
        message = `You have answered ${answeredCount} question${answeredCount !== 1 ? 's' : ''}. All your progress will be deleted and cannot be recovered.`;
    }
    
    if (confirm(message)) {
        // Clear all progress (instead of saving)
        clearSavedProgress();
        localStorage.removeItem(EXAM_STARTED_KEY);
        
        // Reset state
        userAnswers = {};
        timeRemaining = 70 * 60;
        examSubmitted = false;
        examStarted = false;
        
        // Stop timer
        clearInterval(timerInterval);
        
        // Hide exam sections and floating header
        document.getElementById('exam-header').style.display = 'none';
        document.getElementById('exam-section').style.display = 'none';
        document.getElementById('floating-header').classList.remove('visible');
        
        // Show landing page
        document.getElementById('landing-page').style.display = 'block';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Submit and grade exam
function submitExam() {
    if (examSubmitted) return;
    
    examSubmitted = true;
    examStarted = false;
    clearInterval(timerInterval);
    clearSavedProgress();
    localStorage.removeItem(EXAM_STARTED_KEY);
    
    // Calculate score
    let correctCount = 0;
    const results = [];
    
    examQuestions.forEach(q => {
        const userAnswer = userAnswers[q.number];
        const isCorrect = userAnswer === q.correctAnswer;
        
        if (isCorrect) {
            correctCount++;
        }
        
        results.push({
            number: q.number,
            question: q.question,
            userAnswer: userAnswer,
            correctAnswer: q.correctAnswer,
            isCorrect: isCorrect,
            options: q.options
        });
    });
    
    const percentage = Math.round((correctCount / examQuestions.length) * 100);
    const passed = percentage >= 70;
    
    // Display results
    displayResults(correctCount, percentage, passed, results);
}

// Display results section
function displayResults(correctCount, percentage, passed, results) {
    // Hide exam section
    document.getElementById('exam-section').style.display = 'none';
    
    // Show results section
    const resultsSection = document.getElementById('results-section');
    resultsSection.style.display = 'block';
    
    // Update score display
    document.getElementById('score-percentage').textContent = `${percentage}%`;
    document.getElementById('score-text').textContent = `${correctCount}/${examQuestions.length}`;
    
    const passStatus = document.getElementById('pass-status');
    if (passed) {
        passStatus.innerHTML = '<span style="color: #2ecc71; font-weight: bold;">✓ PASSED</span>';
    } else {
        passStatus.innerHTML = '<span style="color: #e74c3c; font-weight: bold;">✗ FAILED</span>';
    }
    
    // Display detailed results
    displayDetailedResults(results);
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Display detailed question-by-question results
function displayDetailedResults(results) {
    const container = document.getElementById('question-results');
    container.innerHTML = '';
    
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${result.isCorrect ? 'correct-answer' : 'wrong-answer'}`;
        
        const statusBadge = result.isCorrect 
            ? '<span class="result-status correct">✓ Correct</span>'
            : '<span class="result-status incorrect">✗ Incorrect</span>';
        
        const userAnswerLetter = result.userAnswer !== undefined 
            ? String.fromCharCode(65 + result.userAnswer)
            : 'Not answered';
        const correctAnswerLetter = String.fromCharCode(65 + result.correctAnswer);
        
        const userAnswerText = result.userAnswer !== undefined
            ? result.options[result.userAnswer]
            : 'No answer selected';
        const correctAnswerText = result.options[result.correctAnswer];
        
        resultItem.innerHTML = `
            <div class="result-question">
                <strong>Question ${result.number}:</strong> ${result.question}
            </div>
            ${statusBadge}
            <div class="result-answer">
                <strong>Your answer:</strong> ${userAnswerLetter}. ${userAnswerText}
            </div>
            ${!result.isCorrect ? `
                <div class="result-answer" style="background: #d5f4e6; border-left: 3px solid #2ecc71;">
                    <strong>Correct answer:</strong> ${correctAnswerLetter}. ${correctAnswerText}
                </div>
            ` : ''}
        `;
        
        container.appendChild(resultItem);
    });
}

// Restart exam
function restartExam() {
    // Reset state
    timeRemaining = 70 * 60;
    userAnswers = {};
    examSubmitted = false;
    examStarted = false;
    clearSavedProgress();
    localStorage.removeItem(EXAM_STARTED_KEY);
    
    // Clear all radio buttons and answered indicators
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => radio.checked = false);
    
    const answeredBlocks = document.querySelectorAll('.question-block.answered');
    answeredBlocks.forEach(block => block.classList.remove('answered'));
    
    // Reset timer display
    document.getElementById('timer').classList.remove('warning');
    updateTimerDisplay();
    
    // Show landing page, hide exam and results
    document.getElementById('landing-page').style.display = 'block';
    document.getElementById('exam-header').style.display = 'none';
    document.getElementById('exam-section').style.display = 'none';
    document.getElementById('results-section').style.display = 'none';
    
    // Restart timer
    startTimer();
    
    // Update progress indicator
    updateProgressIndicator();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Warn before leaving page
window.addEventListener('beforeunload', function(e) {
    if (!examSubmitted && Object.keys(userAnswers).length > 0) {
        e.preventDefault();
        e.returnValue = 'You have unsaved answers. Are you sure you want to leave?';
        return e.returnValue;
    }
});
