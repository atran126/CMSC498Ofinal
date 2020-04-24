var bgColor = "#eee";
var width = 1400;
var height = 700;

// Input from map HTML
function submission() {
  
}

// D3 Projection
var projection = d3.geoAlbersUsa()
    .translate([-3400, 800])
    .scale(16000)


// Define path generator
var path = d3.geoPath()
    .projection(projection)

var categories = ["No Data", "< $200,000", "$200,000-$300,000", "$300,000-$400,000", "> $400,000"]
var colors = ["#eee", "#bae4b3", "#74c476", "#31a354", "#006d2c"];

var green = d3.scaleOrdinal()
    .domain(categories)
    .range(colors)

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


        // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
        // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
        paths.on("mouseover", function(d) {
                $(".tooltip").empty();
                var county = d.properties["NAME"];
                div.transition()
                    .duration(200)
                    .style("opacity", .9);

                $(".tooltip").append(county)
                    .css("left", (d3.event.pageX) + "px")
                    .css("top", (d3.event.pageY - 28) + "px")

            })
            // fade out tooltip on mouse out
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        d3.json("http://localhost:8080/data/house_prices.json")
            .then(house_prices => {
                data = house_prices;

                // map realtor data to make it easier to access
                data = d3.nest()
                    .key(item => item.county)
                    .object(data);

                console.log(data);

                // fill in colors
                paths.style("fill", d => {
                    var county = d.properties["NAME"];

                    // no data, should we get find some?
                    if (!data[county]) {
                        return "#eee";
                    } else {
                        // some counties have 2 districts?
                        var n = data[county][0].median_list_price_county;
                        n = getCategory(n);
                        return colors[n]
                    }
                })
            });

        // add the data
        //         d3.json("http://localhost:8080/data/tuition.json")
        //             .then(tuition_data => {
        //
        //                 $("input[name='types']").click(updateForm);
        //                 $("input").click(updateMap);
        //
        //                 // get the right data, wrt user preferences
        //                 var formData = getFormData();
        //                 Object.getOwnPropertyNames(data).forEach(state => {
        //                     var d = data[state][formData.type][formData.res][formData.stat];
        //                 });
        //
        //                 // Bind the data to the SVG and create one path per GeoJSON feature
        //                 var paths = svg.selectAll("path")
        //                     .data(map_data.features)
        //                     .enter()
        //                     .append("path")
        //                     .attr("id", d => d.properties["NAME"])
        //                     .attr("d", path)
        //                     .style("stroke", "#fff")
        //                     .style("stroke-width", "1")
        //
        //                 // fill in colors
        //                 paths.style("fill", d => {
        //                     var state = d.properties["NAME"];
        //                     var n = data[state][formData.type][formData.res][formData.stat];
        //                     n = getCategory(n);
        //
        //                     return colors[n]
        //                 })
        //
        //
        //
        //
        //                 // update map colors with new selections
        //                 function updateMap() {
        //                     formData = getFormData();
        //                     paths.transition()
        //                         .duration(500)
        //                         .style("fill", d => {
        //                             var state = d.properties["NAME"];
        //                             var n = "#eee";
        //                             if (data[state][formData.type] != undefined && data[state][formData.type][formData.res] != undefined && data[state][formData.type][formData.res][formData.stat] != undefined) {
        //                                 n = data[state][formData.type][formData.res][formData.stat];
        //                                 n = getCategory(n);
        //                                 n = colors[n];
        //                             }
        //                             return n
        //                         });
        //                 }
        //             });

    });

// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
var legend = d3.select("body").append("svg")
    .attr("class", "legend")
    .attr("width", 140)
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

// returns true if the data value is numeric
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function getCategory(num) {
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
//
// function updateForm() {
//     var input = $(this);
//
//     resetForm()
//
//     var name = input.attr("name");
//     var value = input.attr("value");
//
//     if (name === "types") {
//         if (value === "all" || value == "public") {
//             var temp = $("input[name='res'][value='all']");
//             temp.prop("disabled", true);
//             if (temp.prop("checked")) {
//                 temp.prop("checked", false);
//                 $("input[name='res'][value='in_state']").prop("checked", true);
//             }
//         } else {
//             // private or for profit
//             $("input[name='res'][value='in_state']").prop("disabled", true);
//             $("input[name='res'][value='in_state']").prop("checked", false);
//             $("input[name='res'][value='out_state']").prop("disabled", true);
//             $("input[name='res'][value='out_state']").prop("checked", false);
//             $("input[name='res'][value='all']").prop("checked", true);
//         }
//     }
// }
//
// function getFormData() {
//     var data = $("#form").serializeArray();
//     var temp = {
//         type: data[0].value,
//         res: data[1].value,
//         stat: data[2].value
//     }
//
//     if (temp.type == "private" || temp.type == "for_profit") {
//         temp.res = "out_state"
//     }
//
//     return temp;
// }
//
// function resetForm() {
//     $("input").prop("disabled", false);
// }
