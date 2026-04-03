// --- Audio ---
let music = new Audio("music.mp3");
let Audioturn = new Audio("ting.mp3");
let gameover = new Audio("gameover.mp3");
let isMuted = false;

const playSound = (audio) => { if (!isMuted) { audio.currentTime = 0; audio.play().catch(() => {}); } };

document.addEventListener("click", () => {
    if (music.paused && !isMuted) { music.loop = true; music.volume = 0.3; music.play().catch(() => {}); }
}, { once: true });

document.getElementById("muteBtn").addEventListener("click", () => {
    isMuted = !isMuted;
    music.muted = isMuted;
    document.getElementById("muteBtn").textContent = isMuted ? "🔇 Muted" : "🔊 Sound";
});

// --- Dark Mode ---
document.getElementById("darkToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    document.getElementById("darkToggle").textContent =
        document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// --- Game State ---
let turn = "X";
let isgameover = false;
let isAI = false;
let confettiInterval = null;
let moveHistory = []; // [{index, player}]
let scores = { X: 0, O: 0, draw: 0 };
let playerNames = { X: "Player X", O: "Player O" };

// --- Name Modal ---
const nameModal = document.getElementById("nameModal");

const startGame = (ai) => {
    isAI = ai;
    const p1 = document.getElementById("player1Name").value.trim() || "Player X";
    const p2 = ai ? "Computer 🤖" : (document.getElementById("player2Name").value.trim() || "Player O");
    playerNames.X = p1;
    playerNames.O = p2;
    document.getElementById("nameX").textContent = p1;
    document.getElementById("nameO").textContent = p2;
    if (ai) document.getElementById("player2Name").disabled = true;
    nameModal.style.display = "none";
    resetGame();
};

document.getElementById("vsHuman").addEventListener("click", () => startGame(false));
document.getElementById("vsAI").addEventListener("click", () => startGame(true));

// --- Confetti ---
const launchConfetti = () => {
    const colors = ["#667eea", "#764ba2", "#f9ca24", "#f0932b", "#eb4d4b", "#6ab04c", "#22a6b3"];
    for (let i = 0; i < 150; i++) {
        const c = document.createElement("div");
        c.classList.add("confetti-piece");
        c.style.left = Math.random() * 100 + "vw";
        c.style.background = colors[Math.floor(Math.random() * colors.length)];
        c.style.animationDuration = (Math.random() * 2 + 1.5) + "s";
        c.style.animationDelay = (Math.random() * 1.5) + "s";
        c.style.width = (Math.random() * 8 + 6) + "px";
        c.style.height = (Math.random() * 8 + 6) + "px";
        c.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
        document.body.appendChild(c);
        c.addEventListener("animationend", () => c.remove());
    }
};
const stopConfetti = () => { clearInterval(confettiInterval); confettiInterval = null; document.querySelectorAll(".confetti-piece").forEach(el => el.remove()); };
const startParty = () => { launchConfetti(); confettiInterval = setInterval(launchConfetti, 2000); };

// --- Win Check ---
const winCombos = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

const checkWin = () => {
    const boxes = document.querySelectorAll(".boxtext");
    for (let combo of winCombos) {
        const [a, b, c] = combo;
        if (boxes[a].innerText && boxes[a].innerText === boxes[b].innerText && boxes[a].innerText === boxes[c].innerText) {
            // Highlight winning cells
            [a, b, c].forEach(i => boxes[i].parentElement.classList.add("winner-cell"));
            const winner = boxes[a].innerText;
            document.querySelector(".info").innerText = `🏆 ${playerNames[winner]} Won!`;
            isgameover = true;
            scores[winner]++;
            updateScoreboard();
            playSound(gameover);
            startParty();
            document.querySelector(".imgbox img").style.width = "200px";
            document.querySelector(".sad-emoji").style.fontSize = "80px";
            return;
        }
    }
    // Draw
    if ([...boxes].every(b => b.innerText !== "")) {
        document.querySelector(".info").innerText = "🤝 It's a Draw!";
        isgameover = true;
        scores.draw++;
        updateScoreboard();
        playSound(gameover);
    }
};

const updateScoreboard = () => {
    document.getElementById("scoreXval").textContent = scores.X;
    document.getElementById("scoreOval").textContent = scores.O;
    document.getElementById("scoreDrawval").textContent = scores.draw;
};

// --- AI (Minimax) ---
const getBoardState = () => [...document.querySelectorAll(".boxtext")].map(b => b.innerText || "");

const minimax = (board, isMaximizing) => {
    for (let combo of winCombos) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a] === "0" ? 10 : -10;
        }
    }
    if (board.every(cell => cell !== "")) return 0;

    if (isMaximizing) {
        let best = -Infinity;
        board.forEach((cell, i) => {
            if (cell === "") {
                board[i] = "0";
                best = Math.max(best, minimax(board, false));
                board[i] = "";
            }
        });
        return best;
    } else {
        let best = Infinity;
        board.forEach((cell, i) => {
            if (cell === "") {
                board[i] = "X";
                best = Math.min(best, minimax(board, true));
                board[i] = "";
            }
        });
        return best;
    }
};

