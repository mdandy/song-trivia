
const data_ordinal_key = 'ordinal';
const data_track_id_key = 'trackId';
const playlist_top_alltime = '2YRe7HRKNRvXdJBp9nXFza';
const playlist_top_2018 = '37i9dQZF1DX1HUbZS4LEyL';

var driver;
var activeAudio = null;
var playlist = {
	foo : {
		id: "foo",
		title: "Sample Track",
		artist: "Sample Artist",
		previewUrl: "foo.com",
		spotifyUrl: "error.html#msg=Not%20Found"
	}
};

var num_track = 10;
var preset;
var playlistId;


function initialize() {
	var params = getHashParams();
	driver = new SpotifyDriver(params.access_token);

	var thePlaylist = playlistId ? playlistId : playlist_top_2018;
	driver.fetchPlaylist(thePlaylist)
		.then(function(result) {
			playlist = {};

			var trackData = result.tracks.items;
			console.log('Receiving ' + trackData.length + ' track data.');

			var indices = preset ? preset : getRandomNumbers(0, trackData.length, num_track);
			for (let i = 0; i < indices.length; i++) {
				var track = trackData[indices[i]].track;;
				playlist[track.id] = {
					id: track.id,
					title: track.name,
					artist: track.artists[0].name,
					previewUrl: track.preview_url, 
					spotifyUrl: track.external_urls.spotify
				};
			}

			generatePlaylistElem();
		})
		.catch(function(error) {
			window.location.href = '/error.html#msg=' + error.message;
		});
}

function generatePlaylistElem() {
	var fragment = document.createDocumentFragment();
	var template = document.getElementById('playlist-track-template').content;

	var i = 1;
	for (let trackId in playlist) {
		var track = playlist[trackId];
		var node = document.importNode(template, true);
		node.querySelector('.ordinal').textContent = i;
		node.querySelector('.ordinal').dataset[data_ordinal_key] = i;
		node.querySelector('.mask').textContent = 'Track ' + i;
		node.querySelector('.answer').textContent = track.title + ' by ' + track.artist;
		node.querySelector('.command-play').dataset[data_track_id_key] = track.id;
		node.querySelector('.command-spotify').href = track.spotifyUrl;

		fragment.appendChild(node);
		i++;
	}

	replaceNodes(document.getElementById('playlist-table'), fragment);
}

function play(elem) {
	var playlistRowElem = getParentByClassName(elem, 'playlist-track');
	if (activeAudio) {
		// stop the audio
		activeAudio.pause();
		activeAudio = null;
		_renderStop(playlistRowElem);

	} else {
		// play the audio
		_renderPlay(playlistRowElem);

		var trackId = _getTrackId(playlistRowElem);
		var track = playlist[trackId];
		activeAudio = new Audio(track.previewUrl);
		activeAudio.play();
		activeAudio.onended = function() {
			activeAudio = null;
			_renderStop(playlistRowElem);
		};
		activeAudio.onerror = function() {
			activeAudio = null;
			_renderStop(playlistRowElem);
		}
	}
}

function _getTrackId(playlistRowElem) {
	return playlistRowElem.querySelector('.command-play').dataset[data_track_id_key];
}

function _renderPlay(playlistRowElem) {
	playlistRowElem.querySelector('.ordinal').textContent = '\u{1F50A}';
	playlistRowElem.querySelector('.command-play').textContent = 'Stop';
}

function _renderStop(playlistRowElem) {
	var ordinalElem = playlistRowElem.querySelector('.ordinal');
	ordinalElem.textContent = ordinalElem.dataset[data_ordinal_key];
	playlistRowElem.querySelector('.command-play').textContent = 'Play';
}

function reveal(elem) {
	var playlistRowElem = getParentByClassName(elem, 'playlist-track');
	playlistRowElem.querySelector('.mask').classList.add('hidden');
	playlistRowElem.querySelector('.answer').classList.remove('hidden');
}

window.onload = function() {
	initialize();
}