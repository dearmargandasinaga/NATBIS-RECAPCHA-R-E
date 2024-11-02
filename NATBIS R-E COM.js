const mouseDirections = ['kiri', 'kanan', 'atas', 'bawah'];

let currentWords = [];
let currentMouseDirection = '';
let mouseDirectionIndex = 0;
let isTextVerified = false;
let isMouseVerified = false;

const challengeText = document.getElementById('challengeText');
const userInput = document.getElementById('userInput');
const verifyButton = document.getElementById('verifyButton');
const message = document.getElementById('message');
const mouseArea = document.getElementById('mouseArea');
const mouseInstructions = document.getElementById('mouseInstructions');
const captchaCanvas = document.getElementById('captchaCanvas');
const ctx = captchaCanvas.getContext('2d');
const refreshButton = document.getElementById('refreshButton');
const loadingOverlay = document.getElementById('loadingOverlay');
const timeDisplay = document.getElementById('timeDisplay');

async function fetchRandomWords(count = 3) {
    try {
        const response = await fetch(`https://random-word-api.herokuapp.com/word?number=${count}`);
        if (!response.ok) {
            throw new Error('Failed to fetch random words');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching random words:', error);
        // Fallback to predefined words if API fails
        return ['verifikasi', 'manusia', 'natbis','number dfghjt','eldran sandrargh hjoenz'];
    }
}

async function setRandomWords() {
    currentWords = await fetchRandomWords();
    challengeText.textContent = currentWords.join(' ');
}

function setNextMouseDirection() {
    currentMouseDirection = mouseDirections[Math.floor(Math.random() * mouseDirections.length)];
    mouseInstructions.textContent = `Gerakkan mouse ke ${currentMouseDirection}`;
}

function drawNoise() {
    const w = captchaCanvas.width;
    const h = captchaCanvas.height;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < w; i += 4) {
        for (let j = 0; j < h; j += 4) {
            ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.1)`;
            ctx.fillRect(i, j, 4, 4);
        }
    }
}

function updateVerifyButton() {
    verifyButton.disabled = !(isTextVerified && isMouseVerified);
}

async function verifyInput() {
    loadingOverlay.style.display = 'flex';
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    if (isTextVerified && isMouseVerified) {
        message.textContent = 'Verifikasi berhasil! Anda adalah manusia.';
        message.style.color = 'green';
        userInput.style.borderColor = 'green';
    } else {
        message.textContent = 'Verifikasi gagal. Silakan coba lagi.';
        message.style.color = 'red';
        userInput.style.borderColor = 'red';
        document.querySelector('.captcha-box').classList.add('shake');
        setTimeout(() => {
            document.querySelector('.captcha-box').classList.remove('shake');
        }, 500);
        resetVerification();
    }
    
    loadingOverlay.style.display = 'none';
}

async function resetVerification() {
    await setRandomWords();
    setNextMouseDirection();
    mouseDirectionIndex = 0;
    isTextVerified = false;
    isMouseVerified = false;
    userInput.value = '';
    drawNoise();
    updateVerifyButton();
}

function handleMouseMove(e) {
    const rect = mouseArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    let detectedDirection;
    if (x < 10) detectedDirection = 'kiri';
    else if (x > rect.width - 10) detectedDirection = 'kanan';
    else if (y < 10) detectedDirection = 'atas';
    else if (y > rect.height - 10) detectedDirection = 'bawah';
    
    if (detectedDirection === currentMouseDirection) {
        mouseDirectionIndex++;
        if (mouseDirectionIndex >= 4) {
            isMouseVerified = true;
            mouseInstructions.textContent = 'Verifikasi gerakan mouse berhasil!';
            mouseArea.removeEventListener('mousemove', handleMouseMove);
        } else {
            setNextMouseDirection();
        }
        updateVerifyButton();
    }
}

async function initializeCaptcha() {
    await setRandomWords();
    setNextMouseDirection();
    drawNoise();
}

function updateTime() {
    const now = new Date();
    const serverTime = now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const gmtTime = now.toUTCString();
    timeDisplay.textContent = `Server: ${serverTime} | GMT: ${gmtTime}`;
}

userInput.addEventListener('input', () => {
    const inputWords = userInput.value.toLowerCase().split(' ');
    isTextVerified = currentWords.every((word, index) => word.toLowerCase() === inputWords[index]);
    updateVerifyButton();
});

verifyButton.addEventListener('click', verifyInput);
mouseArea.addEventListener('mousemove', handleMouseMove);
refreshButton.addEventListener('click', resetVerification);

// Disable right-click
document.addEventListener('contextmenu', event => event.preventDefault());

// Disable Ctrl+U
document.onkeydown = function(e) {
    if (e.ctrlKey && e.keyCode == 85) {
        return false;
    }
};

// Initialize the CAPTCHA
initializeCaptcha();

// Update time every second
setInterval(updateTime, 1000);

// Redraw noise periodically
setInterval(drawNoise, 5000);