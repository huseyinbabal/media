var assert = require('assert');
var fs = require('fs');
var path = require('path');
var nock = require('nock');
var expect = require('expect.js');
var config = JSON.parse(fs.readFileSync(path.normalize(__dirname + '/config.json', 'utf8')));

describe('Foo NodeJS Client API Tests', function () {

    var Media = require('../lib/media');
    var mediaClient = new Media(config.token);
    nock.disableNetConnect();

    describe('Common Tests', function () {
        it('throws error on undefined token', function (done) {
            assert.throws(function () {
                var mediaClient = new Media()
            }, Error)
            done()
        })
    })
    describe('Music Tests', function () {
        it('should create a new music', function(done) {
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
            }, function(error, response) {
                expect(JSON.parse(response).music.id).to.eql(3164494)
                done()
            })
        })
    })
})