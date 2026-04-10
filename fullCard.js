import writeToStorage from "./writeToStorage.js";
import readCardFromStorage from "./readCardFromStorage.js";

/////////////////////////////////////////////////////////////////////////////////
// CREATE PLAYER LIST AND SCORECARD FROM LOCAL STORAGE //////////////////////////
/////////////////////////////////////////////////////////////////////////////////

// CHECK FIRST: if there is no card in storage, direct user back to the enter players window
if(!localStorage.getItem('scoreCard')){
	window.alert('\nYou don\'t currenlty have an active score card. Enter player names to start a new round.')
	window.location.href = './index.html'
}


let scoreCard = readCardFromStorage();

// SET UP SCORING SUMMARY ONCE DOM LOADS
document.addEventListener("DOMContentLoaded", (e) => {
	generateLeaderBoard()
	generateScoringForSide("front")
	generateScoringForSide("back")
})


/////////////////////////////////////////////////////////////////////////////////
// HANDLE BUTTON PRESSES ////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
const scoringBtn = document.getElementById('scoringBtn');
scoringBtn.addEventListener('click', () => {
	writeToStorage(scoreCard);
	window.location.href = './scoring.html'
})

const saveParOrderBtn = document.getElementById('saveParOrderBtn')
saveParOrderBtn.addEventListener('click', (e) => {
	let userSaveParSet = window.confirm('Would you like to save this course\'s par values? The next time you play, each hole will have the par value you see today.')
	if(userSaveParSet){
		let parListObj = { parList: scoreCard.parList }
		if(localStorage.getItem('parList')){
			localStorage.removeItem('parList')
		}
		localStorage.setItem('parList', JSON.stringify(parListObj))
		window.alert('Par values have been saved and will remain intact until overwritten or until browser history is deleted.')
	}
	return
})


const deleteCardBtn = document.getElementById('deleteCardBtn');
deleteCardBtn.addEventListener('click', () => {
	let userDeleteConfirmation = window.confirm("Nothing lasts forever! Do you want to delete this card and start over?");
	if (userDeleteConfirmation == true) {
		localStorage.removeItem('scoreCard');
		window.open("./addPlayers.html");
	}
	return;
})


/////////////////////////////////////////////////////////////////////////////////
// HANDLE BOX SCORE GRID ////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
const generateHoleLabelRow = (divName, startHole, endHole) => {
	let scoreCardGrid = document.getElementById(divName)

	let holeLabelDiv = document.createElement('div')
	holeLabelDiv.className = 'holeLabelRow'
	holeLabelDiv.textContent = "Hole"
	scoreCardGrid.appendChild(holeLabelDiv)

	for (let i = startHole - 1; i < endHole; i++) {
		let currentHole = i + 1
		let div = document.createElement('div')
		div.className = 'holeLabelRow'
		div.textContent = currentHole
		scoreCardGrid.appendChild(div)
	}

}

const generateCourseParRow = (divName, startHole, endHole) => {
	let scoreCardGrid = document.getElementById(divName)

	let parLabelDiv = document.createElement('div')
	parLabelDiv.textContent = "Par"
	parLabelDiv.style.fontWeight = 600
	scoreCardGrid.appendChild(parLabelDiv)


	// could make this a function
	for (let i = startHole - 1; i < endHole; i++) {
		let currentPar = scoreCard.parList[i]
		let div = document.createElement('div')
		div.textContent = currentPar
		div.style.fontWeight = 600
		scoreCardGrid.appendChild(div)
	}
}


const generateScoreGridForAllPlayers = (divName, startHole, endHole) => {
	for (let i = 0; i < scoreCard.playerList.length; i++) {
		let currentPlayer = scoreCard.playerList[i]
		generatePlayerScoreRow(divName, currentPlayer, startHole, endHole);
	}
}

