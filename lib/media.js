var request = require('request');

var API_URL = 'https://api.example.com';

var Media = function (token) {
    if (typeof token === 'undefined')
        throw new Error('You need to specify valid token for API request!');
    this.token = token
}

Media.prototype = {
    get: function(path, params, callback) {
        return this.request("GET", API_URL + path, params, callback)
    },
    post: function(path, params, callback) {
        return this.request("POST", API_URL + path, params, callback)
    },
    request: function(method, path, params, callback) {
        var options = {
            url: path,
            headers: {
                'Authorization': 'Bearer ' + this.token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params),
            method: method
        }
        request(options, function(error, response, body) {
            callback(error, body || {});
        })
    },
    musicCreate: function(music, callback) {
        this.post('/musics', music, function(error, response) {
            callback(error, response)
        })
    }
}

module.exports = Media