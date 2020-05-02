$(document).ready(function() {

    var dropdown = document.getElementById("dropwdown");
    var chart = document.getElementById("revenue-breakdown");

    d3.csv("http://localhost:8080/../../data/countyfunding.csv")
        .then(jsonTuples => {
            $("#dropdown").change(function() {
                // update HTML attribute so current county is accessible
                document.getElementById("dropdown").setAttribute("county", this.value);

                createChart(jsonTuples, this.value, chart);
            });


        })
        .catch(e => console.log(e));
})

var margins = {
    tp: 20,
    btm: 180,
    lft: 80,
    rt: 30
};
var width = 1200;
var height = 600;

function submission() {
    console.log("Hello");
    // getData()
    //     .then(jsonTuples => { // renders the data table
    //         console.log(jsonTuples[0]);
    //         createChart(jsonTuples, county, chart);
    //     })
    //     .catch(e => console.log(e));
}

function createChart(jsonTuples, county, chart) {
    // console.log(chart);
    // chart.innerHTML = "";
    $("#revenue-breakdown").empty();
    data = filterData(county, jsonTuples);
    var revenue = ["Total", "Federal", "State", "Local"];
    var colors = ["b82a04", "b82a04", "e1a61c", "040300"];

    // xBand
    var xBand = d3.scaleBand()
        .domain(revenue)
        .range([margins.lft, width - margins.rt])
        .paddingInner(0.2);

    // Height scale function
    var hScale = d3.scaleLinear()
        .domain([1, data[0].value])
        //.domain([1, 3000000])
        .range([height - margins.btm - margins.tp, 0]);

    // Creates bar chart

    d3.select(chart)
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => xBand(d.name) + "px")
        .attr("y", d => margins.tp + hScale(d.value) + "px")
        .attr("width", xBand.bandwidth())
        .attr("height", d => (height - margins.tp - margins.btm - hScale(d.value)))
        .attr("fill", "#b72506")
        .append("svg:title")

        .text(function(d) {
            return d.display;
        });

    // Use http://bl.ocks.org/mstanaland/6100713 for stacked bar chart


    // X-axis
    d3.select(chart).append("g")
        .attr("transform", `translate(0,${height - margins.btm})`)
        .call(d3.axisBottom(xBand))

    // Y-axis
    d3.select(chart).append("g")
        .attr("transform", `translate(${margins.lft}, ${margins.tp})`)
        .call(d3.axisLeft(hScale));

    // Y-axis label
    d3.select(chart).append("text")
        .attr("x", 0 - height / 2)
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Revenue ($)");


}

// Filters the json data so that it only returns funding for a specific county
function filterData(county, jsonTuples) {
    var obj = [];
    jsonTuples.forEach((j) => {
        if (j.NAME === county) {

            // Create objects for each type of funding
            var total = {};
            var federal = {};
            var state = {};
            var local = {};

            total.value = j.TOTALREV;
            total.name = "Total";

            federal.value = j.TFEDREV;
            federal.name = "Federal";
            // Adding items for tooltip
            federal.display = "Total federal funding: $" + j.TFEDREV;
            federal.display += "\nCompensatory(Title I): $" + j.C14;
            federal.display += "\n Children with disabilites: $" + j.C15;
            federal.display += "\n Child Nutrition Act: $" + j.C25;
            federal.display += "\n All other federal aid: $" + j.B13;


            state.value = j.TSTREV;
            state.name = "State";
            // Adding items for tooltip
            state.display = "Total state funding: $" + j.TSTREV;
            state.display += "\nGeneral formula assistance: $" + j.C01;
            state.display += "\nSpecial education programs: $" + j.C05;
            state.display += "\nCompensatory and basic skills attainment programs : $" + j.C06;
            state.display += "\nBilingual Education programs : $" + j.C07;
            state.display += "\nSchool Lunch programs : $" + j.C10;
            state.display += "\nTransportation programs: $" + j.C12;
            state.display += "\nAll other state revenue: $" + j.C13;

            local.value = j.TLOCREV;
            local.name = "Local";
            // Adding items for tooltip
            local.display = "Total local funding: $" + j.TLOCREV;
            local.display += "\nParent government contributions : $" + j.T02;
            local.display += "\nTransportation Fees: $" + j.A08;
            local.display += "\nSchool lunch revenues: $" + j.A09;
            local.display += "\nOther sales and service revenues: $" + j.A20;
            local.display += "\nInterest Earnings: $" + j.U22;
            local.display += "\nOther local revenues: $" + j.U97;

            // Add objects to array
            obj.push(total);
            obj.push(federal);
            obj.push(state);
            obj.push(local);
            return obj;
        }
    });
    return obj;
}

// Gets data from server
function getData() {
    return new Promise((resolve, reject) => {
        var data_arr = [];
        d3.json("http://localhost:8080/")

            .then((json) => {
                json.forEach(d => {
                    data_arr.push(d);
                });
                resolve(data_arr);
            });
    });
}
