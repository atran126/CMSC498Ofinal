var legend;
var bgColor = "#eee";
var width = 650;
var height = 450;

// D3 Projection
var projection = d3.geoAlbersUsa()
    .translate([-2250, 500])
    .scale(10000)

// Define path generator
var path = d3.geoPath()
    .projection(projection)

var categories = {
    median_price: ["No Data", "< $200,000", "$200,000-$300,000", "$300,000-$400,000", "> $400,000"],
    median_list_price_district: ["No Data", "< $200,000", "$200,000-$300,000", "$300,000-$400,000", "> $400,000"],
    median_list_price_county: ["No Data", "< $200,000", "$200,000-$300,000", "$300,000-$400,000", "> $400,000"],
    days_on_market_county: ["No Data", "0-50", "50-100", ">100"],
    days_on_market_district: ["No Data", "0-50", "50-100", ">100"],
    avg_school_rating: ["No Data", "1-3", "3-5", "5-7", "7-10"]
}

var colors = {
    median_price: ["#eee", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
    median_list_price_district: ["#eee", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
    median_list_price_county: ["#eee", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
    days_on_market_county: ["#eee", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
    days_on_market_district: ["#eee", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
    avg_school_rating: ["#eee", "#bae4b3", "#74c476", "#31a354", "#006d2c"]
}

var green = {
    median_price: getScale("median_price"),
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

const zoom = d3.zoom().on("zoom", zoomed);

function zoomed() {
    console.log("zoomed");
    console.log(event);
    // svg.style("stroke-width", 1.5 / d3.event.transform.k + "px");
    // g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
    svg.attr("transform", 50); // updated for d3 v4
}

// get the right data, wrt user preferences
var formData = getFormData();


// draw the map
d3.json("http://localhost:8080/data/md-counties.json")
    .then(geo_json => {
        // Bind the data to the SVG and create one path per GeoJSON feature
        var paths = svg.selectAll("path")
            .data(geo_json.features)
            .enter()
            .append("path")
            .attr("id", d => d.properties["NAME"].replace(/\W+/g, ""))
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1");

        d3.json("http://localhost:8080/data/house_prices_historical.json")
            .then(map_data => {
                $("#dropdown").change(dropdownChange);
                $("input").click(updateMap);
                $("input").click(updateLegend);
                $("#time-div").change(updateMap)
                // .change(updateLegend);
                // d3.select("#dropdown").on("change", zoomMap)

                tooltips();

                // map realtor data to make it easier to access
                map_data = d3.nest()
                    .key(item => item.year)
                    .key(item => item.county)
                    .object(map_data);

                function getYear() {
                    return $("#time-label").attr("year");
                }

                // fill in colors
                paths.style("fill", d => {
                    var year = getYear();
                    var county = d.properties["NAME"];

                    // no data, should we get find some?
                    if (!map_data[year][county]) {
                        return "#eee";
                    } else {
                        var n = map_data[year][county][0][formData];
                        n = getCategory(n);
                        return colors[formData][n]
                    }
                })

                updateLegend();
                tooltips();

                // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
                // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
                function tooltips() {
                    paths.on("mouseover", function(d) {
                            $(".tooltip").empty();
                            var year = getYear();
                            var county = d.properties["NAME"];

                            if (map_data[year][county] != undefined) {
                                var num = map_data[year][county][0][formData];
                                div.transition()
                                    .duration(200)
                                    .style("opacity", .9);

                                $(".tooltip").append(county)
                                    .append("<hr>")
                                    .append(num)
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
                }



                // update map colors with new selections
                function updateMap() {
                    formData = getFormData();
                    paths.transition()
                        .duration(500)
                        .style("fill", d => {
                            var county = d.properties["NAME"];
                            var year = getYear();
                            var n = "#eee";
                            if (map_data[year][county] != undefined) {
                                n = map_data[year][county][0][formData];
                                n = getCategory(n);
                                n = colors[formData][n];
                            }
                            return n
                        });
                }

                function zoomMap(d) {
                    console.log(d);
                    const [
                        [x0, y0],
                        [x1, y1]
                    ] = path.bounds(d);
                    d3.event.stopPropagation();
                    svg.transition().duration(750).call(
                        zoom.transform,
                        d3.zoomIdentity
                        .translate(width / 2, height / 2)
                        .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                        d3.mouse(svg.node())
                    );
                }

                function zoomed() {
                    const {
                        transform
                    } = d3.event;
                    g.attr("transform", transform);
                    g.attr("stroke-width", 1 / transform.k);
                }
            });
    });

$("input").click(updateLegend);

// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
function updateLegend() {
    $("#legend").empty();
    legend = d3.select("#legend").append("svg")
        .attr("class", "legend")
        .attr("width", 180)
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

function dropdownChange() {
    $(".currentCounty").removeClass("currentCounty");
    var county = $(this).val();
    var i = -1;

    switch (county) {
        case "ALLEGANY COUNTY PUBLIC SCHOOLS":
            county = "#Allegany";
            i = 0;
            break;
        case "ANNE ARUNDEL CO SCHS":
            county = "#AnneArundel";
            i = 1;
            break;
        case "CHARLES CO SCHS":
            county = "#Charles";
            i = 2;
            break;
        case "DORCHESTER CO SCHS":
            county = "#Dorchester";
            i = 3;
            break;
        case "HOWARD COUNTY SCHOOLS":
            county = "#Howard";
            i = 4;
            break;
        case "KENT COUNTY SCHOOLS":
            county = "#Kent";
            i = 5;
            break;
        case "QUEEN ANNES COUNTY SCHOOLS":
            county = "#QueenAnnes";
            i = 6;
            break;
        case "ST MARYS CO SCHS":
            county = "#StMarys";
            i = 7;
            break;
        case "TALBOT CO SCHS":
            county = "#Talbot";
            i = 8;
            break;
        case "WASHINGTON CO SCHS":
            county = "#Washington";
            i = 9;
            break;
        case "BALTIMORE COUNTY SCHOOLS":
            county = "#Baltimore";
            i = 10;
            break;
        case "CALVERT CO SCHS":
            county = "#Calvert";
            i = 11;
            break;
        case "CAROLINE CO SCHS":
            county = "#Caroline";
            i = 12;
            break;
        case "CARROLL CO SCHS":
            county = "#Carroll";
            i = 13;
            break;
        case "CECIL COUNTY PUBLIC SCHOOLS":
            county = "#Cecil";
            i = 14;
            break;
        case "FREDERICK CO SCHOOLS":
            county = "#Frederick";
            i = 15;
            break;
        case "GARRETT COUNTY SCHOOLS":
            county = "#Garrett";
            i = 16;
            break;
        case "HARFORD CO SCH":
            county = "#Harford";
            i = 17;
            break;
        case "MONTGOMERY COUNTY SCHOOLS":
            county = "#Montgomery";
            i = 18;
            break;
        case "PRINCE GEORGES CO SCHS":
            county = "#PrinceGeorges";
            i = 19;
            break;
        case "WICOMICO CO SCHOOLS":
            county = "#Wicomico";
            i = 20;
            break;
        case "WORCESTER CO BOARD OF EDUCATION":
            county = "#Worcester";
            i = 21;
            break;
        case "BALTIMORE CITY SCHOOLS":
            county = "#BaltimoreCity";
            i = 22;
            break;
        case "SOMERSET CO SCHS":
            county = "#Somerset";
            i = 23;
            break;
        default:
            county = "";
            i = -1;
            break;

    }
    // var c = geo_json.features[i];
    // console.log(c);
    $(county).addClass("currentCounty");


    // var bounds = path.bounds(c),
    //     dx = bounds[1][0] - bounds[0][0],
    //     dy = bounds[1][1] - bounds[0][1],
    //     x = (bounds[0][0] + bounds[1][0]) / 2,
    //     y = (bounds[0][1] + bounds[1][1]) / 2,
    //     scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
    //     translate = [width / 2 - scale * x, height / 2 - scale * y];
    //
    // svg.transition()
    //     .duration(750)
    //     // .call(zoom.translate(translate).scale(scale).event); // not in d3 v4
    //     .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)); // updated for d3 v4
    //
    //
    // console.log("CHANGED: " + county);
    // console.log(bounds);

}

// returns true if the data value is numeric
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function getCategory(num) {
    if (!num) {
        return;
    }
    num = parseInt(num.replace(/\W+/g, ""));
    if (formData === "median_price" || formData === "median_list_price_county" || formData === "median_list_price_district") {
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
    var form_data = $("#form").serializeArray();
    return !form_data.length == 0 ? form_data[0].value : "";
}