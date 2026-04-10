// import Player from './Player.js';
// import ScoreCard from './ScoreCard.js';
import writeToStorage from './writeToStorage.js';
import readCardFromStorage from './readCardFromStorage.js';

/////////////////////////////////////////////////////////////////////////////////
// CREATE PLAYER LIST AND SCORECADRD FROM LOCAL STORAGE /////////////////////////
/////////////////////////////////////////////////////////////////////////////////

// CHECK FIRST: if there is no card in storage, direct user back to the enter players window
if (!localStorage.getItem('scoreCard')) {
	window.alert('\nYou don\'t currenlty have an active score card. Enter player names to start a new round.')
	window.location.href = './index.html'
}


let scoreCard = readCardFromStorage()
let holeIndex = scoreCard.currentHoleIndex;

/////////////////////////////////////////////////////////////////////////////////
// CREATE HOLE INFORMATION DISPLAY //////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
const generateHoleInfoDisplay = () => {
	let holeDisplay = document.getElementById('holeNumber');
	holeDisplay.textContent = "Hole " + (holeIndex + 1);
	let currentPar = document.getElementById('parValue');
	currentPar.innerText = "Par " + scoreCard.parList[holeIndex];
}


/////////////////////////////////////////////////////////////////////////////////
// CREATE SCORING CONTAINER DISPLAY /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
const scoringContainer = document.getElementById("scoringContainer");
const generateScoringContainerDisplay = () => {
	for (let i = 0; i < scoreCard.playerList.length; i++) {
		// player div - parent within larger scoringContainer
		const playerDiv = document.createElement('div')
		playerDiv.className = "playerDivs"
		playerDiv.id = "playerDiv" + i;
		playerDiv.style = `display: flex; margin: 5px; order: ${i}`;
		scoringContainer.appendChild(playerDiv);

		// name and round score to be in single div
		const nameAndRoundScoreDivs = document.createElement('div');
		nameAndRoundScoreDivs.className = 'nameAndRoundScoreDivs';
		playerDiv.appendChild(nameAndRoundScoreDivs);

		// then active scoring in the other div, flex space between
		const activeScoringDivs = document.createElement('div');
		activeScoringDivs.className = 'activeScoringDivs';
		playerDiv.appendChild(activeScoringDivs);


		// player names
		const playerName = scoreCard.playerList[i].playerName;
		const playerNameDisplay = document.createElement('h4');
		playerNameDisplay.innerText = playerName;
		playerNameDisplay.id = playerName + i;
		playerNameDisplay.class = "playerDivs";
		nameAndRoundScoreDivs.appendChild(playerNameDisplay);

		// roundScore
		const roundScore = document.createElement('h4');
		roundScore.id = 'roundScore' + i;
		roundScore.className = 'roundScores';
		roundScore.innerText = "(E)";
		nameAndRoundScoreDivs.appendChild(roundScore);

		// minus buttons
		const minusBtn = document.createElement("button");
		minusBtn.className = 'minusBtns'
		minusBtn.id = 'minusBtn' + i;
		minusBtn.innerText = " - ";
		activeScoringDivs.appendChild(minusBtn);
		minusBtn.addEventListener('click', (e) => {
			handleMinusBtn(i);
		})

		// scores
		const playerScore = document.createElement('h4');
		playerScore.className = 'playerScores'
		playerScore.id = 'playerScore' + i;
		playerScore.innerText = scoreCard.playerList[i].scoreList[holeIndex];
		activeScoringDivs.appendChild(playerScore);


		// plus buttons
		const plusBtn = document.createElement("button");
		plusBtn.className = 'plusBtns'
		plusBtn.id = 'plusBtn' + i;
		plusBtn.innerText = " + ";
		activeScoringDivs.appendChild(plusBtn);
		plusBtn.addEventListener('click', (e) => {
			handlePlusBtn(i);
		})
	}
}

// wait for DOM to load, then generate display containers
document.addEventListener("DOMContentLoaded", (e) => {
	generateHoleInfoDisplay();
	generateScoringContainerDisplay();
	for (let i = 0; i < scoreCard.playerList.length; i++) {
		updateRoundScoreDisplay(i);
	}
	updatePlayerOrderDisplay(scoreCard.playerList);
	generateStatusFooter();
});






/////////////////////////////////////////////////////////////////////////////////
// DETERMINE THROWING ORDER AND UPDATE DISPLAY TO REFLECT ///////////////////////
/////////////////////////////////////////////////////////////////////////////////
// assignBoxOrder take the list created in determineBoxOrder() and changes the 
// players boxOrder to reflect the throwing order on the current new hole
const assignBoxOrder = (orderedList) => {
	for (let i = 0; i < orderedList.length; i++) {
		orderedList[i].boxOrder = i + 1;
	}

}

