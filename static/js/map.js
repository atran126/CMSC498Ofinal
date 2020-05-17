var legend, paths;
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

var categories = ["No Data", "< $200,000", "$200,000-$300,000", "$300,000-$400,000", "> $400,000"];
var colors = ["#eee", "#bae4b3", "#74c476", "#31a354", "#006d2c"];
var green = d3.scaleOrdinal().domain(categories).range(colors)
var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumSignificantDigits: 6
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

var formData = "median_price";

// draw the map
d3.json("http://localhost:8080/data/md-counties.json")
    .then(geo_json => {
        // Bind the data to the SVG and create one path per GeoJSON feature
        paths = svg.selectAll("path")
            .data(geo_json.features)
            .enter()
            .append("path")
            .attr("id", d => d.properties["NAME"].replace(/\W+/g, ""))
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1");

        d3.json("http://localhost:8080/data/houseprices-prettynames.json")
            .then(map_data => {
                // map realtor data to make it easier to access
                map_data = d3.nest()
                    .key(item => item.year)
                    .key(item => item.county)
                    .object(map_data);

                $("#dropdown").change(dropdownChange);
                $("input").click(updateMap(map_data, getYear()));
                $("input").click(updateLegend);
                $("path").click(mapClicked);
                paths.on("mouseover", function(d) {
                        $(".tooltip").empty();
                        var year = getYear();
                        var county = d.properties["NAME"];

                        if (map_data[year][county] != undefined) {
                            var num = map_data[year][county][0][formData];
                            num = getNum(num);
                            num = formatter.format(num);
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
                    .on("mouseout", function(d) {
                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });

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
                        return colors[n]
                    }
                })

                updateLegend();
                $("select").val(defaultCounty).trigger("change");
            });
    });

// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
function updateLegend() {
    $("#legend").empty();
    legend = d3.select("#legend").append("svg")
        .attr("class", "legend")
        .attr("width", 180)
        .attr("height", 200)
        .selectAll("g")
        .data(green.domain().slice())
        .enter()
        .append("g")
        .attr("transform", function(d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", green);

    legend.append("text")
        .data(categories)
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d) {
            return d;
        });
}

// update map colors with new selections
function updateMap(data, year) {
    paths.transition()
        .duration(500)
        .style("fill", d => {
            var county = d.properties["NAME"];
            var n = "#eee";

            // no data
            if (!data[year][county]) {
                return "#eee";
            } else {
                var n = data[year][county][0][formData];
                n = getCategory(n);
                return colors[n]
            }

            return n
        });
}

// returns true if the data value is numeric
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function getCategory(num) {
    if (!num) {
        return;
    }
    num = getNum(num);

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
}

function getNum(num) {
    if (num.charAt(0) === "$") {
        num = num.substring(1, num.length);
    }
    return parseFloat(num.replace(/,/g, ""));
}

function getYear() {
    return $("#time-div").attr("year");
}

function mapClicked() {
    $(".currentCounty").removeClass("currentCounty");
    var county = $(this).attr("id");
    $("#" + county).addClass("currentCounty");

    switch (county) {
        case "Allegany":
            county = "ALLEGANY COUNTY PUBLIC SCHOOLS";
            break;
        case "AnneArundel":
            county = "ANNE ARUNDEL CO SCHS";
            break;
        case "Charles":
            county = "CHARLES CO SCHS";
            break;
        case "Dorchester":
            county = "DORCHESTER CO SCHS";
            break;
        case "Howard":
            county = "HOWARD COUNTY SCHOOLS";
            break;
        case "Kent":
            county = "KENT COUNTY SCHOOLS";
            break;
        case "QueenAnnes":
            county = "QUEEN ANNES COUNTY SCHOOLS";
            break;
        case "StMarys":
            county = "ST MARYS CO SCHS";
            break;
        case "Talbot":
            county = "TALBOT CO SCHS";
            break;
        case "Washington":
            county = "WASHINGTON CO SCHS";
            break;
        case "BaltimoreCounty":
            county = "BALTIMORE COUNTY SCHOOLS";
            break;
        case "Calvert":
            county = "CALVERT CO SCHS";
            break;
        case "Caroline":
            county = "CAROLINE CO SCHS";
            break;
        case "Carroll":
            county = "CARROLL CO SCHS";
            break;
        case "Cecil":
            county = "CECIL COUNTY PUBLIC SCHOOLS";
            break;
        case "Frederick":
            county = "FREDERICK CO SCHOOLS";
            break;
        case "Garrett":
            county = "GARRETT COUNTY SCHOOLS";
            break;
        case "Harford":
            county = "HARFORD CO SCH";
            break;
        case "Montgomery":
            county = "MONTGOMERY COUNTY SCHOOLS";
            break;
        case "PrinceGeorges":
            county = "PRINCE GEORGES CO SCHS";
            break;
        case "Wicomico":
            county = "WICOMICO CO SCHOOLS";
            break;
        case "Worcester":
            county = "WORCESTER CO BOARD OF EDUCATION";
            break;
        case "BaltimoreCity":
            county = "BALTIMORE CITY SCHOOLS";
            break;
        case "Somerset":
            county = "SOMERSET CO SCHS";
            break;
        default:
            county = "";
            break;
    }

    $("select").val(county).trigger("change");
}

function dropdownChange() {
    var county = $(this).val();

    $(".currentCounty").removeClass("currentCounty");
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
            county = "#BaltimoreCounty";
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
    $(county).addClass("currentCounty");
}