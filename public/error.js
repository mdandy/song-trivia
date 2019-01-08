function initialize() {
	var param = getHashParams();
	if (param.error === 'invalid_token') {
		showError('Invalid Token.');
	} else if (param.msg) {
		showError(param.msg);
	}
}

function showError(error) {
	$('#error').text(error);
}

window.onload = function() {
	initialize();
}