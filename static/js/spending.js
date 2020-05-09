$(document).ready(function() {

    // var dropdown = document.getElementById("dropwdown");


    d3.csv("http://localhost:8080/../../data/funding2011to2017.csv")
        .then(jsonTuples => {
            makeSpendingChart(jsonTuples, defaultCounty, defaultYear.toString());

            $("#dropdown").change(function() {

                // update HTML attribute so current county is accessible
                // document.getElementById("dropdown").setAttribute("county", this.value);
                // var year = document.getElementById("time-div").getAttribute("year");
                var county = $(this).val();
                makeSpendingChart(jsonTuples, county, currentYear.toString());
            });


        })
        .catch(e => console.log(e));
})





/* Retreives all data from a certain year for specified county */
function getCountySData(allData, year, county) {
    for (var i = 0; i < allData.length; i++) {
        //console.log(allData[i].NAME + " " + county + allData[i].Year + " " + parseInt(year));
        if (allData[i].Year === year && allData[i].NAME === county) {
            return allData[i];
        }
    }
}


/* Creates chart */

function makeSpendingChart(allData, county, year) {
    var spend_chart = document.getElementById("spending");
    var margins = {
        tp: 20,
        btm: 50,
        lft: 80,
        rt: 30
    };
    var width = 600;
    var height = 450;
    var countyData = getCountySData(allData, year, county);

    // within county data, get data to graph
    var graphData = isolateSData(countyData);

    $("#spending").empty();

    // xBand
    var xBand = d3.scaleBand()
        .domain(graphData.map(d => d.name))
        .range([margins.lft, width - margins.rt])
        .paddingInner(0.1);

    // Height scale function
    var hScale = d3.scaleLinear()
        .domain([1, graphData[0].value])
        .range([height - margins.btm - margins.tp, 0]);

    // Color scale
    var color = d3.scaleOrdinal()
        .domain(graphData.map(d => d.name))
        .range(d3.schemeCategory10);

    d3.select(spend_chart)
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
            ret_val = d.name + ": $" + d.value;
            return ret_val;

        });


    // X-axis

    d3.select(spend_chart)
        .append("g")
        .attr("transform", `translate(0,${height - margins.btm})`)
        .call(d3.axisBottom(xBand));

    // Y-axis
    d3.select(spend_chart)
        .append("g")
        .attr("transform", `translate(${margins.lft}, ${margins.tp})`)
        .call(d3.axisLeft(hScale));

    // Y-axis label
    d3.select(spend_chart)
        .append("text")
        .attr("x", 0 - height / 2)
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Spending($)");

}

// Filters the json data so that it only returns funding for a specific county
function isolateSData(countyData) {
    var obj = [];
    var total = {};
    total.name = "Total Expenditures";
    total.value = countyData.TOTALEXP;

    var curr_spend = {};
    curr_spend.name = "Total Spending";
    curr_spend.value = countyData.TCURSPND;

    var instr_spend = {};
    instr_spend.name = "Instruction Spending";
    instr_spend.value = countyData.TCURINST;

    var support = {};
    support.name = "Support Services";
    support.value = countyData.TCURSSVC;

    var capital_outlay = {};
    capital_outlay.name = "Capital Outlay";
    capital_outlay.value = countyData.TCAPOUT;

    obj.push(total);
    obj.push(curr_spend);
    obj.push(instr_spend);
    obj.push(support);
    obj.push(capital_outlay);


    return obj;



}