/*
Retrieve a different set of Pokemon randomly from API
Ensure Pokemon can only be assigned to a single set of cards 
Easy, medium, and hard mode: different number of cards & time limit

Game end conditions: player wins = all cards matched, lose = timer runs out
Prevent cards from flipping and and show message when game ends

Restart game by clicking a difficulty and clicking start or the reset button

Display status header showing the number of clicks the user has made (does not on a card count?), 
the number of pairs left, the number of pairs matched, and total number of pairs

If the user clicks the same card twice do nothing
If the user clicks on a card that is already matched, do nothing
If the user clicks on a card while two cards are already flipped/ currently flipping, do nothing

Add different themes: dark/light

Add power up feature: up to me example: allow users to see cards for short time
*/

async function loadPokemon(mode = 3) {
  const randomIds = [];
  for (let i = 0; i < mode; i++) {
    randomIds.push(Math.floor(Math.random() * 1026) + 1);
  }

  const promises = [];
  for (let i = 0; i < randomIds.length; i++) {
    promises.push(
      fetch(`https://pokeapi.co/api/v2/pokemon/${randomIds[i]}`).then((r) =>
        r.json(),
      ),
    );
  }

  const pokemonList = await Promise.all(promises);

  const result = [];
  for (let i = 0; i < pokemonList.length; i++) {
    result.push({
      name: pokemonList[i].name,
      art_front_basic:
        pokemonList[i].sprites.other["official-artwork"].front_default,
      art_front_shiny:
        pokemonList[i].sprites.other["official-artwork"].front_shiny,
    });
    result.push({
      name: pokemonList[i].name,
      art_front_basic:
        pokemonList[i].sprites.other["official-artwork"].front_default,
      art_front_shiny:
        pokemonList[i].sprites.other["official-artwork"].front_shiny,
    });
  }
  return shuffleArray(result);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
  }
  return arr;
}

const EASY = 3;
const MEDIUM = 6;
const HARD = 9;
let selectedDifficulty = EASY;

const EASY_TIME = 60;
const MEDIUM_TIME = 120;
const HARD_TIME = 180;
let timeRemaining = EASY_TIME;
let timerInterval;
let lockBoard = false;

let totalClicks = 0;
let totalMatched = 0;
let totalUnmatched = EASY;
let totalPairs = EASY;

let isPeeking = false;
const PEEK_DURATION = 1000;

let currentTheme = "basic";

function peek() {
  if (lockBoard || isPeeking) return;

  isPeeking = true;
  lockBoard = true;

  const unmatched = document.querySelectorAll(".card:not(.flip)");

  unmatched.forEach((card) => card.classList.add("flip"));

  setTimeout(() => {
    unmatched.forEach((card) => card.classList.remove("flip"));

    isPeeking = false;
    lockBoard = false;
  }, PEEK_DURATION);
}

function createHeader() {
  const statsDiv = document.getElementById("stats");

  const totalClicksElement = document.createElement("h5");

  totalClicksElement.setAttribute("id", "stat_clicks");
  totalClicksElement.setAttribute("class", "stat_element");
  statsDiv.appendChild(totalClicksElement);

  const totalPairsElement = document.createElement("h5");

  totalPairsElement.setAttribute("id", "stat_pairs");
  totalPairsElement.setAttribute("class", "stat_element");
  statsDiv.appendChild(totalPairsElement);

  const totalMatchedElement = document.createElement("h5");

  totalMatchedElement.setAttribute("id", "stat_matched");
  totalMatchedElement.setAttribute("class", "stat_element");
  statsDiv.appendChild(totalMatchedElement);

  const totalUnmatchedElement = document.createElement("h5");

  totalUnmatchedElement.setAttribute("id", "stat_unmatched");
  totalUnmatchedElement.setAttribute("class", "stat_element");
  statsDiv.appendChild(totalUnmatchedElement);

  const timerElement = document.createElement("h5");
  timerElement.setAttribute("id", "stat_timer");
  timerElement.setAttribute("class", "stat_element");
  statsDiv.appendChild(timerElement);
}

