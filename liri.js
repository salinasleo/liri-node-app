require("dotenv").config();

const keys = require('./keys');
var Twitter = require("twitter");
var Spotify = require("node-spotify-api");
var request = require("request");
var inquirer = require("inquirer");
var fs = require("fs");

var command = process.argv[2];
var param = process.argv[3];

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

inquirer
    .prompt([
        // Here we give the user a list of commands to choose from.
        {
            type: "list",
            message: "Which command would you like to execute?",
            choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"],
            name: "command"
        },
        // Here we ask the user to confirm.
        {
            type: "input",
            message: "What movie/song you want, or how many tweets:",
            name: "param"
        }
    ])
    .then(function (inquirerResponse) {
        // If the inquirerResponse confirms, we displays the inquirerResponse's username and pokemon from the answers.
        console.log("Your command was to " + inquirerResponse.command + ": " + inquirerResponse.param);

        decideWhatToDo(inquirerResponse.command, inquirerResponse.param);

    });

var decideWhatToDo = function(a, b){
    if (a === "my-tweets") {
        myTweets(b);
    }
    else if (a === "spotify-this-song") {
        spotifyThisSong(b);
    }
    else if (a === "movie-this") {
        movieThis(b);
    }
    else if (a === "do-what-it-says") {
        doWhatItSays();
    }
}

var name = function (a) {
    return a.name;
}

var params = { screen_name: '@pompeyo76170924' };

function myTweets(maxtweets) {
    if (isNaN(maxtweets)) {
        maxtweets=20;
    }
    console.log("Running my-tweets function...");
    console.log("This will show your last " + maxtweets + " tweets and when they were created.")
    client.get("statuses/user_timeline", params, function (error, tweets, response) {
       
        if (!error) {
            for (i = 0; i < Math.min(maxtweets, tweets.length); i++) {
                console.log("tweet from " + tweets[i].created_at + ": " + tweets[i].text);
            };
        }
    }
    )
};

function spotifyThisSong(song) {
    console.log("Running spotify-this-song function...");
    console.log("This will show the following information about the song.")
    console.log("If no song is provided then your program will default to 'The Sign' by Ace of Base.")

    spotify.search({ type: 'track', query: song }, function (err, data) {
        if (err) {
            return console.log('Error found: ' + err);
        }

        console.log('Artist information: ' + data);
        var songs = data.tracks.items;
        for (i = 0; i < songs.length; i++) {
            console.log(
                "artist: " + songs[i].artists.map(name) + '\n' +
                " song name: " + songs[i].name + '\n' +
                " preview: " + songs[i].preview_url + '\n' +
                " album: " + songs[i].album.name
            );
            console.log("--------------------------------------------")
        }
    })
};

function movieThis(title) {
    console.log("Running movie-this function...");
    console.log("This will show the following information about the movie.")

    if (title === undefined) {
        title = "Mr Nobody";
        console.log("No title was provided, defaulting to 'Mr. Nobody'");
      }
    
      var omdb = "http://www.omdbapi.com/?t=" + title + "&y=&plot=full&tomatoes=true&apikey=trilogy";
    
      request(omdb, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          var parsedMovie = JSON.parse(body);
    
          console.log("Title: " + parsedMovie.Title + '\n' +
                    "Year: " + parsedMovie.Year + '\n' +
                    "Rated: " + parsedMovie.Rated + '\n' + 
                    "IMDB Rating: " + parsedMovie.imdbRating + '\n' +
                    "Country: " + parsedMovie.Country + '\n' +
                    "Language: " + parsedMovie.Language + '\n' +
                    "Plot: " + parsedMovie.Plot + '\n' +
                    "Actors: " + parsedMovie.Actors + '\n' +
                    "Rotten Tomatoes Rating: " + parsedMovie.Ratings[1].Value  
        );
        }
      });
    };

function doWhatItSays() {
    console.log("Running do-what-it-says function...");
    console.log("Using the fs Node package, LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.")

    fs.readFile("random.txt", "utf8", function(error, data) {
    
        var command = data.substring(0, data.indexOf(","));
        console.log(command);
        var param =  data.substring(data.indexOf(",") +1, data.length);
        console.log(param);
        decideWhatToDo(command, param);
    
      });
    };
