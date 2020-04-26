var legend;
var bgColor = "#eee";
var width = 1200;
var height = 700;

// function submission() {
//     rsubmission();
// }

// D3 Projection
var projection = d3.geoAlbersUsa()
    .translate([-3400, 800])
    .scale(16000)

// Define path generator
var path = d3.geoPath()
    .projection(projection)

var categories = {
    median_list_price_district: ["No Data", "< $200,000", "$200,000-$300,000", "$300,000-$400,000", "> $400,000"],
    median_list_price_county: ["No Data", "< $200,000", "$200,000-$300,000", "$300,000-$400,000", "> $400,000"],
    days_on_market_county: ["No Data", "0-50", "50-100", ">100"],
    days_on_market_district: ["No Data", "0-50", "50-100", ">100"],
    avg_school_rating: ["No Data", "1-3", "3-5", "5-7", "7-10"]
}

var colors = {
    median_list_price_district: ["#eee", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
    median_list_price_county: ["#eee", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
    days_on_market_county: ["#eee", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
    days_on_market_district: ["#eee", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
    avg_school_rating: ["#eee", "#bae4b3", "#74c476", "#31a354", "#006d2c"]
}

var green = {
    median_list_price_district: getScale("median_list_price_district"),
    median_list_price_county: getScale("median_list_price_county"),
    days_on_market_county: getScale("days_on_market_county"),
    days_on_market_district: getScale("days_on_market_district"),
    avg_school_rating: getScale("avg_school_rating")
}

function getScale(metric) {
    return d3.scaleOrdinal().domain(categories[metric]).range(colors[metric])
}

var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

//Create SVG element and append map to the SVG
var svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Append Div for tooltip to SVG
var div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// get the right data, wrt user preferences
var formData = getFormData();

// draw the map
d3.json("http://localhost:8080/data/md-counties.json")
    .then(map_data => {
        // Bind the data to the SVG and create one path per GeoJSON feature
        var paths = svg.selectAll("path")
            .data(map_data.features)
            .enter()
            .append("path")
            .attr("id", d => d.properties["NAME"].replace(/ +/g, ""))
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1");

        d3.json("http://localhost:8080/data/house_prices.json")
            .then(house_prices => {
                data = house_prices;
                $("input").click(updateMap);
                $("input").click(updateLegend);

                // map realtor data to make it easier to access
                data = d3.nest()
                    .key(item => item.county)
                    .object(data);

                // fill in colors
                paths.style("fill", d => {
                    var county = d.properties["NAME"];

                    // no data, should we get find some?
                    if (!data[county]) {
                        return "#eee";
                    } else {
                        var n = data[county][0][formData];
                        n = getCategory(n);
                        return colors[formData][n]
                    }
                })

                updateLegend();

                // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
                // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
                paths.on("mouseover", function(d) {
                        $(".tooltip").empty();
                        var county = d.properties["NAME"];

                        if (data[county] != undefined) {
                            var num = data[county][0][formData];
                            div.transition()
                                .duration(200)
                                .style("opacity", .9);

                            $(".tooltip").append(county)
                                .append("<hr>")
                                .append(data[county][0][formData])
                                .css("left", (d3.event.pageX) + "px")
                                .css("top", (d3.event.pageY - 28) + "px")
                        }
                    })
                    // fade out tooltip on mouse out
                    .on("mouseout", function(d) {
                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });

                // update map colors with new selections
                function updateMap() {
                    formData = getFormData();
                    paths.transition()
                        .duration(500)
                        .style("fill", d => {
                            var county = d.properties["NAME"];
                            var n = "#eee";
                            if (data[county] != undefined) {
                                n = data[county][0][formData];
                                n = getCategory(n);
                                n = colors[formData][n];
                            }
                            return n
                        });
                }
            });
    });

$("input").click(updateLegend);

// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
function updateLegend() {
    $("#legend").empty();
    legend = d3.select("#legend").append("svg")
        .attr("class", "legend")
        .attr("width", 140)
        .attr("height", 200)
        .selectAll("g")
        .data(green[formData].domain().slice())
        .enter()
        .append("g")
        .attr("transform", function(d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", green[formData]);

    legend.append("text")
        .data(categories[formData])
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d) {
            return d;
        });
}

// returns true if the data value is numeric
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function getCategory(num) {
    if (formData === "median_list_price_county" || formData === "median_list_price_district") {
        if (!isNumeric(num)) {
            return 0;
        } else if (num < 200000) {
            return 1;
        } else if (num < 300000) {
            return 2;
        } else if (num < 400000) {
            return 3;
        } else {
            return 4;
        }
    } else if (formData === "days_on_market_county" || formData === "days_on_market_district") {
        if (!isNumeric(num)) {
            return 0;
        } else if (num < 50) {
            return 1;
        } else if (num < 100) {
            return 2;
        } else {
            return 3;
        }
    } else if (formData === "avg_school_rating") {
        if (!isNumeric(num)) {
            return 0;
        } else if (num < 3) {
            return 1;
        } else if (num < 5) {
            return 2;
        } else if (num < 7) {
            return 3;
        } else {
            return 4;
        }
    }
}

function getFormData() {
    var data = $("#form").serializeArray();
    console.log(data);
    return !data.length == 0 ? data[0].value : "";
}