function updateHeader() {
  document.getElementById("stat_clicks").innerHTML =
    `Total Clicks: ${totalClicks}`;
  document.getElementById("stat_pairs").innerHTML =
    `Total Pairs: ${totalPairs}`;
  document.getElementById("stat_matched").innerHTML =
    `Matched: ${totalMatched}`;
  document.getElementById("stat_unmatched").innerHTML =
    `Unmatched: ${totalUnmatched}`;
  document.getElementById("stat_timer").innerHTML = `Timer: ${timeRemaining}`;
}

function startTimer() {
  if (selectedDifficulty === EASY) timeRemaining = EASY_TIME;
  else if (selectedDifficulty === MEDIUM) timeRemaining = MEDIUM_TIME;
  else timeRemaining = HARD_TIME;

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateHeader();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      displayResult(false);
      lockBoard = true;
    }
  }, 1000);
}

async function displayCards(difficulty) {
  const gameGrid = document.getElementById("game_grid");
  // Reset grid
  gameGrid.innerHTML = "";

  const pokemon = await loadPokemon(difficulty);

  for (let i = 0; i < pokemon.length; i++) {
    const card = document.createElement("div");
    card.classList.add("card");

    const frontFace = document.createElement("img");
    frontFace.setAttribute("alt", pokemon[i].name);
    frontFace.setAttribute("id", i);
    frontFace.classList.add("front_face");

    const backFace = document.createElement("img");
    backFace.setAttribute("alt", "");
    backFace.classList.add("back_face");

    if (currentTheme === "shiny") {
      frontFace.setAttribute("src", pokemon[i].art_front_shiny);
      backFace.setAttribute("src", "./img/masterball.webp");
    } else {
      frontFace.setAttribute("src", pokemon[i].art_front_basic);
      backFace.setAttribute("src", "./img/back.webp");
    }

    card.appendChild(frontFace);
    card.appendChild(backFace);

    gameGrid.appendChild(card);
  }
}

async function runGame(difficulty) {
  // Tracks the first card (starting with no card selected)
  let firstCard = null;

  // Lock Board is used to prevent the user from re selecting the same card
  // Or for selecting more than 2 cards while the two are being compared
  lockBoard = false;

  // Display cards
  await displayCards(difficulty);

  // Reset Stats
  isPeeking = false;
  totalClicks = 0;
  totalMatched = 0;
  totalUnmatched = difficulty;
  totalPairs = difficulty;
  updateHeader();
  hideResults();
  startTimer();

  // Selects every card element and attaches a click handler
  document.querySelectorAll(".card").forEach((card) => {
    // Click handler
    card.addEventListener("click", function () {
      // If the board is locked ignore the click
      if (lockBoard) return;

      // Store the clicked card as secondCard
      const secondCard = this;

      // If the card is already flipped prevent double clicking
      if (secondCard.classList.contains("flip")) return;

      totalClicks++;
      updateHeader();

      // "Flip" the card by adding the flip class, this triggers an animation
      secondCard.classList.add("flip");

      // Find the front face image of the clicked card and returns the src value
      const secondSrc = secondCard
        .querySelector(".front_face")
        .getAttribute("src");

      // If no first card is saved, store it in firstCard and return (wait for player to click second card)
      if (!firstCard) {
        firstCard = secondCard;
        return;
      }

      // Ensure the player can't click the same card twice
      if (firstCard === secondCard) return;

      // Gets the src of the first card to compare it to the second
      const firstSrc = firstCard
        .querySelector(".front_face")
        .getAttribute("src");

      // If the two card images are the same remove click listeners so they can't be flipped again
      if (firstSrc === secondSrc) {
        totalMatched++;
        totalUnmatched--;
        updateHeader();

        // Clear the first card and unlock the board for the next turn
        firstCard = null;
        lockBoard = false;

        // Win condition
        if (totalMatched === totalPairs) {
          lockBoard = true;
          displayResult(true);
          clearInterval(timerInterval);
        }
      } else {
        // Lock the board so no more cards can be clicked during the delay
        lockBoard = true;
        setTimeout(() => {
          // Flip both cards back over after 1 second
          firstCard.classList.remove("flip");
          secondCard.classList.remove("flip");

          // Clear the first card and unlock the board for the next turn
          firstCard = null;
          lockBoard = false;
        }, 1000);
      }
    });
  });
}

