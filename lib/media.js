var request = require('request');

var API_URL = 'https://api.example.com';

var Media = function (token) {
    if (typeof token === 'undefined')
        throw new Error('You need to specify valid token for API request!');
    this.token = token
}

Media.prototype = {
    get: function(path, callback) {
        return this.request("GET", API_URL + path, {}, callback)
    },
    post: function(path, params, callback) {
        return this.request("POST", API_URL + path, params, callback)
    },
    put: function(path, params, callback) {
        return this.request("PUT", API_URL + path, params, callback)
    },
    delete: function(path, callback) {
        return this.request("DELETE", API_URL + path, {}, callback)
    },
    request: function(method, path, params, callback) {
        var options = {
            url: path,
            headers: {
                'Authorization': 'Bearer ' + this.token,
                'Content-Type': 'application/json'
            },
            method: method
        }

        if (method !== 'GET' && method !== 'DELETE') {
            options.body = JSON.stringify(params)
        }
        request(options, function(error, response, body) {
            callback(error, body || {});
        })
    },
    musicCreate: function(music, callback) {
        this.post('/musics', music, function(error, response) {
            callback(error, response)
        })
    },
    musicUpdate: function(id, updatedMusic, callback) {
        this.put('/musics/' + id, updatedMusic, function(error, response) {
            callback(error, response)
        })
    },
    musicDelete: function(id, callback) {
        this.delete('/musics/' +id, function(error, response) {
            callback(error, response)
        })
    },
    musicList: function(callback) {
        this.get('/musics', function(error, response) {
            callback(error, response)
        })
    },
    musicGet: function(id, callback) {
        this.get('/musics/' + id, {}, function(error, response) {
            callback(error, response)
        })
    }
}

module.exports = Media