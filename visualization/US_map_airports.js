// US map airports for Delay Mapper
// Updated for d3 v4

// Function for scaling circle radii
function scalingFunction(n) {
    return 0.25 * Math.pow(n, 1/4);
}

// Setup variables
var w = 1280;
var h = 800;

var circleRadii = [500000, 5000000, 50000000];

var menu = [{
    "title": "Season",
    "items": ["Spring", "Summer", "Fall", "Winter"]
    }, {
    "title": "Airline",
    "items": ["All", "American", "Delta", "Southwest",
            "United", "Alaska", "JetBlue", "Spirit"],
    "codes": ["ALL", "AA", "DL", "WN", "UA", "AS", "B6", "NK"]
    }, {
    "title": "Display",
    "items": ["Percent delayed", "Arrival delay", "Taxi in time"],
    "descr": ["% Flights delayed on arrival by more than 15 min",
            "Average delay time on arrival (min)",
            "Average taxi in time on arrival (min)"]
    }];

var bodySelection = d3.select("body");

var colorScalePercent = d3.scaleSequential(d3.interpolateRdYlGn)
    .domain([24.0, 10.0]);

var colorScaleDelTime = d3.scaleSequential(d3.interpolateRdYlGn)
    .domain([1.0, -10.0]);

var colorScaleTime = d3.scaleSequential(d3.interpolateRdYlGn)
    .domain([10.0, 0.0]);

// Projection and map path
var path = d3.geoPath();
var projection = d3.geoAlbersUsa()
    .scale(1280)
    .translate([480, 300]);

// Containers and titles
var svgContainer = bodySelection.insert("svg")
    .attr("width", w)
    .attr("height", h);

var titleMain = bodySelection.append("h2")
    .html("<span>U.S. Commercial Airports</span><br>Flight Delay Mapper");

var titleInfo = bodySelection.append("h3")
    .text("Click on airports to display color")
    .attr("class", "info");

var optionBar = bodySelection.append("div")
    .attr("class", "bar");

var titleAuthor = bodySelection.append("h3")
    .text("Jeremy Smith 2017");

var scaleBarContainer = bodySelection.append("div")
    .attr("class", "sbbot");

var scaleBarsvgContainer = scaleBarContainer.append("svg")
    .attr("width", 400)
    .attr("height", 75);

var scaleCirclesContainer = bodySelection.append("div")
    .attr("class", "sbright");

var scaleCirclessvgContainer = scaleCirclesContainer.append("svg")
    .attr("width", 200)
    .attr("height", 50);

// Option bar setup
var optionBarTitle = optionBar.append("h3")
    .text("Map Options:");

var optionBarItems = optionBar.selectAll("p")
    .data(menu)
    .enter()
    .append("p")
    .text(function(d, i) {
        return d.title;
    })
    .on("mouseenter", menuMouseEnterHandler)
    .on("mouseleave", menuMouseLeaveHandler);

function menuMouseEnterHandler(d) {
    var menuItemContainer = d3.select(this)
    .append("div")
    .attr("class", "menuitem");

    menuItemContainer.selectAll("a")
    .data(d.items)
    .enter()
    .append("a")
    .attr("href", function(d) {
        return "#" + d;
    })
    .text(function(d) {
        return d;
    });
}

function menuMouseLeaveHandler() {
    d3.select(this)
    .select("div")
    .remove();
}

// Scale bar setup
var colorBar = d3.legendColor()
    .title(menu[2].descr[0])
    .labels([">24","","22","","20","","18","","16","","14","","12","", "<10"])
    .ascending(true)
    .orient("horizontal")
    .cells(15)
    .shape("rect")
    .shapePadding(0)
    .scale(colorScalePercent);

var scaleBar = scaleBarsvgContainer.append("g")
    .attr("transform", "translate(0,24)")
    .call(colorBar);

var scaleCircles = scaleCirclessvgContainer.selectAll("circle")
    .data(circleRadii)
    .enter()
    .append("svg:circle")
    .attr("cx", 175)
    .attr("cy", function(d) {
        return 50 - scalingFunction(d);
    })
    .attr("r", function(d) {
        return scalingFunction(d);
    });

var scaleTitle = scaleCirclesContainer.append("p")
    .html("Passengers per year<br>0.5, 5, 50 million");

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

// Load airport and delay data from csv files
d3.csv("data/airports_wdelaydata_ALL_ALL.csv", function(err, airports) {
    if (err) throw err;

    // Add correctly projected locations and highlighted bool
    airports.forEach(function(d, i) {
        airports[i].locations = projection([d.Longitude, d.Latitude]);
        airports[i].highlighted = false;
    });

    // Display all airport locations as circles
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
            return scalingFunction(d.CY15enplane);
        })
        .on("mouseover", function(d) {
            d3.select("h2 span").text(d.Name);
        })
        .on("mouseout", function(d) {
            d3.select("h2 span").text("U.S. Commercial Airports");
        })
        .on("click", function(d) {
            if (d.highlighted) {
                d.highlighted = false;
                d3.select(this).style("fill", "");
            } else {
                d.highlighted = true;
                color = colorScalePercent(d.PercentArrDel15);
                d3.select(this).style("fill", color);
            }
        });
});
