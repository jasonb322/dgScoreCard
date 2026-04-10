const writeToStorage = (scoreCardObject) => {
	localStorage.removeItem('scoreCard');
	localStorage.setItem('scoreCard', JSON.stringify(scoreCardObject));
}

export default writeToStorage;