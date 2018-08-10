// https://brendansudol.com/writing/responsive-d3
function responsivefy(svg) {
    // get container + svg aspect ratio
    var container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        aspect = width / height;

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);

    // to register multiple listeners for same event type, 
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you call invoke this function for multiple svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on("resize." + container.attr("id"), resize);

    // get width of container and resize svg to fit it
    function resize() {
        var targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
    }

    // https://bl.ocks.org/curran/950cbe78b4c307fa14a1
	// Color legend.
    var colorScale = d3.scale.quantize()
        .domain(colorDomain)
        .range(colorRange);

    var colorLegend = d3.legend.color()
        .labelFormat(d3.format(".2f"))
        .scale(colorScale)
        .shapePadding(10)
        .shapeWidth(30)
        .shapeHeight(30)
        .labelOffset(12.5);

    var colorScaleLegend = svg.append("g")
    							.attr("class","color-legend")
    							.style("fill","#EFF6E0")
						        // .attr("transform", "translate(200, 60)")
						        .call(colorLegend);
}

// Borrowed from
// http://bl.ocks.org/michellechandra/0b2ce4923dc9b5809922

//Width and height of map
var width = 1000;
var height = 1000;

// D3 Projection
var projection = d3.geo.albersUsa()
	.translate([530, 230])    // translate to center of screen
	.scale([1000]);          // scale things down so see entire US
        
// Define path generator
var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
	.projection(projection);  // tell path generator to use albersUsa projection

const colorRange = ['#c1e7ff','#6996b3','#004c6d'];
const colorDomain = [0,50, 100]

// color range
var color = d3.scale.linear()
    .domain(colorDomain)
    .range(colorRange);

//Create SVG element and append map to the SVG
var svg = d3.select("#map")
	.append("svg")
	.attr("width", width)
	.attr("height", height)
	.call(responsivefy);
        
// Append Div for tooltip to SVG
var div = d3.select("#map")
    .append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

var g = svg.append("g")

// Load in my states data!
d3.csv("data/sat.csv", function(data) {

	// Load GeoJSON data and merge with states data
	d3.json("data/us-states.json", function(json) {

	// Loop through each state data value in the .csv file
	for (var i = 0; i < data.length; i++) {

		// Grab State Name
		var dataState = data[i]["State"];

		// Grab data value 
		var dataValue = data[i]["Participation"];

		// Find the corresponding state inside the GeoJSON
		for (var j = 0; j < json.features.length; j++)  {
			var jsonState = json.features[j].properties.name;

			if (dataState == jsonState) {
				// Copy the data value into the JSON
				json.features[j].properties.participation = dataValue; 

				// Stop looking through the JSON
				break;
			}
		}
	}
    // Bind the data to the SVG and create one path per GeoJSON feature
	g.append("g")
		.selectAll("path")
		.data(json.features)
		.enter()
		.append("path")
		.attr("d", path)
		.style("stroke", "#fff")
		.style("stroke-width", "1")
		.style("fill", function(d) {
			// Get data value
			var value = d.properties.participation;
			if (value != undefined){
				// return value
				return color(parseInt(value.replace("%","")))
			}

		})

	g.append("g")
		// https://stackoverflow.com/a/28306974/2548452
		.selectAll("text")
		.data(json.features)
		.enter()
		.append("svg:text")
		.text( d => d.properties.participation)
		.attr("x", function(d){
			return path.centroid(d)[0] - 12;
		})
		.attr("y", function(d){
			return  path.centroid(d)[1];
		})
		.attr("font-family", "Overpass Mono")
		.attr("font-size", "10px")
		.attr("fill", "black");

	});

});