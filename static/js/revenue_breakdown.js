$(document).ready(function() {
    // var dropdown = document.getElementById("dropwdown");
    d3.csv("http://localhost:8080/data/new_school_data.csv")
        .then(jsonTuples => {
            makeRevenueChart(jsonTuples, defaultCounty, defaultYear.toString());

            $("#dropdown").change(function() {
                // update HTML attribute so current county is accessible
                // document.getElementById("dropdown").setAttribute("county", this.value);
                // var year = document.getElementById("time-div").getAttribute("year");
                // var county = document.getElementById("dropdown").getAttribute("county");
                var county = $(this).val();
                makeRevenueChart(jsonTuples, county, currentYear.toString());
            });
        })
        .catch(e => console.log(e));
})


/* Retreives all data from a certain year for specified county */
function getCountyData(allData, year, county) {
    for (var i = 0; i < allData.length; i++) {
        //console.log(allData[i].NAME + " " + county + allData[i].Year + " " + parseInt(year));
        if (allData[i].Year === year && allData[i].NAME === county) {
            return allData[i];
        }
    }
}

/* formats data for chart */


function makeRevenueChart(allData, county, year) {
    var chart = document.getElementById("revenue-breakdown");


    var margins = {
        tp: 20,
        btm: 50,
        lft: 100,
        rt: 30
    };
    var width = 350;
    var height = 250;
    $("#revenue-breakdown").empty();

    var countyData = getCountyData(allData, year, county);
    // console.log(countyData);
    // within county data, get data to graph
    var graphData = isolateData(countyData);
    updateFundingText(countyData.TOTALREV);
    updatePerPupilText(numberWithCommas(countyData.PPCSTOT));

    var xBand = d3.scaleBand()
        .domain(graphData.map(d => d.name))
        .range([margins.lft, width - margins.rt])
        .paddingInner(0.1);

    // Height scale function
    var hScale = d3.scaleLinear()
        .domain([1, graphData[0].value])
        .range([height - margins.btm - margins.tp, 0]);


    var color = d3.scaleOrdinal()
        .domain(graphData.map(d => d.name))
        .range(d3.schemeCategory10);

    d3.select(chart)
        .selectAll("rect")
        .data(graphData)
        .enter()
        .append("rect")
        .attr("x", d => xBand(d.name) + "px")
        .attr("y", d => margins.tp + hScale(d.value) + "px")
        .attr("width", xBand.bandwidth())
        .attr("height", d => (height - margins.tp - margins.btm - hScale(d.value)))
        .attr("fill", (d) => color(d.name))
        .append("svg:title")


        // Add correct hover over text
        .text(function(d) {
            ret_val = d.long_name + ": " + d.value + " students";
            return ret_val;

        });


    // X-axis

    d3.select(chart)
        .append("g")
        .attr("transform", `translate(0,${height - margins.btm})`)
        .call(d3.axisBottom(xBand))
        .selectAll("text")
        .attr("transform", "translate(0,0) rotate(-20)")
        .style("text-anchor", "end");

    // Y-axis
    d3.select(chart)
        .append("g")
        .attr("transform", `translate(${margins.lft}, ${margins.tp})`)
        .call(d3.axisLeft(hScale));

    // Y-axis label
    d3.select(chart)
        .append("text")
        .attr("x", 0 - height / 2)
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Revenue (FY$)");
    /*
    var revenue = ["Total", "Federal", "State", "Local"];
    //red, beige, grey, yellow, black,
    var color_range = ["#cf3502", "#fcf6dc", "#b3b3b3", "#f2ca18", "#0d0607"];
    var keys = ["cat1", "cat2", "cat3", "cat4"];

    // xBand
    var xBand = d3.scaleBand()
        .domain(revenue)
        .range([margins.lft, width - margins.rt])
        .paddingInner(0.1);

    // Height scale function
    var hScale = d3.scaleLinear()
        .domain([1, graphData[0].value])
        .range([height - margins.btm - margins.tp, 0]);

    // Color scale
    var color = d3.scaleOrdinal()
        .domain(revenue)
        .range(color_range);


    // Inspired by http://bl.ocks.org/mstanaland/6100713 for stacked bar chart
    var stack = d3.stack()
        .keys(keys);
    var stacked_data = stack(graphData);
    var legend_vals = ["General", "Special Education", "Other School Systems", "Misc", "Other"];

    d3.select(chart)
        .append("g")
        .selectAll("g")
        .data(stacked_data)
        .enter().append("g")

        .selectAll("rect")

        // loop subgroup per subgroup to add stacked bars
        .data(function(d) {
            return d;
        })
        .enter().append("rect")
        .attr("x", (d) => xBand(d.data.name) + "px")
        .attr("y", (d) => margins.tp + hScale(d[1]) + "px")
        .attr("height", function(d) {
            return hScale(d[0]) - hScale(d[1]);
        })
        .attr("width", xBand.bandwidth())
        .attr("fill", function(d) {
            var val = d[1] - d[0];
            // Red for General
            if (d.data.cat1 === val) {
                return color_range[0];
            } else if (d.data.cat2 === val) {
                // Grey for other schools
                if (d.data.name === "Local") {
                    return color_range[2];
                }
                // Beige for Special Ed
                else {
                    return color_range[1];
                }
            }
            // Yellow for misc
            else if (d.data.cat3 === val) {
                return color_range[3];
            }
            // Black for other
            else {
                return color_range[4];
            }
        })
        .append("svg:title")

        // Add correct hover over text
        .text(function(d) {
            var val = d[1] - d[0];
            if (d.data.cat1 == val) {
                return d.data.cat1display;
            } else if (d.data.cat2 == val) {
                return d.data.cat2display;
            } else if (d.data.cat3 == val) {
                return d.data.cat3display;
            } else {
                return d.data.cat4display;
            }

        });




    // X-axis
    d3.select(chart)
        .append("g")
        .attr("transform", `translate(0,${height - margins.btm})`)
        .call(d3.axisBottom(xBand));

    // Y-axis
    d3.select(chart)
        .append("g")
        .attr("transform", `translate(${margins.lft}, ${margins.tp})`)
        .call(d3.axisLeft(hScale));

    // Y-axis label
    d3.select(chart)
        .append("text")
        .attr("x", 0 - height / 2)
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Revenue($)");

    // Prep the tooltip bits, initial display is hidden
    var tooltip = d3.select(chart).append("g")
        .attr("class", "tooltip")
        .style("display", "none");

    tooltip.append("rect")
        .attr("width", 60)
        .attr("height", 20)
        .attr("fill", "white")
        .style("opacity", 0.5);

    tooltip.append("text")
        .attr("x", 30)
        .attr("dy", "1.2em")
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold");

    // Legend
    var legend = d3.select(chart).append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(legend_vals.slice())
        .enter().append("g")
        .attr("transform", function(d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", function(d, i) {
            return (color_range[i]);
        });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text((d) => d);
        */

}

