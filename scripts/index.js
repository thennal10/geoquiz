$(function () {
    // A global object to keep track of all the game variables and methods
    var Game = {
        allCountries: [], // Complete list of countries as objects
        // Hardcoded list of countries that aren't supposed to get asked
        banlistISO: ['ALA', 'ASM', 'AIA', 'ABW', 'BMU', 'BES', 'BVT', 'IOT', 'CYM', 'CXR', 'CCK', 'COK', 'CUW', 'FLK', 'FRO', 'GUF', 'PYF', 'ATF', 'GIB', 'GLP', 'GUM', 'GGY', 'HMD', 'VAT', 'IMN', 'JEY', 'MTQ', 'MYT', 'MSR', 'NCL', 'NIU', 'NFK', 'MNP', 'PCN', 'REU', 'BLM', 'SHN', 'MAF', 'SPM', 'SXM', 'SGS', 'SJM', 'TKL', 'TCA', 'UMI', 'VGB', 'VIR', 'WLF', 'ESH'],
        playableCountries: [], // The ones that actually get asked
        playableCountryNum: NaN,
        countriesConvert: {}, // For quick conversion from alpha3 codes to coords
        currentCountry: NaN, // Country object
        currentCountryIndex: -1, // In the playable countries list
        previousCountriesISO: [], // All previous countries (A3 codes)
        correctCountriesISO: [], // Countries guessed correctly
        incorrectCountriesISO: [], // Countries guessed wrong
        playing: false, // Whether the game has started
        score: 0,
        absScore: 0, // 1 for getting it exactly right, 0 otherwise
        startGame() {
            console.log("Game starting!");

            // Updates game state
            this.playing = true;
            shuffle(this.playableCountries);
            console.log(this.playableCountries);

            // Starts the game
            this.nextCountry();
        },
        nextCountry() {
            // If the game ended
            if (this.currentCountryIndex === (this.playableCountryNum - 1)) {
                this.finishGame();
            } else {
                // Updates game state
                this.currentCountryIndex += 1;
                this.currentCountry = this.playableCountries[this.currentCountryIndex];

                // Updates all the UI 
                $("#country-prompter").text(this.currentCountry.name);
                $("#scores-total").text('Score: ' + this.score.toFixed(2));
                $(".current-country").text(this.currentCountryIndex + 1);
            }
        },
        finishGame: function () {
            $('#totals-wrapper').show();
            $('#playing-wrapper').addClass('slideup');

            $('#final-score').text(this.score.toFixed(2) + '/' + this.playableCountryNum);
            $('#final-score-perc').text(((this.score * 100) / this.playableCountryNum).toFixed(2) + '%');
            $('#final-score-perc').css("color", getColor(this.score / this.playableCountryNum));

            $('#final-abs-score').text(this.absScore.toFixed(2) + '/' + this.playableCountryNum);
            $('#final-abs-score-perc').text(((this.absScore * 100) / this.playableCountryNum).toFixed(2) + '%');
            $('#final-abs-score-perc').css("color", getColor(this.absScore / this.playableCountryNum));
        }
    };
    // Get a list of countries
    $.getJSON("https://restcountries.eu/rest/v2/all", function (json) {
        Game.allCountries = json;

        for (var country of json) {
            // Adds every country to playableCountries except the ones in the banlist
            if (Game.banlistISO.indexOf(country["alpha3Code"]) == -1) {
                Game.playableCountries.push(country);
            };

            // An object for quick conversion from alpha3 codes to coords
            Game.countriesConvert[country["alpha3Code"]] = country["latlng"];
        };
        Game.playableCountryNum = Game.playableCountries.length;

        $('.total-countries').text(Game.playableCountryNum); // Set the total country length for any element that uses it
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
        map.setFilter('highlighted', ['in', 'ISO_A3', features[0]['properties']['ISO_A3']]);
    });

    map.on('mouseleave', 'countries', function () {
        map.getCanvas().style.cursor = '';
        map.setFilter('highlighted', ['in', 'ISO_A3', '']);
    });

    // Clickity click
    map.on('click', 'countries',  function (e) {
        if (Game.playing) {
            var features = map.queryRenderedFeatures(e.point);
            
            correct_code = Game.currentCountry['alpha3Code'];
            correct_location = Game.currentCountry['latlng'];
            guess_code = features[0]['properties']['ISO_A3'];
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
                    map.setFilter('correct', ['in', 'ISO_A3'].concat(Game.correctCountriesISO));
                } else {
                    var score = getScore(guess_location, correct_location); // calc score using distance
                    Game.incorrectCountriesISO.push(correct_code);
                    map.setFilter('incorrect', ['in', 'ISO_A3'].concat(Game.incorrectCountriesISO));
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
        var correct_code = Game.currentCountry['alpha3Code'];
        Game.previousCountriesISO.push(correct_code);
        Game.incorrectCountriesISO.push(correct_code);
        map.setFilter('incorrect', ['in', 'ISO_A3'].concat(Game.incorrectCountriesISO));

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