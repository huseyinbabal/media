var assert = require('assert');
var fs = require('fs');
var path = require('path');
var request = require('request');
var nock = require('nock');
var expect = require('expect.js');
var config = JSON.parse(fs.readFileSync(path.normalize(__dirname + '/resources/config.json', 'utf8')));

describe('Foo NodeJS Client API Tests', function () {

    var Media = require('../lib/media');
    var mediaClient = new Media(config.token);
    nock.disableNetConnect();

    describe('Common Tests', function () {
        it('should throw error on undefined token', function (done) {
            assert.throws(function () {
                var mediaClient = new Media()
            }, Error)
            done()
        })

        it('should provide token in header', function (done) {
            nock('https://api.example.com', {
                reqheaders: {
                    'Content-Type': 'application/json'
                }
            })
                .get('/musics')
                .reply(200, 'OK')

            mediaClient.musicList(function(error, response) {
                expect(response).to.eql('OK')
                done()
            })

        })

        it('should provide specific header in response', function (done) {
            nock('https://api.example.com')
                .get('/musics')
                .reply(200, 'OK', {
                    'Content-Type': 'application/json'
                })

            mediaClient.musicList(function(error, response) {
                expect(response).to.eql('OK')
                done()
            })

        })

        it('should provide default response header', function(done) {
            nock('https://api.example.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .get('/musics')
                .reply(200, 'OK, with default response headers')

            mediaClient.musicList(function(error, response) {
                expect(response).to.eql('OK, with default response headers')
                done()
            })
        })

        it('should handle specific port', function(done) {
            nock('https://api.example.com:8081')
                .get('/')
                .reply(200, 'OK with custom port')
            request('https://api.example.com:8081', function(error, response, body) {
                expect(body).to.eql('OK with custom port')
                done()
            })
        })

        it('should also support sub domains', function(done) {
            nock('http://api.example.com', {
                filteringScope: function(scope) {
                    return /^http:\/\/api[0-9]*.example.com/.test(scope);
                }
            })
                .get('/musics')
                .reply(200, 'OK with dynamic subdomains')

            request('http://api2.example.com/musics', function(error, response, body) {
                expect(body).to.eql('OK with dynamic subdomains')
                done()
            })
        })

        it('should support dynamic pagination', function(done) {
            nock('http://api.example.com')
                .filteringPath(/page=[^&]*/g, 'page=123')
                .get('/musics?page=123')
                .reply(200, 'Ok response with paginate')

            request('http://api.example.com/musics?page=13', function(error, response, body) {
                expect(body).to.eql('Ok response with paginate')
                done()
            })
        })

        it('should create movie with dynamic title', function(done) {
            nock('http://api.example.com')
                .filteringRequestBody(function(path) {
                    return 'test'
                })
                .post('/musics', 'test')
                .reply(201, 'OK');

            var options = {
                url: 'http://api.example.com/musics',
                method: 'POST',
                body: 'author=test_author&title=test'
            }

            request(options, function(err, response, body) {
                expect(body).to.eql('OK')
                done()
            })
        })

        it('should match bearer token header', function(done) {
            nock('https://api.example.com')
                .matchHeader('Authorization', /Bearer.*/)
                .get('/musics')
                .reply(200, 'Ok response with music list')

            mediaClient.musicList(function(error, response) {
                expect(response).to.eql('Ok response with music list')
                done()
            })
        })

        it('should request performed to "http://api.example.com"', function(done) {
            var musicList = nock('http://api.example.com')
                .get('/musics')
                .reply(200, 'OK with music list');
            request('http://api.example.com/musics', function(error, response){
                expect(musicList.isDone()).to.eql(true)
                done()
            })
        })

        it('should failed due to scope clearing', function(done) {
            var musicList = nock('http://api.example.com')
                .get('/musics')
                .reply(200, 'OK with music list');
            nock.cleanAll();
            request('http://api.example.com/musics', function(error, response, body){
                expect(body).not.eql('OK with music list')
                done()
            })
        })

        it('should log all the request', function(done) {
            var musicList = nock('http://api.example.com')
                .log(console.log)
                .get('/musics')
                .reply(200, 'OK with music list');
            request('http://api.example.com/musics', function(error, response, body){
                expect(body).eql('OK with music list')
                done()
            })
        })
    })
    describe('Music Tests', function () {
        it('should create a new music', function (done) {
            nock('https://api.example.com')
                .post('/musics', {
                    title: 'Unforgiven II',
                    author: 'Metallica',
                    duration: '6:36 min.'
                })
                .reply(200, {
                    music: {
                        id: 3164494,
                        title: 'Unforgiven II',
                        author: 'Metallica',
                        duration: '6.:36 min.'
                    }
                });
            mediaClient.musicCreate({
                title: 'Unforgiven II',
                author: 'Metallica',
                duration: '6:36 min.'
            }, function (error, response) {
                expect(JSON.parse(response).music.id).to.eql(3164494)
                done()
            })
        })

        it('should create music and respond as in resource file', function (done) {
            nock('https://api.example.com')
                .post('/musics', {
                    title: 'Smoke on the water',
                    author: 'Deep Purple',
                    duration: '5.40 min.'
                })
                .reply(200, function (uri, requestBody) {
                    return fs.createReadStream(path.normalize(__dirname + '/resources/new_music_response.json', 'utf8'))
                });
            mediaClient.musicCreate({
                title: 'Smoke on the water',
                author: 'Deep Purple',
                duration: '5.40 min.'
            }, function (error, response) {
                expect(JSON.parse(response).music.id).to.eql(3164495)
                done()
            })
        })

        it('it should create music and then delete', function(done) {
            nock('https://api.example.com')
                .post('/musics', {
                    title: 'Maps',
                    author: 'Maroon5',
                    duration: '5:00 min.'
                })
                .reply(200, {
                    music: {
                        id: 3164494,
                        title: 'Maps',
                        author: 'Maroon5',
                        duration: '7:00 min.'
                    }
                })
                .delete('/musics/' + 3164494)
                .reply(200, 'Music deleted')

            mediaClient.musicCreate({
                title: 'Maps',
                author: 'Maroon5',
                duration: '5:00 min.'
            }, function (error, response) {
                var musicId = JSON.parse(response).music.id
                expect(musicId).to.eql(3164494)
                mediaClient.musicDelete(musicId, function(error, response) {
                    expect(response).to.eql('Music deleted')
                    done()
                })
            })
        })
    })
})