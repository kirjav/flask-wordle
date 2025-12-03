const MAX_ATTEMPTS = window.MAX_ATTEMPTS;
const WORD_LENGTH = window.WORD_LENGTH;

let attemptsRemaining = MAX_ATTEMPTS;
let currentGuessRow = 0;
let currentIndex = 0;

/*TODO:
1. Type via Keyboard
2. Fix backspace and enter
3. win stuff */

document.addEventListener("DOMContentLoaded", () => {
    const keyboardContainer = document.getElementById("keyboard");

    document.getElementById("submitGuess").addEventListener("click", () => {
        handleEnterClick();
    });

    document.getElementById("backspaceButton").addEventListener("click", () => {
        handleBackspaceClick();
    });


    const layout = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "ZXCVBNM"
    ];

    const guessContainer = document.getElementById("guessContainer");

    for (let row = 0; row < MAX_ATTEMPTS; row++) {
        const guessRowDiv = document.createElement("div");
        guessRowDiv.classList.add("guess-row");
        guessRowDiv.id = `row-${row}`;

        for (let col = 0; col < WORD_LENGTH; col++) {
            const letterDiv = document.createElement("div");
            letterDiv.classList.add("letter-guess-box");

            letterDiv.id = `tile-${row}-${col}`;

            guessRowDiv.appendChild(letterDiv);
        }

        guessContainer.appendChild(guessRowDiv);
    }


    const keyElements = {};

    layout.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("keyboard-row");

        row.split("").forEach(letter => {
            const btn = document.createElement("button");
            btn.textContent = letter;
            btn.classList.add("key");
            btn.dataset.letter = letter;

            keyElements[letter] = btn;

            btn.addEventListener("click", () => {
                handleLetterClick(letter);
            });

            rowDiv.appendChild(btn);
        });

        keyboardContainer.appendChild(rowDiv);
    });

    window.wordleKeys = keyElements;
});

const statePriority = {
    unused: 0,
    N: 1,
    M: 2,
    Y: 3
};

const letterState = {};

function updateKeyboardFromFeedback(guess, feedback) {

    for (let i = 0; i < guess.length; i++) {
        const letter = guess[i].toUpperCase();
        const newState = feedback[i]; // "Y", "M", "N"

        const currentState = letterState[letter] || "unused";

        if (statePriority[newState] > statePriority[currentState]) {
            letterState[letter] = newState;
            applyKeyState(letter, newState);
        }
    }
}

function applyKeyState(letter, state) {
    const key = window.wordleKeys[letter];
    if (!key) return;


    key.classList.remove("key-N", "key-M", "key-Y");

    if (state === "N") key.classList.add("key-N");
    if (state === "M") key.classList.add("key-M");
    if (state === "Y") key.classList.add("key-Y");
}

let currentGuess = Array(WORD_LENGTH).fill("");

function handleLetterClick(letter) {
    if (currentIndex < WORD_LENGTH) {
        addLetterToBoard(letter, currentIndex, currentGuessRow)
        currentGuess[currentIndex] = letter;
        currentIndex += 1;
        console.log(currentGuess);
    } else {
        console.log("Max letters reached: ", currentGuess);
    }
}

async function handleEnterClick() {
    if (currentIndex < WORD_LENGTH) {
        return;
    }

    const guessString = currentGuess.join("").toUpperCase();

    const response = await fetch("/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess: guessString })
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Server rejected guess:", data.error);
        return;
    }

    console.log(guessString)
    console.log(data.result)
    updateKeyboardFromFeedback(guessString, data.result);

    colorRow(currentGuessRow, data.result)

    if (data.isWin) {
        console.log("You win!");
        // Stuff happens.
        return;
    }

    currentGuessRow += 1
    currentIndex = 0
    currentGuess = Array(WORD_LENGTH).fill("");
}

function handleBackspaceClick() {
    // remove last letter guess
    if (currentIndex > 0) {
        currentIndex -= 1;
        removeLetterFromBoard(currentIndex, currentGuessRow)
        currentGuess[currentIndex] = "";

        console.log("Letter removed. Current guess", currentGuess);

        //also remove visual guess
    } else {
        console.log("Current guess is empty: ", currentGuess);
        // effectively do nothing
    }

}

function addLetterToBoard(letter, index, row) {
    const tile = document.getElementById(`tile-${row}-${index}`);
    tile.classList.add("filled");
    tile.textContent = letter.toUpperCase();
}

function removeLetterFromBoard(index, row) {
    const tile = document.getElementById(`tile-${row}-${index}`);
    tile.classList.remove("filled");
    tile.textContent = "";
}

function colorRow(rowIndex, feedbackArray) {
    for (let col = 0; col < WORD_LENGTH; col++) {
        const tile = document.getElementById(`tile-${rowIndex}-${col}`);
        let state = feedbackArray[col]
        if (state === "N") tile.classList.add("key-N");
        if (state === "M") tile.classList.add("key-M");
        if (state === "Y") tile.classList.add("key-Y");
    }
}
