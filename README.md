A simple quiz for the geography nerds among us.

### Score calculution

The distance between the country you guessed and the actual country is calculated with a modified version of
the Haversine forumla that gives a maximum value of 1. That value is fed into a steep exponentially
decreasing function (y = e<sup>-8x</sup>) to give a score between 0 and 1. Obviously, this system
will be a lot more lenient for, say, guessing countries in Europe as opposed to guessing countries in Africa,
but I had to make a compromise.

### 206 countries? There are only X countries in the world!

A - Eat shit. B - The UN recognizes 193 countries as, well, countries, but the only internationally recognized
system that uniformly assigns an *identifier* to each "country" is the ISO 3166 standard, which lists 249 designated
territories. This, however, includes dependant territories, and the quiz is hard enough without them, so I
pruned a lot of em out. However, I did leave in some well known ones, like Greenland and Hong Kong. Also, Antartica, because yes.
Here's the entire list of pruned countries in table form:

### The actual code

This thing is an absolute bodge, if you haven't guessed already, so I haven't really documented anything. The country data is sourced
from [restcountries.eu](https://restcountries.eu/),and Mapbox is for the actual map. Uses a custom tileset, with data from
[Natural Earth](http://www.naturalearthdata.com/). Something like LeafletJS or OpenStreetMap might've been better for this, 
but hey I already made most of it so ¯\\\_(ツ)_/¯.