const generatePlayerScoreRow = (divName, player, startHole, endHole) => {
	// get div
	let scoreCardGrid = document.getElementById(divName)

	// generate player name
	let nameDiv = document.createElement('div')
	nameDiv.textContent = player.playerName
	scoreCardGrid.appendChild(nameDiv)

	// generate scores
	for (let i = startHole - 1; i < endHole; i++) {
		let div = document.createElement('div')
		div.textContent = player.scoreList[i]
		div.className = determineParRelativeScore(player, i)
		scoreCardGrid.appendChild(div)
	}
}

const generateScoringForSide = (side) => {
	let startHole;
	let endHole;
	let divName;

	if (side.toLowerCase() == 'front') {
		startHole = 1
		endHole = 9
		divName = 'scGridFront'
	} else {
		startHole = 10
		endHole = 18
		divName = 'scGridBack'
	}

	generateHoleLabelRow(divName, startHole, endHole)
	generateCourseParRow(divName, startHole, endHole)
	generateScoreGridForAllPlayers(divName, startHole, endHole)
}


// determine ace, eagle, birdie, par, bogie, double ...
const determineParRelativeScore = (player, holeIndex) => {
	let currentPlayerScore = player.scoreList[holeIndex];
	let currentPar = scoreCard.parList[holeIndex];
	let delta = currentPlayerScore - currentPar;
	let relParScore = 'par';

	if (delta > 2) {
		relParScore = 'doubleBogiePlus'
	} else if (delta > 1){
		relParScore = 'doubleBogie' 
	}else if (delta == 1){
		relParScore = 'bogie' 
	} else if (delta < -1) {
		relParScore = 'eagleAce'
	} else if (delta == -1) {
		relParScore = 'birdie'
	}
	return relParScore;
}


/////////////////////////////////////////////////////////////////////////////////
// HANDLE LEADER BOARD GRID /////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
const determineLeaderBoardOrder = () => {
	let players = [...scoreCard.playerList]
	players.sort(compareScores);
	return players
}

const compareScores = (a, b) => {
	return a.currentScore - b.currentScore;
}

const generateLeaderBoard = () => {
	let playerList = determineLeaderBoardOrder()
	let leaderBd = document.getElementById('leaderBd')

	// generateHeaderRow
	let playerLabel = document.createElement('div');
	playerLabel.textContent = "Player"
	playerLabel.style.fontWeight = 700
	leaderBd.appendChild(playerLabel)

	let roundScoreLabel = document.createElement('div');
	roundScoreLabel.textContent = "Total"
	roundScoreLabel.style.fontWeight = 700
	leaderBd.appendChild(roundScoreLabel)

	let plusMinusLabel = document.createElement('div');
	plusMinusLabel.textContent = "+/-"
	plusMinusLabel.style.fontWeight = 700
	leaderBd.appendChild(plusMinusLabel)

	for (let i = 0; i < playerList.length; i++) {
		// current player
		let player = playerList[i];

		// generate player name
		let nameDiv = document.createElement('div')
		nameDiv.textContent = player.playerName
		leaderBd.appendChild(nameDiv)

		// generate round total score
		let scoreSum = 0;
		for (let j = 0; j < 18; j++) {
			if (typeof player.scoreList[j] == 'number') {
				scoreSum += player.scoreList[j];
			}
		}

		// add round total score to grid
		let playerRoundTotal = document.createElement('div')
		playerRoundTotal.textContent = scoreSum
		leaderBd.appendChild(playerRoundTotal)

		// get +/- score and add to grid
		let playerPlusMinus = document.createElement('div')
		let playerScore = player.currentScore;

		if (playerScore > 0) {
			playerScore = "(+" + playerScore + ")";
		} else if (playerScore == 0) {
			playerScore = "(E)"
		} else {
			playerScore = "(" + playerScore + ")"
		}

		playerPlusMinus.textContent = playerScore
		leaderBd.appendChild(playerPlusMinus)

	}
}