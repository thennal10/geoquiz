$(function () {
    // A global object to keep track of all the game variables and methods
    var Game = {
        allCountries: NaN,
        totalCountryNum: NaN,
        countriesConvert: {},
        currentCountry: NaN,
        currentCountryIndex: -1,
        previousCountriesISO: [],
        correctCountriesISO: [],
        incorrectCountriesISO: [],
        playing: false,
        score: 0,
        absScore: 0,
        startGame() {
            console.log("Game starting!");

            // Updates game state
            this.playing = true;
            shuffle(this.allCountries);

            // Starts the game
            this.nextCountry();
        },
        nextCountry() {
            // If the game ended
            if (this.currentCountryIndex === (this.totalCountryNum - 1)) {
                this.finishGame();
            } else {
                // Updates game state
                this.currentCountryIndex += 1;
                this.currentCountry = this.allCountries[this.currentCountryIndex];
                console.log(this.currentCountry)

                // Updates all the UI 
                $("#country-prompter").text(this.currentCountry.name);
                $("#scores-total").text('Score: ' + this.score.toFixed(2));
                $(".current-country").text(this.currentCountryIndex + 1);
            }
        },
        finishGame: function () {
            $('#totals-wrapper').show();
            $('#playing-wrapper').addClass('slideup');

            $('#final-score').text(this.score.toFixed(2) + '/' + this.totalCountryNum);
            $('#final-score-perc').text(((this.score * 100) / this.totalCountryNum).toFixed(2) + '%');
            $('#final-score-perc').css("color", getColor(this.score / this.totalCountryNum));

            $('#final-abs-score').text(this.absScore.toFixed(2) + '/' + this.totalCountryNum);
            $('#final-abs-score-perc').text(((this.absScore * 100) / this.totalCountryNum).toFixed(2) + '%');
            $('#final-abs-score-perc').css("color", getColor(this.absScore / this.totalCountryNum));
        }
    };
    // Get a list of countries (this is an utter bodge but hey it works)
    $.getJSON("https://raw.githubusercontent.com/thennal10/country-quiz/master/data/country_centroids.json", function (json) {
        Game.allCountries = json;
        Game.totalCountryNum = json.length;
        for (i = 0; i < json.length; i++) {
            Game.countriesConvert[json[i]["A3"]] = json[i]["latlng"];
        };
        $('.total-countries').text(json.length) // Set the total country length for any element that uses it
    });

    // Init map
    mapboxgl.accessToken = 'pk.eyJ1IjoicHJlbWVkaXRhdG9yIiwiYSI6ImNrZDNlYmI1bzFtaXUyc3B2dzZscWkwMTgifQ.ngnb5HaLQsS9B1oT5y8oXA';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/premeditator/ckcxq6d5x13w61imu4vpp9gjc', // mapbox stylesheet location
        center: [45, 15], // starting position [lng, lat]
        zoom: 2 // starting zoom
    });

    // Highlighting for selection
    map.on('mousemove', 'countries', function (e) {
        var features = map.queryRenderedFeatures(e.point);
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';
        map.setFilter('highlighted', ['in', 'ADM0_A3', features[0]['properties']['ADM0_A3']]);
    });

    map.on('mouseleave', 'countries', function () {
        map.getCanvas().style.cursor = '';
        map.setFilter('highlighted', ['in', 'ADM0_A3', '']);
    });

    // Clickity click
    map.on('click', 'countries',  function (e) {
        if (Game.playing) {
            var features = map.queryRenderedFeatures(e.point);
            
            correct_code = Game.currentCountry['A3'];
            correct_location = Game.currentCountry['latlng'];
            guess_code = features[0]['properties']['ADM0_A3'];
            guess_location = Game.countriesConvert[guess_code];

            // If you just clicked on a country you've already guessed
            if (Game.previousCountriesISO.includes(guess_code)) {
                /// TODO
            } else {
                // Adds it to the list of previous countries
                Game.previousCountriesISO.push(correct_code);

                // If the guess is correct, stores the value in a variable and updates the filter 
                if (correct_code === guess_code) {
                    var score = 1; // full score for correct guess
                    Game.absScore += 1;
                    Game.correctCountriesISO.push(correct_code);
                    map.setFilter('correct', ['in', 'ADM0_A3'].concat(Game.correctCountriesISO));
                } else {
                    var score = getScore(guess_location, correct_location); // calc score using distance
                    Game.incorrectCountriesISO.push(correct_code);
                    map.setFilter('incorrect', ['in', 'ADM0_A3'].concat(Game.incorrectCountriesISO));
                }

                // Fly to the correct location
                map.flyTo({center: correct_location.reverse()});

                // Yeets score to score-plus span and sets its color
                $('#scores-plus').text('+' + score.toFixed(2));
                $('#scores-plus').css("color", getColor(score));

                // Updates the score
                Game.score += score;
                Game.nextCountry();
            }
        }
    });

    // Detects click on the start button, and calls a function
    $('#start-button').click(function () {
        $('#playing-wrapper').show();
        $('#start-button').addClass('slideup');

        // The button *should* disappear when you click on it, but just in case
        if (!Game.playing) {
            Game.startGame();
        };
    });

    // When the skip button is clicked
    $('#skip').click(function () {
        // Adds it to the list of previous countries and sets the filter
        var correct_code = Game.currentCountry['A3'];
        Game.previousCountriesISO.push(correct_code);
        Game.incorrectCountriesISO.push(correct_code);
        map.setFilter('incorrect', ['in', 'ADM0_A3'].concat(Game.incorrectCountriesISO));

        // Fly to the correct location
        map.flyTo({ center: Game.currentCountry['latlng'].reverse() });
        Game.nextCountry();
    });

    $('#about-button').click(function () {
        $('#about').show();
    });

    $('.close').click(function () {
        $('#about').hide();
    });

    $('#about').click(function () { // #about is the bg
        $('#about').hide();
    });

    $('#about-content').click(function (e) {
        e.stopPropagation();
    });

    // Durstenfeld shuffle algorithm
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        };
    };

    // Gets the colour for the score indicator
    function getColor(value) {
        //value from 0 to 1
        var hue = (value * 120).toString(10);
        return ["hsl(", hue, ",60%,45%)"].join("");
    };

    function getScore(p1, p2) {
        // points in [latitude, longitude] order
        // Uses the Haversine formula to get the distance between two points
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(p2[0] - p1[0]);
        var dLong = rad(p2[1] - p1[1]);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(p1[0])) * Math.cos(rad(p2[0])) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        // From 0 to 1, depending on how far the two points are
        var relative_dist = c / Math.PI

        // Basic steep exponentially decreasing function (e^-8x)
        return Math.E ** ((-8) * relative_dist)
    };

    // Degree to radians
    function rad(x) {
        return x * Math.PI / 180;
    };

});