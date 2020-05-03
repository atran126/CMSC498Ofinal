d3.json("http://localhost:8080/../../data/yeardata.json")
    .then((data) => {
        timeHandler(data);
    })
    .catch((e) => console.log(e));

function updateFundingOverviewGraph(allData) {
    // console.log("slider > funding overview update");

    var year = document.getElementById("time-div").getAttribute("year");
    var county = document.getElementById("dropdown").getAttribute("county");
    var chart = document.getElementById("funding-overview");
    var margin = {
            top: 30,
            right: 30,
            bottom: 150,
            left: 150
        },
        width = 800 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    // update the graph
    // console.log("slider > funding overview update");

    // approach: find the current year
    var yearData = getYearData(allData, year);

    toGraph = [];

    for (var key in yearData) {
        if (yearData.hasOwnProperty(key)) {
            toGraph.push(yearData[key]);
            // console.log(yearData[key].TOTALREV);
        }
    }
}

// clear the current graph
$("#funding-overview").empty();

toGraph.sort(function(b, a) {
    return a.TOTALREV - b.TOTALREV;
});

// GRAPHING
var svgChart = d3
    .select(chart)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// X axis
var x = d3
    .scaleBand()
    .range([0, width])
    .domain(
        toGraph.map(function(d) {
            return d.NAME;
        })
    )
    .padding(0.2);

svgChart
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

// Y axis
var y = d3.scaleLinear().domain([0, toGraph[0].TOTALREV]).range([height, 0]);
svgChart.append("g").call(d3.axisLeft(y));

// Y Label
svgChart
    .append("text")
    .attr("class", "label")
    .attr("x", -(height / 3) - margin.top)
    .attr("y", -margin.left / 2)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("Total Funding ($)");

// Bars
svgChart
    .selectAll("bars")
    .data(toGraph)
    .enter()
    .append("rect")
    .attr("x", function(d) {
        return x(d.NAME);
    })
    .attr("y", function(d) {
        return y(d.TOTALREV);
    })
    .attr("width", x.bandwidth())
    .attr("height", function(d) {
        return height - y(d.TOTALREV);
    })
    .attr("fill", function(d) {
        if (d.NAME == county) return "red";
        else return "#69b3a2";
    })
    .on('mouseenter', function(actual, i) {
        d3.selectAll('.value')
            .attr('opacity', 0)

        const countyY = y(actual.TOTALREV)
        console.log("selected", actual, countyY);

        svgChart.append('line')
            .attr('id', 'line-limit')
            .attr('x1', 0)
            .attr('y1', countyY)
            .attr('x2', width)
            .attr('y2', countyY);

    })
    .on('mouseleave', function() {
        svgChart.select("#line-limit").remove();
    });

function getYearData(allData, year) {
    for (var i = 0; i < allData.length; i++) {
        if (allData[i].year === parseInt(year)) {
            return allData[i].data;
        }
    }
}

// when the time slider changes, need to update each graph accordingly
function updateRevenueGraph(allData) {
    // get necessary variables
    var year = document.getElementById("time-div").getAttribute("year");
    var county = document.getElementById("dropdown").getAttribute("county");
    var chart = document.getElementById("revenue-breakdown");

    // isolate the county data
    var countyData = getCountyData(allData, year, county);

    // within county data, get data to graph
    var graphData = isolateData(countyData);

    $("#revenue-breakdown").empty();
    var revenue = ["Total", "Federal", "State", "Local"];
    var colors = ["b82a04", "b82a04", "e1a61c", "040300"];

    // xBand
    var xBand = d3
        .scaleBand()
        .domain(revenue)
        .range([margins.lft, width - margins.rt])
        .paddingInner(0.2);

    // Height scale function
    var hScale = d3
        .scaleLinear()
        .domain([1, graphData[0].value])
        //.domain([1, 3000000])
        .range([height - margins.btm - margins.tp, 0]);

    // Creates bar chart
    d3.select(chart)
        .selectAll("rect")
        .data(graphData)
        .enter()
        .append("rect")
        .attr("x", (d) => xBand(d.name) + "px")
        .attr("y", (d) => margins.tp + hScale(d.value) + "px")
        .attr("width", xBand.bandwidth())
        .attr("height", (d) => height - margins.tp - margins.btm - hScale(d.value))
        .attr("fill", "#b72506")
        .append("svg:title")

        .text(function(d) {
            return d.display;
        });

    // Use http://bl.ocks.org/mstanaland/6100713 for stacked bar chart

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
        .text("Revenue ($)");
}

