A simple quiz for the geography nerds among us. Made because coronavirus sucks and I'm very bored. Open up an issue if anything breaks.

## How does this work?

### The code
This thing is an absolute bodge, if you haven't guessed already, so I haven't really documented much. The country data is sourced
from [restcountries.eu](https://restcountries.eu/),and Mapbox is for the actual map. Uses a custom tileset, with data from
[Natural Earth](http://www.naturalearthdata.com/). Something like LeafletJS or OpenStreetMap might've been better for this, 
but hey I already made most of it so ¯\\\_(ツ)_/¯.

### Score calculution

The distance between the country you guessed and the actual country is calculated with a modified version of
the Haversine forumla that gives a maximum value of 1. That value is fed into a steep exponentially
decreasing function (y = e<sup>-8x</sup>) to give a score between 0 and 1. Obviously, this system
will be a lot more lenient for, say, guessing countries in Europe as opposed to guessing countries in Africa,
but I had to make a compromise.

### 201 countries? There are only X countries in the world!

A - Eat shit. B - The UN recognizes 193 countries as, well, countries, but the only internationally recognized
system that uniformly assigns an *identifier* to each "country" is the ISO 3166 standard, which lists 249 designated
territories. This, however, includes dependant territories, and the quiz is hard enough without them, so I
pruned a lot of em out. However, I did leave in some well known ones, like Greenland. Hong Kong, Taiwan, and Macau
are also included, because fuck China. Disputed territories are a spiky subject, but I went with how Natural Earth
drew the borders. In particular, Western Sahara isn't included, but Kosovo and Palestine are. Antartica is included too because yes.
Here's the entire list of pruned countries in table form:

| Country | Sovereignty | Notes|
| --- | --- | --- |
| Åland Islands | Finland | |
| American Samoa | United States | |
| Anguilla | United Kingdom | |
| Aruba | Netherlands | |
| Bermuda | United Kingdom | Am kind of tempted to add this in tbh |
| Bonaire, Sint Eustatius, and Saba | Netherlands | |
| Bouvet Island | Norway | |
| British Indian Ocean Territory | United Kingdom | |
| Cayman Islands | United Kingdom | |
| Christmas Island | Australia | |
| Cocos (Keeling) Islands | Australia | |
| Cook Islands | New Zealand | |
| Curaçao | Netherlands | |
| Falkland Islands | United Kingdom | |
| Faroe Islands | Denmark | |
| French Guiana | France | |
| French Polynesia | France | |
| French Southern Territories | France | |
| Gibraltar | United Kingdom | |
| Guadeloupe | France | |
| Guam | United States | |
| Guernsey | British Crown | |
| Heard Island and McDonald Islands | Australia | |
| Holy See | UN observer | Not included in the Natural Earth data |
| Isle of Man | British Crown | |
| Jersey | British Crown | |
| Martinique | France | |
| Mayotte | France | |
| Montserrat | United Kingdom | |
| New Caledonia | France | |
| Niue | New Zealand | |
| Norfolk Island | Australia | |
| Northern Mariana Islands | United States | |
| Pitcairn | United Kingdom | |
| Réunion | France | |
| Saint Barthélemy | France | |
| Saint Helena, Ascension Island, and Tristan da Cunha | United Kingdom | |
| Saint Martin (French part) | France | |
| Saint Pierre and Miquelon | France | |
| Sint Maarten (Dutch part) | Netherlands | |
| South Georgia and the South Sandwich Islands | United Kingdom | |
| Svalbard and Jan Mayen | Norway | Arctic Code Vault 🤞 |
| Tokelau | New Zealand | |
| Turks and Caicos Islands | United Kingdom | |
| United States Minor Outlying Islands | United States | |
| Virgin Islands (British) | United Kingdom | |
| Virgin Islands (U.S.) | United States | |
| Wallis and Futuna | France | |
| Western Sahara | Disputed | Not included in the Natural Earth data |
