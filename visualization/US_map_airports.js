// US map airports for Delay Mapper
// Updated for d3 v4

// Setup variables
var w = 1280;
var h = 800;

var menu = [{
    "title": "Season",
    "items": ["Spring", "Summer", "Fall", "Winter"]
    }, {
    "title": "Airline",
    "items": ["All", "American", "Delta", "Southwest", "United", "Alaska", "JetBlue", "Spirit"]
    }, {
    "title": "Display",
    "items": ["Arrival delay", "Taxi in time"]
    }];

var bodySelection = d3.select("body");

// Projection and map path
var path = d3.geoPath();
var projection = d3.geoAlbersUsa()
    .scale(1280)
    .translate([480, 300]);

// Containers
var svgContainer = bodySelection.insert("svg", "h2")
    .attr("width", w)
    .attr("height", h);

var titleMain = bodySelection.append("h2")
    .html("<span>U.S. commercial airports</span><br>Flight Delay Mapper");

var optionBar = bodySelection.insert("div")
    .attr("class", "bar");

var titleAuthor = bodySelection.append("h3")
    .text("Jeremy Smith 2017");

// Option bar setup
var optionBarTitle = optionBar.append("h3")
    .text("Map Options:");

var optionBarItems = optionBar.selectAll("p")
    .data(menu)
    .enter()
    .append("p")
    .text(function(d) {
        return d.title;
    });

// States and airport circles
var states = svgContainer.append("g")
    .attr("id", "states");

var circles = svgContainer.append("g")
    .attr("id", "circles");

// Load map data from us-atlas
d3.json("https://unpkg.com/us-atlas@1/us/10m.json", function(err, us) {
    if (err) throw err;
    states.selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter()
        .append("svg:path")
        .attr("d", path);
});

// Load aiport data from csv file
d3.csv("airports.csv", function(err, airports) {
    if (err) throw err;

    // Add correctly projected locations and highlighted bool
    airports.forEach(function(d, i) {
        airports[i].locations = projection([d.Longitude, d.Latitude]);
        airports[i].highlighted = false;
    });

    // Display all airport locations
    circles.selectAll("circle")
        .data(airports)
        .enter()
        .append("svg:circle")
        .attr("cx", function(d) {
            return d.locations[0];
        })
        .attr("cy", function(d) {
            return d.locations[1];
        })
        .attr("r", function(d) {
            return 0.2 * Math.pow(d.CY15enplane, 1/4);
        })
        .on("mouseover", function(d) {
            d3.select("h2 span").text(d.Name);
        })
        .on("mouseout", function(d) {
            d3.select("h2 span").text("U.S. commercial airports");
        })
        .on("click", function(d) {
            if (d.highlighted) {
                d.highlighted = false;
                d3.select(this).style("fill", "");
            } else {
                d.highlighted = true;
                d3.select(this).style("fill", "red");
            }
        });
});
