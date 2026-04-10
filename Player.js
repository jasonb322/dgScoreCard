export default class Player {
	constructor(playerName){
		this.playerName = playerName;
		this.scoreList=["-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"];
		this.boxOrder=1;
		this.currentScore = 0;
	}

	reduceScore(index){
		this.scoreList[index]--;
	}

	addToScore(index){
		this.scoreList[index]++;
	}


	getScoreList() {
		return this.scoreList;
	}

	getBoxOrder(){
		return this.boxOrder;
	}

	getCurrentScore(){
		return this.currentScore;
	}

	setBoxOrder(value){
		this.boxOrder = value;
	}

	setCurrentScore(currentScore){
		this.currentScore = currentScore;
	}

	toString = () => {
		return `${this.playerName} -- Current Score: ${this.currentScore}`
	}
}
