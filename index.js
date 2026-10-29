//Dice roller program
/* ========================================
   1. DOM ELEMENTS
======================================== */

const diceStage = document.getElementById("diceStage");
const diceCount = document.getElementById("diceCount");
const diceCountDisplay = document.getElementById("diceCountDisplay");

const decreaseDiceButton = document.getElementById("decreaseDice");
const increaseDiceButton = document.getElementById("increaseDice");
const rollButton = document.getElementById("rollButton");

const totalResult = document.getElementById("totalResult");
const lastRollResult = document.getElementById("lastRollResult");
const rollMessage = document.getElementById("rollMessage");

const historyList = document.getElementById("historyList");
const emptyHistory = document.getElementById("emptyHistory");
const clearHistoryButton = document.getElementById("clearHistoryButton");


/* ========================================
   2. APPLICATION STATE
======================================== */

const MIN_DICE = 1;
const MAX_DICE = 6;
const MIN_DIE_VALUE = 1;
const MAX_DIE_VALUE = 6;

let rollCount = 0;
let isRolling = false;
let rollHistory = [];


/* ========================================
   3. CREATE A DIE
======================================== */

// Each value maps to the grid positions of its pips.
const diceFaces = {
    1: ["pip-center"],
    2: ["pip-top-left", "pip-bottom-right"],
    3: ["pip-top-left", "pip-center", "pip-bottom-right"],
    4: [
        "pip-top-left",
        "pip-top-right",
        "pip-bottom-left",
        "pip-bottom-right"
    ],
    5: [
        "pip-top-left",
        "pip-top-right",
        "pip-center",
        "pip-bottom-left",
        "pip-bottom-right"
    ],
    6: [
        "pip-top-left",
        "pip-top-right",
        "pip-middle-left",
        "pip-middle-right",
        "pip-bottom-left",
        "pip-bottom-right"
    ]
};

function createDie(value, index) {
    const die = document.createElement("div");
    die.className = "die";
    die.dataset.dieIndex = index;
    die.setAttribute("role", "img");
    die.setAttribute("aria-label", `Die ${index + 1}: ${value}`);

    const face = document.createElement("span");
    face.className = "die-face";
    face.setAttribute("aria-hidden", "true");

    diceFaces[value].forEach((position) => {
        const pip = document.createElement("span");
        pip.className = `pip ${position}`;
        face.appendChild(pip);
    });

    die.appendChild(face);

    return die;
}


/* ========================================
   4. GENERATE DICE VALUES
======================================== */

// Generate an integer between min and max, inclusive.
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDiceValues(count) {
    return Array.from(
        { length: count },
        () => randomInteger(MIN_DIE_VALUE, MAX_DIE_VALUE)
    );
}


/* ========================================
   5. UPDATE DICE DISPLAY
======================================== */

function renderDice(values) {
    const fragment = document.createDocumentFragment();

    values.forEach((value, index) => {
        fragment.appendChild(createDie(value, index));
    });

    diceStage.replaceChildren(fragment);
}

function updateDiceCountControls() {
    const count = Number(diceCount.value);

    diceCountDisplay.textContent = count;
    decreaseDiceButton.disabled = count <= MIN_DICE;
    increaseDiceButton.disabled = count >= MAX_DICE;
}

function changeDiceCount(change) {
    if (isRolling) {
        return;
    }

    const currentCount = Number(diceCount.value);
    const newCount = Math.min(
        MAX_DICE,
        Math.max(MIN_DICE, currentCount + change)
    );

    diceCount.value = newCount;

    updateDiceCountControls();

    const initialValues = Array(newCount).fill(1);

    renderDice(initialValues);

    totalResult.textContent = "—";
    lastRollResult.textContent = "Waiting for fate";
    rollMessage.textContent = `${newCount} ${newCount === 1 ? "die" : "dice"} selected. Ready to roll.`;
}


/* ========================================
   6. ROLL ANIMATION
======================================== */

function animateDice() {
    const dice = diceStage.querySelectorAll(".die");

    dice.forEach((die, index) => {
        // Restart the animation even if the die was rolled before.
        die.classList.remove("is-rolling");
        void die.offsetWidth;

        die.style.animationDelay = `${index * 70}ms`;
        die.classList.add("is-rolling");
    });

    return 650 + Math.max(0, dice.length - 1) * 70;
}


/* ========================================
   7. ROLL THE DICE
======================================== */

function rollDice() {
    if (isRolling) {
        return;
    }

    isRolling = true;
    rollButton.disabled = true;
    decreaseDiceButton.disabled = true;
    increaseDiceButton.disabled = true;

    rollMessage.textContent = "Rolling the dice...";

    const count = Number(diceCount.value);
    const values = generateDiceValues(count);
    const total = values.reduce((sum, value) => sum + value, 0);

    // Show the dice before starting their animation.
    renderDice(values);

    const animationDuration = animateDice();

    window.setTimeout(() => {
        totalResult.textContent = total;
        lastRollResult.textContent = values.join(" · ");

        rollCount += 1;

        const roll = {
            number: rollCount,
            values,
            total,
            time: new Date()
        };

        rollHistory.unshift(roll);

        renderHistory();

        rollMessage.textContent =
            `Roll ${rollCount}: ${values.join(", ")}. Total: ${total}.`;

        isRolling = false;
        rollButton.disabled = false;

        updateDiceCountControls();
    }, animationDuration);
}


/* ========================================
   8. ROLL HISTORY
======================================== */

function renderHistory() {
    historyList.replaceChildren();

    if (rollHistory.length === 0) {
        historyList.appendChild(emptyHistory);
        clearHistoryButton.disabled = true;
        return;
    }

    clearHistoryButton.disabled = false;

    rollHistory.forEach((roll) => {
        const entry = document.createElement("article");
        entry.className = "history-entry";

        const number = document.createElement("span");
        number.className = "history-number";
        number.textContent = roll.number;
        number.setAttribute("aria-label", `Roll number ${roll.number}`);

        const details = document.createElement("div");
        details.className = "history-details";

        const title = document.createElement("p");
        title.className = "history-title";
        title.textContent =
            `${roll.values.length} ${roll.values.length === 1 ? "die" : "dice"} rolled`;

        const time = document.createElement("p");
        time.className = "history-time";
        time.textContent = roll.time.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        details.append(title, time);

        const total = document.createElement("strong");
        total.className = "history-total";
        total.textContent = roll.total;
        total.setAttribute("aria-label", `Total ${roll.total}`);

        entry.append(number, details, total);
        historyList.appendChild(entry);
    });
}

function clearHistory() {
    if (isRolling || rollHistory.length === 0) {
        return;
    }

    rollHistory = [];
    rollCount = 0;

    renderHistory();

    rollMessage.textContent = "Roll history cleared.";
}


/* ========================================
   9. EVENT LISTENERS
======================================== */

decreaseDiceButton.addEventListener("click", () => {
    changeDiceCount(-1);
});

increaseDiceButton.addEventListener("click", () => {
    changeDiceCount(1);
});

rollButton.addEventListener("click", rollDice);
clearHistoryButton.addEventListener("click", clearHistory);


/* ========================================
   10. INITIALIZE APPLICATION
======================================== */

renderDice([1, 1]);
updateDiceCountControls();
renderHistory();