// Filters the json data so that it only returns funding for a specific county
function isolateData(countyData) {
    var obj = [];


    var total = {};
    var federal = {};
    var state = {};
    var local = {};
    var olocal = {};
    total.value = countyData.TOTALREV;
    total.name = "Total";
    total.long_name = "Total";
    federal.value = countyData.TFEDREV;
    federal.name = "Federal";
    federal.long_name = "Federal";
    state.value = countyData.TSTREV;
    state.name = "State";
    state.long_name = "State"
    local.value = countyData.TLOCREV;
    local.name = "Local";
    local.long_name = "Local";
    olocal.value = countyData.other_local;
    olocal.name = "Other";
    olocal.long_name = "Miscellaneous Local Funding";

    /*
    total.value = countyData.TOTALREV;
    total.name = "Total";
    total.cat1 = 0;
    total.cat2 = 0;
    total.cat3 = 0;
    total.cat4 = parseInt(countyData.TOTALREV);

    total.cat1display = "";
    total.cat2display = "";
    total.cat3display = "";
    total.cat4display = "Total: $" + total.cat4;

    federal.value = countyData.TFEDREV;
    federal.name = "Federal";
    // Adding categories for stacked bars
    federal.cat1 = parseInt(countyData.FEDRCOMP);
    federal.cat2 = parseInt(countyData.FEDRSPEC);
    federal.cat3 = parseInt(countyData.FEDRNUTR);
    federal.cat4 = parseInt(countyData.FEDROTHR);

    // Adding items for tooltip
    federal.cat1display = "Compensatory(Title I): $" + federal.cat1;
    federal.cat2display = "Children with disabilites: $" + federal.cat2;
    federal.cat3display = "Child Nutrition Act: $" + federal.cat3;
    federal.cat4display = "All other federal aid: $" + federal.cat4;



    state.value = countyData.TSTREV;
    state.name = "State";

    state.cat1 = parseInt(countyData.STRFORM);
    state.cat2 = parseInt(countyData.STRSPEC);
    state.cat3 = parseInt(countyData.STRTRANS);
    state.cat4 = parseInt(countyData.STROTHR);

    // Adding items for tooltip
    state.cat1display = "General formula assistance: $" + state.cat1;
    state.cat2display = "Special education programs: $" + state.cat2;
    state.cat3display = "Transportation programs : $" + state.cat3;
    state.cat4display = "All other state revenue: $" + state.cat4;

    local.value = countyData.TLOCREV;
    local.name = "Local";

    local.cat1 = parseInt(countyData.LOCRPAR);
    local.cat2 = parseInt(countyData.LOCROSCH);
    local.cat3 = parseInt(countyData.LOCRCHAR);
    local.cat4 = parseInt(countyData.LOCROTHR);

    // Adding items for tooltip
    local.cat1display = "Parent government contributions : $" + local.cat1;
    local.cat2display = "Revenue from other school systems: $" + local.cat2;
    local.cat3display = "Charges: $" + local.cat3;
    local.cat4display = "Other local revenues: $" + local.cat4;
    */

    obj.push(total);
    obj.push(federal);
    obj.push(state);
    obj.push(local);
    obj.push(olocal);
    return obj;


}

function updateFundingText(value){
    document.getElementById("funding-title").innerHTML = "Total County Revenue: $" + numberWithCommas(parseInt(value));
}
function updatePerPupilText(value){
    document.getElementById("per-pupil-title").innerHTML = "Per Pupil Spending in County: $" + value;

}
