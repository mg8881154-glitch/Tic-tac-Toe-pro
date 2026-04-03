let music = new Audio("music.mp3")
let Audioturn = new Audio("ting.mp3")
let gameover = new Audio("gameover.mp3")
let turn = "X"
let isgameover = false;
let confettiInterval = null;

// Confetti party effect
const launchConfetti = () => {
    const colors = ["#667eea", "#764ba2", "#f9ca24", "#f0932b", "#eb4d4b", "#6ab04c", "#22a6b3"];
    const confettiCount = 150;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti-piece");
        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 2 + 1.5) + "s";
        confetti.style.animationDelay = (Math.random() * 1.5) + "s";
        confetti.style.width = (Math.random() * 8 + 6) + "px";
        confetti.style.height = (Math.random() * 8 + 6) + "px";
        confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
        document.body.appendChild(confetti);
        confetti.addEventListener("animationend", () => confetti.remove());
    }
}

const stopConfetti = () => {
    if (confettiInterval) {
        clearInterval(confettiInterval);
        confettiInterval = null;
    }
    document.querySelectorAll(".confetti-piece").forEach(el => el.remove());
}

const startParty = () => {
    launchConfetti();
    confettiInterval = setInterval(launchConfetti, 2000);
}

// Start background music on first user interaction
document.addEventListener("click", () => {
    if (music.paused) {
        music.loop = true;
        music.volume = 0.3;
        music.play().catch(() => {});
    }
}, { once: true });

// Function to change the turn
const changeTurn = () => {
    return turn === "X" ? "0" : "X"
}

// Function to check win
const checkwin = () => {
    let boxtext = document.getElementsByClassName("boxtext");
    let wins = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6], // Fixed: was [2, 4, 8] (wrong diagonal)
    ]
    wins.forEach(e => {
        if (
            boxtext[e[0]].innerText === boxtext[e[1]].innerText &&
            boxtext[e[2]].innerText === boxtext[e[1]].innerText &&
            boxtext[e[0]].innerText !== ""
        ) {
            document.querySelector(".info").innerText = boxtext[e[0]].innerText + " Won!" // Fixed: added space
            isgameover = true;
            gameover.play();
            startParty(); // 🎉 Party on win!
            document.querySelector(".imgbox").getElementsByTagName("img")[0].style.width = "200px"
        }
    })

    // Fixed: Draw condition
    if (!isgameover) {
        let allFilled = Array.from(boxtext).every(box => box.innerText !== "");
        if (allFilled) {
            document.querySelector(".info").innerText = "It's a Draw!";
            isgameover = true;
            gameover.play();
        }
    }
}

// Game Logic
let boxes = document.getElementsByClassName("box");
Array.from(boxes).forEach(element => {
    let boxtext = element.querySelector(".boxtext");
    element.addEventListener("click", () => {
        // Fixed: block clicks after game over
        if (boxtext.innerText === '' && !isgameover) {
            boxtext.innerText = turn;
            turn = changeTurn();
            Audioturn.play();
            checkwin();
            if (!isgameover) {
                document.getElementsByClassName("info")[0].innerText = "Turn for " + turn;
            }
        }
    })
})

// Add onclick reset 
reset.addEventListener("click", () => {
    let boxtext = document.querySelectorAll(".boxtext");
    Array.from(boxtext).forEach(element => {
        element.innerText = ""
    });
    turn = "X";
    isgameover = false;
    stopConfetti(); // stop party on reset
    document.getElementsByClassName("info")[0].innerText = "Turn for " + turn;
    document.querySelector(".imgbox").getElementsByTagName("img")[0].style.width = "0px"
})