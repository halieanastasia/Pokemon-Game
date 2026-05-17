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

var isLoading = false;

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
      art_front: pokemonList[i].sprites.other["official-artwork"].front_shiny,
    });
    result.push({
      name: pokemonList[i].name,
      art_front: pokemonList[i].sprites.other["official-artwork"].front_shiny,
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

const pokemon = loadPokemon();
console.log(pokemon);

const EASY = 3;
const MEDIUM = 6;
const HARD = 9;

let totalClicks = 0;
let totalMatched = 0;
let totalUnmatched = EASY;
let totalPairs = EASY;

function displayHeader() {
  const statsDiv = document.getElementById("stats");

  const totalClicksElement = document.createElement("h5");
  totalClicksElement.innerHTML = `Total Clicks: ${totalClicks}`;
  totalClicksElement.setAttribute("id", "stat_clicks");
  totalClicksElement.setAttribute("class", "stat_element");
  statsDiv.appendChild(totalClicksElement);

  const totalPairsElement = document.createElement("h5");
  totalPairsElement.innerHTML = `Total Pairs: ${totalPairs}`;
  totalPairsElement.setAttribute("id", "stat_pairs");
  totalPairsElement.setAttribute("class", "stat_element");
  statsDiv.appendChild(totalPairsElement);

  const totalMatchedElement = document.createElement("h5");
  totalMatchedElement.innerHTML = `Matched: ${totalMatched}`;
  totalMatchedElement.setAttribute("id", "stat_matched");
  totalMatchedElement.setAttribute("class", "stat_element");
  statsDiv.appendChild(totalMatchedElement);

  const totalUnmatchedElement = document.createElement("h5");
  totalUnmatchedElement.innerHTML = `Unmatched: ${totalUnmatched}`;
  totalUnmatchedElement.setAttribute("id", "stat_unmatched");
  totalUnmatchedElement.setAttribute("class", "stat_element");
  statsDiv.appendChild(totalUnmatchedElement);
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
}

async function displayCards(difficulty) {
  const gameGrid = document.getElementById("game_grid");
  const pokemon = await loadPokemon(difficulty);

  for (let i = 0; i < pokemon.length; i++) {
    const card = document.createElement("div");
    card.classList.add("card");

    const frontFace = document.createElement("img");
    frontFace.setAttribute("src", pokemon[i].art_front);
    frontFace.setAttribute("alt", pokemon[i].name);
    frontFace.setAttribute("id", i);
    frontFace.classList.add("front_face");

    const backFace = document.createElement("img");
    backFace.setAttribute("src", "./img/back.webp");
    backFace.setAttribute("alt", "");
    backFace.classList.add("back_face");

    card.appendChild(frontFace);
    card.appendChild(backFace);

    gameGrid.appendChild(card);
  }
}

async function setup() {
  displayHeader();
  await displayCards(EASY);
  runGame(EASY);
}

function runGame(difficulty) {
  // Tracks the first card (starting with no card selected)
  let firstCard = null;

  // Lock Board is used to prevent the user from re selecting the same card
  // Or for selecting more than 2 cards while the two are being compared
  let lockBoard = false;

  totalClicks = 0;
  totalMatched = 0;
  totalUnmatched = difficulty;
  totalPairs = difficulty;

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

$(document).ready(setup);