// updagePlayerOrderDisplay will manipulate the DOM so that players appear in order
// when scoring the next new hole
const updatePlayerOrderDisplay = (playerList) => {
	for (let i = 0; i < playerList.length; i++) {
		let playerDiv = document.getElementById(`playerDiv${i}`);
		playerDiv.style.order = playerList[i].boxOrder;
	}

}

// determineBoxOrder is essentially a selection sort that determines the order that players need to
// throw on the new hole's tee box, it feeds an orderedList to assignBoxOrder
// where the box order is then assigned to the initial Player objects in scorecard.playerList
// it then calls to updatePlayerOrderDisplay to update the display according to Player.boxOrder
const determineBoxOrder = (playerList) => {
	// this if may be unnecessary as box order is assigned upon instantiation in 
	// generateScoringContainerDisplay()
	if (holeIndex < 1) {
		assignBoxOrder(playerList);
	} else {
		// selection sort by score
		let lowScoreOrderedList = [...playerList];
		for (let i = 0; i < lowScoreOrderedList.length - 1; i++) {
			let minIndex = i;
			for (let j = i + 1; j < lowScoreOrderedList.length; j++) {

				let scoreAtJ = lowScoreOrderedList[j].scoreList[holeIndex - 1];
				let scoreAtMinIndex = lowScoreOrderedList[minIndex].scoreList[holeIndex - 1]
				let boxAtJ = lowScoreOrderedList[j].boxOrder;
				let boxAtMinIndex = lowScoreOrderedList[minIndex].boxOrder

				if (scoreAtJ < scoreAtMinIndex || (scoreAtJ == scoreAtMinIndex && boxAtJ < boxAtMinIndex)) {
					minIndex = j;
				}

			}
			// swap
			let temp = lowScoreOrderedList[minIndex];
			lowScoreOrderedList[minIndex] = lowScoreOrderedList[i];
			lowScoreOrderedList[i] = temp;
		}
		// this takes the shallow copy, but applies the assignment of box order to the original objects in playerList
		assignBoxOrder(lowScoreOrderedList);
		updatePlayerOrderDisplay(playerList);
	}
}




/////////////////////////////////////////////////////////////////////////////////
// HANDLE SCORING CLICKS ////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
const handleMinusBtn = playerIndex => {
	// update score
	if (scoreCard.playerList[playerIndex].scoreList[holeIndex] == "-") {
		scoreCard.playerList[playerIndex].scoreList[holeIndex] = scoreCard.parList[holeIndex] - 1;
	} else if (scoreCard.playerList[playerIndex].scoreList[holeIndex] <= 1) {
		scoreCard.playerList[playerIndex].scoreList[holeIndex] = "-";
	} else {
		scoreCard.playerList[playerIndex].reduceScore(holeIndex);
	}

	// update display
	const scoreTarget = document.getElementById('playerScore' + playerIndex);
	scoreTarget.innerText = scoreCard.playerList[playerIndex].scoreList[holeIndex];
	updateRoundScoreDisplay(playerIndex);
	writeToStorage(scoreCard);
}

const handlePlusBtn = playerIndex => {
	// update score
	if (scoreCard.playerList[playerIndex].scoreList[holeIndex] == "-") {
		scoreCard.playerList[playerIndex].scoreList[holeIndex] = scoreCard.parList[holeIndex];
	} else {
		scoreCard.playerList[playerIndex].addToScore(holeIndex);
	}

	// update display
	const scoreTarget = document.getElementById('playerScore' + playerIndex);
	scoreTarget.innerText = scoreCard.playerList[playerIndex].scoreList[holeIndex];
	updateRoundScoreDisplay(playerIndex);
	writeToStorage(scoreCard);
}

const determineRoundScore = playerIndex => {
	let parTotal = 0;
	let playerTotal = 0;
	let roundScore = 0;
	for (let i = 0; i <= 17; i++) {
		// add scoring only if player score has values
		if (typeof scoreCard.playerList[playerIndex].scoreList[i] == "number") {
			// add all golfed pars
			parTotal += scoreCard.parList[i];
			// add all golfed player scores
			playerTotal += scoreCard.playerList[playerIndex].scoreList[i];
		}
	}
	// calc roundScore from played totals
	roundScore = playerTotal - parTotal;

	// set Player object score for round
	scoreCard.playerList[playerIndex].currentScore = roundScore;

	// determine display string
	if (roundScore == 0) {
		return "(E)";
	} else if (roundScore > 0) {
		return `(+${roundScore})`;
	} else {
		return `(${roundScore})`;
	}
}


