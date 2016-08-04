var unirest = require('unirest');
var express = require('express');
var events = require('events');


//function for API requests that defines the endpoint and the arguments
var getFromApi = function(endpoint, args) {
    var emitter = new events.EventEmitter();
    unirest.get('https://api.spotify.com/v1/' + endpoint)
            //
           .qs(args)
           .end(function(response) {
                if (response.ok) {
                    emitter.emit('end', response.body);
                }
                else {
                    emitter.emit('error', response.code);
                }
            });
    return emitter;
};

var app = express();

//use frontend in public folder
app.use(express.static('public'));

// get req to api with end point and arguments object for the endpoint
app.get('/search/:name', function(req, res) {
    var searchReq = getFromApi('search', {
        //grabs search query from :name
        q: req.params.name,
        limit: 1,
        type: 'artist'
    });

    searchReq.on('end', function(item) {
        //searchReq returns an array as the result.
        var artist = item.artists.items[0];
        //get from related artists API with id argument
        var relatedReq = getFromApi('artists/'+artist.id;+'/related-artists', {
            id: req.params.id
        });

        relatedReq.on('end', function(item) {
            //define artists related as the returned related artists array
            artist.related = item.artists;
            //send back the artists object that now contains related artists
            res.json(artist)
        })

        relatedReq.on('error', function(code) {
            res.sendStatus(code);
        });

    })

    searchReq.on('error', function(code) {
        res.sendStatus(code);
    });
});

app.listen(8080);
