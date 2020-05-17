$(document).ready(function() {
    d3.csv("http://localhost:8080/data/new_school_data.csv")
        .then(jsonTuples => {
            makeRevenueChart(jsonTuples, defaultCounty, defaultYear.toString());
            $("#dropdown").change(function() {
                var county = $(this).val();
                makeRevenueChart(jsonTuples, county, currentYear.toString());
            });
        })
        .catch(e => console.log(e));
})

/* Retreives all data from a certain year for specified county */
function getCountyData(allData, year, county) {
    for (var i = 0; i < allData.length; i++) {
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
    // within county data, get data to graph
    var graphData = isolateData(countyData);
    updateFundingText(countyData.TOTALREV);
    updatePerPupilText(numberWithCommas(countyData.PPCSTOT), county);

    var xBand = d3.scaleBand()
        .domain(graphData.map(d => d.name))
        .range([margins.lft, width - margins.rt])
        .paddingInner(0.1);

    // Height scale function
    var hScale = d3.scaleLinear()
        .domain([1, graphData[0].value])
        .range([height - margins.btm - margins.tp, 0]);

    var color_range = ["#cf3502", "#f2ca18", "#0d0607", "#3b02d9", "#db6802"];
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
        .attr("fill", (d, i) => color_range[i])
        .append("svg:title")


        // Add correct hover over text
        .text(function(d) {
            ret_val = d.long_name + ": $" + d.value;
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

    obj.push(total);
    obj.push(federal);
    obj.push(state);
    obj.push(local);
    obj.push(olocal);
    return obj;
}

function updateFundingText(value) {
    document.getElementById("funding-title").innerHTML = "Total County Revenue: $" + numberWithCommas(parseInt(value));
}

function updatePerPupilText(value, county) {
    document.getElementById("per-pupil-title").innerHTML = "  (" + getPrettyName(county) + ": $" + value + ")";
}