function getHashParams() {
	var hashParams = {};
	var e, 
		r = /([^&;=]+)=?([^&;]*)/g, 
		q = window.location.hash.substring(1);
	while ( e = r.exec(q)) {
		hashParams[e[1]] = decodeURIComponent(e[2]);
	}
	return hashParams;
}

function getRandomNumbers(min, max, len) {
	// create seed
	var seed = new Array(max - min);
	for (let i = 0; i < seed.length; i++) {
		seed[i] = min + i;
	}

	// get random numbers
	var rand = new Array(len);
	for (let i = 0; i < rand.length; i++) {
		var index = Math.floor(Math.random() * seed.length);
		rand[i] = removeAtIndex(seed, index);
	}
	return rand;
}

function removeAtIndex(arr, index) {
	return arr.splice(index, 1)[0];
}

function getParentByClassName(elem, className) {
	while ((elem = elem.parentElement) && !elem.classList.contains(className));
	return elem;
}

function replaceNodes(parent, fragment) {
	while(parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
	parent.appendChild(fragment);
}