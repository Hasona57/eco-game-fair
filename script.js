// Countdown Timer
const eventDate = new Date("March 30, 2025 00:00:00").getTime();
function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate - now;
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    document.getElementById("timer").innerText = `${hours}:${minutes}:${seconds}`;
    if (distance < 0) {
        clearInterval(countdownInterval);
        document.getElementById("timer").innerText = "Event Started!";
    }
}
const countdownInterval = setInterval(updateCountdown, 1000);

// Leaderboard Logic
function updateLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const list = document.getElementById('leaderboardList');
    list.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `#${index + 1} ${entry.name} — ${entry.score} pts`;
        list.appendChild(li);
    });
}
updateLeaderboard();

// Social Sharing
document.querySelectorAll('.social-button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const url = window.location.href;
        const text = "Join the Eco-Game Fair and compete to save the planet! 🌍🎮";
        if (button.querySelector('.fa-twitter')) {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        } else if (button.querySelector('.fa-facebook')) {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        } else if (button.querySelector('.fa-linkedin')) {
            window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`, '_blank');
        }
    });
});

// Game Setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = { x: 100, y: 100, size: 30, speed: 4 };
const keys = { w: false, a: false, s: false, d: false };

const booths = [
    { x: 150, y: 150, color: "skyblue", label: "Climate Change", link: "games/climate.html" },
    { x: 650, y: 150, color: "lightcoral", label: "Eco Shopping", link: "games/shopping.html" },
    { x: 150, y: 400, color: "gold", label: "Green Home", link: "games/home.html" },
    { x: 400, y: 400, color: "violet", label: "Transportation", link: "games/transport.html" },
    { x: 650, y: 400, color: "lightpink", label: "Wildlife", link: "games/wildlife.html" }
];

// Player Movement
document.addEventListener("keydown", (e) => { if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true; });
document.addEventListener("keyup", (e) => { if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; });

// E key for interaction
document.addEventListener("keypress", (e) => {
    if (e.key.toLowerCase() === "e") {
        booths.forEach(booth => {
            if (Math.abs(player.x - booth.x) < 50 && Math.abs(player.y - booth.y) < 50) {
                window.location.href = booth.link;
            }
        });
    }
});

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

booths.forEach(booth => {
    const nearPlayer = Math.abs(player.x - booth.x) < 60 && Math.abs(player.y - booth.y) < 60;
    drawBooth(booth.x, booth.y, booth.color, booth.label, nearPlayer);
});

function drawBooth(x, y, color, label, nearPlayer = false) {
    const gradient = ctx.createLinearGradient(x - 40, y - 40, x + 40, y + 40);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "white");
    
    ctx.fillStyle = gradient;
    ctx.shadowColor = color;
    ctx.shadowBlur = nearPlayer ? 40 : 20;
    ctx.fillRect(x - 40, y - 40, 80, 80);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.font = nearPlayer ? "bold 15px Arial" : "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(label, x, y + 60);
}

    // Draw player
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
    ctx.fillStyle = "darkblue";
    ctx.fill();
    ctx.closePath();

    movePlayer();
    requestAnimationFrame(drawGame);
}

function movePlayer() {
    if (keys.w && player.y > player.size / 2) player.y -= player.speed;
    if (keys.s && player.y < canvas.height - player.size / 2) player.y += player.speed;
    if (keys.a && player.x > player.size / 2) player.x -= player.speed;
    if (keys.d && player.x < canvas.width - player.size / 2) player.x += player.speed;
}

drawGame();
function submitToLeaderboard(gameScore) {
    const playerName = localStorage.getItem('playerName');
    if (!playerName) return;

    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name: playerName, score: gameScore });

    // Sort and keep only top 10
    leaderboard = leaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}
function aggregateAndSaveLeaderboard() {
    const playerName = localStorage.getItem('playerName');
    if (!playerName) return;

    const userId = playerName.replace(/\s+/g, '_').toLowerCase();
    const climateScore = Number(localStorage.getItem(`quizScore_${userId}`)) || 0;
    const wasteScore = Number(localStorage.getItem('wasteGameScore')) || 0;
    const ecoScore = Number(localStorage.getItem('ecoScore')) || 0;
    const homeScore = Number(localStorage.getItem('homeGameSubmitted') === 'true' ? 600 : 0); // assuming full completion = 600
    const airScore = Number(localStorage.getItem('airPollutionScore')) || 0;
    const wildlifeScore = Number(localStorage.getItem('wildlifeScore')) || 0;

    const totalScore = climateScore + wasteScore + ecoScore + homeScore + airScore + wildlifeScore;

    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const existing = leaderboard.find(e => e.name === playerName);

    if (existing) {
        existing.score = Math.max(existing.score, totalScore);
    } else {
        leaderboard.push({ name: playerName, score: totalScore });
    }

    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);

    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    updateLeaderboard();
}

// Call aggregation every time index.html loads
aggregateAndSaveLeaderboard();

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD7-5ModW1PfFCw63Sbhxu9dG3Plaa4l6M",
  authDomain: "alzaguardian.firebaseapp.com",
  databaseURL: "https://alzaguardian-default-rtdb.firebaseio.com/",
  projectId: "alzaguardian",
  storageBucket: "alzaguardian.appspot.com",
  messagingSenderId: "1062212822301",
  appId: "1:1062212822301:web:42f75e5c12673df0427fcd"
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ✅ Function to submit score from anywhere in your game
function submitScoreToFirebase(playerName, playerScore) {
  if (playerName.trim() === '' || isNaN(playerScore)) {
    console.error("Invalid player data");
    return;
  }

  const newEntry = database.ref('leaderboard').push();
  newEntry.set({
    name: playerName,
    score: playerScore
  }).catch((error) => {
    console.error("Error submitting score:", error);
  });
}

// ✅ Load leaderboard dynamically from Firebase
function loadLeaderboard() {
  database.ref('leaderboard').on('value', (snapshot) => {
    const data = snapshot.val();
    const leaderboard = [];

    for (let key in data) {
      leaderboard.push({ name: data[key].name, score: data[key].score });
    }

    // Sort leaderboard by descending score
    leaderboard.sort((a, b) => b.score - a.score);

    // Update your leaderboard element (make sure <ul id="leaderboard"> exists in HTML)
    const leaderboardList = document.getElementById('leaderboard');
    if (leaderboardList) {
      leaderboardList.innerHTML = '';
      leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${entry.name} - ${entry.score}`;
        leaderboardList.appendChild(li);
      });
    }
  });
}

// ✅ Load leaderboard on page load without HTML changes
window.onload = loadLeaderboard;

