/* addPlayers.js works to take in player names and create a list of type Player
 * It then handles the Start Round button and creates a ScoreCard object
 * with the players of type Player
 */

import ScoreCard from "./ScoreCard.js";
import Player from "./Player.js";
import readCardFromStorage from "./readCardFromStorage.js";
import writeToStorage from "./writeToStorage.js";

// Global vars
let players = [];
let scoreCard;

/////////////////////////////////////////////////////////////////////////////////
// CREATE PLAYER LIST AND SCORECADRD FROM LOCAL STORAGE /////////////////////////
/////////////////////////////////////////////////////////////////////////////////
try {
	scoreCard = readCardFromStorage();
	if (scoreCard != null) {
		for (let i = 0; i < scoreCard.playerList.length; i++) {
			players.push(scoreCard.playerList[i]);
		}
	}

	document.addEventListener('DOMContentLoaded', () => {
		clearAndCreateDOMList();
	})

} catch (err) {
	console.log(err + "\nNo scorecard exists in memory");
}


/////////////////////////////////////////////////////////////////////////////////
// ADD PLAYER TO ACTIVE - BUILD PLAYER LIST IN DOM //////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
const addPlayerBtn = document.getElementById("addPlayerBtn")
addPlayerBtn.addEventListener("click", (e) => {
	addPlayerToPlayersList();
	clearAndCreateDOMList();
});

/////////////////////////////////////////////////////////////////////////////////
// HANDLE ROUND START TRIGGERING EVENTS /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
const startRndBtn = document.getElementById("scoreRndBtn");
startRndBtn.addEventListener("click", (e) => {
	startRound()
});

const scoringIcon = document.getElementById("scoringIcon");
scoringIcon.addEventListener("click", (e) => {
	startRound()
});

const fullCardIcon = document.getElementById("fullCardIcon");
fullCardIcon.addEventListener("click", (e) => {
	startRound()
});

const startRound = () => {
	const playerInput = document.getElementById("playerNameInput");
	if (playerInput.value.length > 0) {
		if ([players.length] > 0) {
			let playerListConfirm = window.confirm(`Would you like to also add ${playerInput.value} to the card and start scoring your round?`)
			if (playerListConfirm == true) {
				addPlayerToPlayersList()
			}
		} else {
			// this just changes the alert to be the singular version
			let playerListConfirm = window.confirm(`Would you like to add ${playerInput.value} to the card and start scoring your round?`)
			if (playerListConfirm == true) {
				addPlayerToPlayersList()
			}
		}
	}
	

	scoreCard = new ScoreCard(players);

	if (scoreCard.playerList.length == 0) {
		window.alert("Please add players before scoring your round.")
		return;
	}

	// change par values alert box
	if(!localStorage.getItem('parList')){
		window.alert('\nWelcome to dgScoreCard!\n\nOn new cards, par values default to 3 and can be edited on every hole.\nFor details on saving course pars, please see our User Guide.')
	}

	storeCardToLocalStorageAndStartRound();
}

const storeCardToLocalStorageAndStartRound = () => {
	writeToStorage(scoreCard);
	window.location.href = "./scoring.html";
}

/////////////////////////////////////////////////////////////////////////////////
// HANDLE DELETE PLAYER BTN /////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
const deletePlayer = (playerIndex) => {
	let deletePlayerConfirm = window.confirm(`Do you want to remove ${players[playerIndex].playerName} from this card?`);
	if (deletePlayerConfirm == true) {
		players.splice(playerIndex, 1);
		clearAndCreateDOMList();
	}
}

/////////////////////////////////////////////////////////////////////////////////
// ADD PLAYER TO PLAYER LIST FROM TEXT INPUT ////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
const addPlayerToPlayersList = () => {
	// id input and get value
	const playerInput = document.getElementById("playerNameInput");
	let nameInputValue = playerInput.value;

	// if there is an input, add that input to the players list, clear input
	if (nameInputValue != "") {
		players.push(new Player(nameInputValue));
		playerInput.value = "";
	}
}

/////////////////////////////////////////////////////////////////////////////////
// CLEAR DOM - REBUILD NEW DOM PLAYER LIST //////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
const clearAndCreateDOMList = () => {
	// grab list from DOM
	let activePlayerList = document.getElementById("activePlayerList");


	// clear existing list
	while (activePlayerList.firstChild) {
		activePlayerList.removeChild(activePlayerList.firstChild);
	}

	// repopulate list with active players
	for (var i = 0; i < players.length; i++) {
		// create player div as row (flex) and add player names to playerDiv
		let playerDiv = document.createElement("div")

		let playerNameEl = document.createElement("p")
		playerNameEl.textContent = `${i + 1}. ${players[i].playerName}`
		playerDiv.className = "addedPlayerDivs"
		playerDiv.appendChild(playerNameEl)

		// create delete buttons for each player
		let playerRemoveBtn = document.createElement('button')
		playerRemoveBtn.textContent = "-"
		playerRemoveBtn.className = "playerRemoveBtns"
		playerRemoveBtn.id = i;

		// add event listener for the player button
		playerRemoveBtn.addEventListener('click', (e) => {
			deletePlayer(e.target.id);
		})

		// add playerDiv to player list, then add player list to display in DOM
		playerDiv.appendChild(playerRemoveBtn);
		activePlayerList.appendChild(playerDiv);
	}
}








