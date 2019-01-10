const spotify_web_api_uri = 'https://api.spotify.com/v1/';

class SpotifyDriver {
	
	constructor(accessToken) {
		if (!accessToken) {
			throw new Error('Access Token is not defined.');
		}
		this.accessToken = accessToken;
	}

	fetchPlaylist(playlistId) {
		return this._invoke('playlists', playlistId, { market : 'US' });
	}

	_invoke(apiName, resourceId, params) {
		var self = this;
		return new Promise(function(resolve, reject) {
			var url =  spotify_web_api_uri + apiName + '/' + resourceId;
			console.log('Calling Spotify Web API: ' + url);

			$.ajax({
				url: url,
				headers: {
				  'Authorization': 'Bearer ' + self.accessToken
				},
				data: params,
				success: function(response) {
					console.log('Receive success for ' + apiName + ' API call.');
					resolve(response);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.error('Receive error for ' + apiName + ' API call.');
					var error = JSON.parse(jqXHR.responseText).error;
					reject(new Error(error.message));
				}
			});
		});
	}
}