function createResult() {
  const resultDiv = document.getElementById("result");
  let resultText = document.createElement("h2");
  resultText.setAttribute("id", "result_text");
  resultText.setAttribute("style", "display: none");

  resultDiv.appendChild(resultText);
}

function displayResult(result) {
  const resultText = document.getElementById("result_text");
  if (result) {
    resultText.innerHTML = "WIN!";
  } else {
    resultText.innerHTML = "LOSE!";
  }
  resultText.setAttribute("style", "display: block");
}

function hideResults() {
  const resultText = document.getElementById("result_text");
  resultText.setAttribute("style", "display: none");
}

function createDifficultyButtons() {
  const difficultyDiv = document.getElementById("difficulty");

  let easyButton = document.createElement("input");
  easyButton.setAttribute("type", "button");
  easyButton.setAttribute("id", "easy_button");
  easyButton.setAttribute("class", "difficulty_buttons");
  easyButton.setAttribute("value", "Easy");
  easyButton.addEventListener("click", function () {
    selectedDifficulty = EASY;
    setActiveDifficulty(easyButton);
  });
  difficultyDiv.appendChild(easyButton);

  let mediumButton = document.createElement("input");
  mediumButton.setAttribute("type", "button");
  mediumButton.setAttribute("id", "medium_button");
  mediumButton.setAttribute("class", "difficulty_buttons");
  mediumButton.setAttribute("value", "Medium");
  mediumButton.addEventListener("click", function () {
    selectedDifficulty = MEDIUM;
    setActiveDifficulty(mediumButton);
  });
  difficultyDiv.appendChild(mediumButton);

  let hardButton = document.createElement("input");
  hardButton.setAttribute("type", "button");
  hardButton.setAttribute("id", "hard_button");
  hardButton.setAttribute("class", "difficulty_buttons");
  hardButton.setAttribute("value", "Hard");
  hardButton.addEventListener("click", function () {
    selectedDifficulty = HARD;
    setActiveDifficulty(hardButton);
  });
  difficultyDiv.appendChild(hardButton);

  // Set active to easy button by default
  setActiveDifficulty(easyButton);

  let startButton = document.createElement("input");
  startButton.setAttribute("type", "button");
  startButton.setAttribute("id", "start_button");
  startButton.setAttribute("value", "Start");
  startButton.addEventListener("click", function () {
    runGame(selectedDifficulty);
  });
  difficultyDiv.appendChild(startButton);

  let resetButton = document.createElement("input");
  resetButton.setAttribute("type", "button");
  resetButton.setAttribute("id", "reset_button");
  resetButton.setAttribute("value", "Reset");
  resetButton.addEventListener("click", function () {
    runGame(selectedDifficulty);
  });
  difficultyDiv.appendChild(resetButton);

  let peekButton = document.createElement("input");
  peekButton.setAttribute("type", "button");
  peekButton.setAttribute("id", "peek_button");
  peekButton.setAttribute("value", "Peek");
  peekButton.addEventListener("click", peek);
  difficultyDiv.appendChild(peekButton);

  let themeButton = document.createElement("input");
  themeButton.setAttribute("type", "button");
  themeButton.setAttribute("id", "theme_button");
  themeButton.setAttribute("value", "Basic Mode");
  themeButton.addEventListener("click", toggleTheme);
  difficultyDiv.appendChild(themeButton);
}

function toggleTheme() {
  const themeButton = document.getElementById("theme_button");
  currentTheme = currentTheme === "basic" ? "shiny" : "basic";
  themeButton.value = currentTheme === "basic" ? "Shiny Mode" : "Basic Mode";
  runGame(selectedDifficulty);
}

function setActiveDifficulty(selectedButton) {
  document.querySelectorAll(".difficulty_buttons").forEach((btn) => {
    btn.classList.remove("active");
  });

  selectedButton.classList.add("active");
}

function initializeGame() {
  createHeader();
  updateHeader();
  createDifficultyButtons();
  createResult();
  runGame(EASY);
}

$(document).ready(initializeGame);
