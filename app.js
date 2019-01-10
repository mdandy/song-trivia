const dotenv = require('dotenv');
dotenv.config();

var express = require('express'); 
var request = require('request'); 
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var port_number = process.env.PORT || 3000;
var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var root_uri = process.env.ENVIRONMENT === 'HEROKU' ? 'https://song-trivia.herokuapp.com/' : 'http://localhost:3000/';
var redirect_uri = root_uri + 'callback/';
var spotify_web_api_uri = 'https://api.spotify.com/v1/';

var access_token;
var refresh_token;
var stateKey = 'spotify_auth_state';

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

var callSpotifyApi = function(apiName, resourceId, params) {
	return new Promise(function(resolve, reject) {
		if (!access_token) {
			reject(new Error('Authentication is not yet established.'));
		}

		// use the access token to access the Spotify Web API
		var url = spotify_web_api_uri + apiName + '/' + resourceId + '?' + querystring.stringify(params);
		var options = {
			url: url,
			headers: { 'Authorization': 'Bearer ' + access_token },
			json: true
		};
		console.log('Calling Spotify Web API: ' + url);

		request.get(options, function(error, response, body) {
			console.log('Receiving Spotify Web API: /' + apiName + '/' + resourceId + ' with status code ' +response.statusCode);
			if (!error) {
				resolve(body);
			} else {
				reject(error);
			}
		});
	});
};

var app = express();

app.use(express.static(__dirname + '/public'))
	 .use(cors())
	 .use(cookieParser());

app.get('/login', function(req, res) {
	console.log('Authorizing against Spotify.');

	var state = generateRandomString(16);
	res.cookie(stateKey, state);

	// your application requests authorization
	var scope = 'user-read-private playlist-read-private';
	res.redirect('https://accounts.spotify.com/authorize?' +
		querystring.stringify({
			response_type: 'code',
			client_id: client_id,
			scope: scope,
			redirect_uri: redirect_uri,
			state: state
		}));
});

app.get('/callback', function(req, res) {
	console.log('Receiving Spotify authization callback.');

	// your application requests refresh and access tokens
	// after checking the state parameter

	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;

	if (state === null || state !== storedState) {
		res.redirect('/#' +
			querystring.stringify({
				error: 'state_mismatch'
			}));
	} else {
		res.clearCookie(stateKey);
		var authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code'
			},
			headers: {
				'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
			},
			json: true
		};

		request.post(authOptions, function(error, response, body) {
			if (!error && response.statusCode === 200) {

				access_token = body.access_token;
				refresh_token = body.refresh_token;

				// callSpotifyApi('playlists', '37i9dQZF1DXcBWIGoYBM5M', { market : 'US'})
				// .then(function(result) {
				// 	console.log(result);
				// });

				// we can also pass the token to the browser to make requests from there
				res.redirect('/playlist.html#' +
					querystring.stringify({
						access_token: access_token
					}));
			} else {
				res.redirect('/error.html#' +
					querystring.stringify({
						error: 'invalid_token'
					}));
			}
		});
	}
});

app.get('/refresh_token', function(req, res) {

	// requesting access token from refresh token
	var refresh_token = req.query.refresh_token;
	var authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
		form: {
			grant_type: 'refresh_token',
			refresh_token: refresh_token
		},
		json: true
	};

	request.post(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			var access_token = body.access_token;
			res.send({
				'access_token': access_token
			});
		}
	});
});

console.log('Listening on ' + port_number);
app.listen(port_number);
