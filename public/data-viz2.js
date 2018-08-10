//Create SVG element and append map to the SVG
var svg2 = d3.select("#act-map")
	.append("svg")
	.attr("width", width)
	.attr("height", height)
	.call(responsivefy);
        
// Append Div for tooltip to SVG
var div2 = d3.select("#act-map")
    .append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

var g2 = svg2.append("g")

// Load in my states data!
d3.csv("data/act.csv", function(data) {

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
	g2.append("g")
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

	g2.append("g")
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
		.attr("fill", "#EFF6E0");

	});

});