function getCountyData(allData, year, county) {
    for (var i = 0; i < allData.length; i++) {
        if (allData[i].year === parseInt(year)) {
            return allData[i].data[county];
        }
    }
}

function isolateData(countyData) {
    console.log(countyData);
    var obj = [];

    var total = {};
    var federal = {};
    var state = {};
    var local = {};
    total.value = countyData.TOTALREV;
    total.name = "Total";

    federal.value = countyData.TFEDREV;
    federal.name = "Federal";
    // Adding items for tooltip
    federal.display = "Total federal funding: $" + countyData.TFEDREV;
    federal.display += "\nCompensatory(Title I): $" + countyData.C14;
    federal.display += "\n Children with disabilites: $" + countyData.C15;
    federal.display += "\n Child Nutrition Act: $" + countyData.C25;
    federal.display += "\n All other federal aid: $" + countyData.B13;


    state.value = countyData.TSTREV;
    state.name = "State";
    // Adding items for tooltip
    state.display = "Total state funding: $" + countyData.TSTREV;
    state.display += "\nGeneral formula assistance: $" + countyData.C01;
    state.display += "\nSpecial education programs: $" + countyData.C05;
    state.display += "\nCompensatory and basic skills attainment programs : $" + countyData.C06;
    state.display += "\nBilingual Education programs : $" + countyData.C07;
    state.display += "\nSchool Lunch programs : $" + countyData.C10;
    state.display += "\nTransportation programs: $" + countyData.C12;
    state.display += "\nAll other state revenue: $" + countyData.C13;

    local.value = countyData.TLOCREV;
    local.name = "Local";
    // Adding items for tooltip
    local.display = "Total local funding: $" + countyData.TLOCREV;
    local.display += "\nParent government contributions : $" + countyData.T02;
    local.display += "\nTransportation Fees: $" + countyData.A08;
    local.display += "\nSchool lunch revenues: $" + countyData.A09;
    local.display += "\nOther sales and service revenues: $" + countyData.A20;
    local.display += "\nInterest Earnings: $" + countyData.U22;
    local.display += "\nOther local revenues: $" + countyData.U97;

    obj.push(total);
    obj.push(federal);
    obj.push(state);
    obj.push(local);
    return obj;
}

function timeHandler(allData) {
    var dataTime = d3.range(0, 15).map(function(d) {
        return new Date(2003 + d, 10, 3);
    });

    var slider = d3
        .sliderBottom()
        .min(d3.min(dataTime))
        .max(d3.max(dataTime))
        .step(1000 * 60 * 60 * 24 * 365)
        .width(800)
        .tickFormat(d3.timeFormat("%Y"))
        .tickValues(dataTime)
        .default(new Date(2007, 10, 3))
        .on("onchange", (val) => {
            var currYear = d3.timeFormat("%Y")(val);

            // updates year attribute in HTML div
            document.getElementById("time-div").setAttribute("year", currYear);
            // $("#time-div").data("year", currYear);

            // document.getElementById("time-label").setAttribute("year", currYear);
            d3.select("p#time-label").text(currYear);

            //  update graphs here
            updateRevenueGraph(allData);
            updateFundingOverviewGraph(allData);
        });

    var gTime = d3
        .select("div#slider-time")
        .append("svg")
        .attr("width", 900)
        .attr("height", 100)
        .append("g")
        .attr("transform", "translate(30,30)");

    gTime.call(slider);
}