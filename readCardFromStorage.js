import Player from "./Player.js";
import ScoreCard from "./ScoreCard.js";

const readCardFromStorage = () => {
	let cardAsObj = (JSON.parse(localStorage.getItem('scoreCard')));
	let playerList = cardAsObj.playerList;
	let players = [];
	for (let i = 0; i < playerList.length; i++) {
		let player = new Player(playerList[i].playerName);
		player.scoreList = cardAsObj.playerList[i].scoreList;
		player.boxOrder = cardAsObj.playerList[i].boxOrder;
		player.currentScore = cardAsObj.playerList[i].currentScore
		players.push(player);
	}

	// create the master ScoreCard object
	let scoreCard = new ScoreCard(players);
	scoreCard.parList = cardAsObj.parList;

	// set holeIndex on ScoreCard object
	let currentHoleIndex = cardAsObj.currentHoleIndex;
	scoreCard.currentHoleIndex = currentHoleIndex;

	return scoreCard;
}

export default readCardFromStorage;