const updateRoundScoreDisplay = playerIndex => {
	const roundScore = document.getElementById('roundScore' + playerIndex);
	let currentPlayerScore = scoreCard.playerList[playerIndex].currentScore;
	currentPlayerScore = determineRoundScore(playerIndex);
	roundScore.innerText = currentPlayerScore;
}




/* CHECK TO SEE IF THESE ARE NECESSARY FOR WRITING CARD DATA
 * I THINK IT IS WRITTEN AS CHANGES ARE MADE, VERIFY
 */

/////////////////////////////////////////////////////////////////////////////////
// HANDLE VIEW CARD BTN /////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
// const viewCardBtn = document.getElementById('viewCardBtn');
// viewCardBtn.addEventListener('click', () => {
// 	// upload data to location storage
// 	writeToStorage(scoreCard);
// })


/////////////////////////////////////////////////////////////////////////////////
// HANDLE PLAYERS BTN ///////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
// const playersBtn = document.getElementById('playersBtn');
// viewCardBtn.addEventListener('click', () => {
// 	// upload data to location storage
// 	writeToStorage(scoreCard);
// })



/////////////////////////////////////////////////////////////////////////////////
// HANDLE HOLE ADVANCE CLICKS ///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
const prevHoleBtn = document.getElementById('prevHole');
prevHoleBtn.addEventListener('click', (e) => {
	if (holeIndex > 0) {
		holeIndex--;
		generateHoleInfoDisplay();
		for (let i = 0; i < scoreCard.playerList.length; i++) {
			let playerScore = document.getElementById('playerScore' + i);
			playerScore.innerHTML = scoreCard.playerList[i].scoreList[holeIndex];
		}
	}
	updateScoreCardObjAndPrepareDisplay()
})


const nextHoleBtn = document.getElementById('nextHole');
nextHoleBtn.addEventListener('click', (e) => {
	if (holeIndex < 17) {
		holeIndex++;
		generateHoleInfoDisplay();
		for (let i = 0; i < scoreCard.playerList.length; i++) {
			let playerScore = document.getElementById('playerScore' + i);
			playerScore.innerHTML = scoreCard.playerList[i].scoreList[holeIndex];
		}
	}
	updateScoreCardObjAndPrepareDisplay()

})

const updateScoreCardObjAndPrepareDisplay = () => {
	scoreCard.currentHoleIndex = holeIndex;
	determineBoxOrder(scoreCard.playerList);
	writeToStorage(scoreCard);
	generateStatusFooter();
}

/////////////////////////////////////////////////////////////////////////////////
// HANDLE EDIT PAR BUTTON ///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

// create select element
const selection = document.createElement('select');
selection.id = 'parSelection'

// add to parDiv
const parDiv = document.getElementById('parDiv');
parDiv.appendChild(selection);

// populate select drop down with default option
const defaultOption = document.createElement('option');
defaultOption.disabled = true;
defaultOption.selected = true;
defaultOption.textContent = "Edit"
selection.appendChild(defaultOption)

// populate select drop down with par options
for (let i = 2; i < 7; i++) {
	const newPar = document.createElement('option');
	newPar.textContent = `Par ${i}`;
	selection.appendChild(newPar);
}

// handle change of select ddwn
selection.addEventListener('change', (e) => {
	let selectedPar;
	if (e.target.textContent != "Edit") {
		selectedPar = parseInt(selection.options[selection.selectedIndex].text.substring(4));
	}

	scoreCard.parList[holeIndex] = selectedPar;
	let currentPar = document.getElementById('parValue');
	currentPar.textContent = "Par " + scoreCard.parList[holeIndex];
	defaultOption.selected = true
	// parDiv.removeChild(selection);

	// clear existing display list
	while (scoringContainer.firstChild) {
		scoringContainer.removeChild(scoringContainer.firstChild);
	}

	// regenerate player list display in DOM
	generateScoringContainerDisplay();

	// update each players score in display
	for (var i = 0; i < scoreCard.playerList.length; i++) {
		updateRoundScoreDisplay(i);
	}

	// update footer at bottom of view
	generateStatusFooter();

	// update storage with new values written to scoreCard Obj
	writeToStorage(scoreCard);
})

/////////////////////////////////////////////////////////////////////////////////
// GENERATE FOOTER STATUS ///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
const generateStatusFooter = () => {
	const currentHole = holeIndex + 1
	const currentPar = scoreCard.parList[holeIndex];
	const statusString = `Hole ${currentHole} • Par ${currentPar}`

	const statusFooter = document.getElementById('statusFooter')
	statusFooter.textContent = statusString;

}