const aiMove = () => {
    const board = getBoardState();
    let bestVal = -Infinity, bestMove = -1;
    board.forEach((cell, i) => {
        if (cell === "") {
            board[i] = "0";
            const val = minimax(board, false);
            board[i] = "";
            if (val > bestVal) { bestVal = val; bestMove = i; }
        }
    });
    if (bestMove !== -1) {
        const boxes = document.querySelectorAll(".box");
        const boxtext = boxes[bestMove].querySelector(".boxtext");
        boxtext.innerText = "0";
        boxes[bestMove].classList.add("ai-move");
        moveHistory.push({ index: bestMove, player: "0" });
        turn = "X";
        playSound(Audioturn);
        checkWin();
        if (!isgameover) document.querySelector(".info").innerText = `Turn for ${playerNames[turn]}`;
    }
};

// --- Game Logic ---
const boxes = document.querySelectorAll(".box");
boxes.forEach((element, idx) => {
    const boxtext = element.querySelector(".boxtext");
    element.addEventListener("click", () => {
        if (boxtext.innerText === "" && !isgameover && !(isAI && turn === "0")) {
            boxtext.innerText = turn;
            element.classList.remove("ai-move");
            moveHistory.push({ index: idx, player: turn });
            turn = turn === "X" ? "0" : "X";
            playSound(Audioturn);
            checkWin();
            if (!isgameover) {
                document.querySelector(".info").innerText = `Turn for ${playerNames[turn]}`;
                if (isAI && turn === "0") setTimeout(aiMove, 400);
            }
        }
    });
});

// --- Undo ---
document.getElementById("undoBtn").addEventListener("click", () => {
    if (isgameover || moveHistory.length === 0) return;
    const last = moveHistory.pop();
    document.querySelectorAll(".box")[last.index].querySelector(".boxtext").innerText = "";
    // If AI mode, undo AI move too
    if (isAI && moveHistory.length > 0 && moveHistory[moveHistory.length - 1].player === "0") {
        const aiLast = moveHistory.pop();
        document.querySelectorAll(".box")[aiLast.index].querySelector(".boxtext").innerText = "";
    }
    turn = last.player;
    document.querySelector(".info").innerText = `Turn for ${playerNames[turn]}`;
});

// --- Reset ---
const resetGame = () => {
    document.querySelectorAll(".boxtext").forEach(el => { el.innerText = ""; });
    document.querySelectorAll(".box").forEach(el => el.classList.remove("winner-cell", "ai-move"));
    turn = "X";
    isgameover = false;
    moveHistory = [];
    stopConfetti();
    document.querySelector(".info").innerText = `Turn for ${playerNames["X"]}`;
    document.querySelector(".imgbox img").style.width = "0px";
    document.querySelector(".sad-emoji").style.fontSize = "0px";
};

document.getElementById("reset").addEventListener("click", resetGame);
