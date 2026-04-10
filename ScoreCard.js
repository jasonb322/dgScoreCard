export default class ScoreCard{

	constructor(playerList){
		this.playerList = playerList;
		if(!localStorage.getItem('parList')){
			this.parList = [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3];
		} else {
			let parListObjLiteral = JSON.parse(localStorage.getItem('parList'))
			this.parList = parListObjLiteral.parList
		}
		
		this.currentHoleIndex = 0;
	}

	getPlayerList() {
		return this.playerList;
	}

	toString() {
		return this.playerList;
	}
}
