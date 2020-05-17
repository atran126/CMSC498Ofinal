$(document).ready(function() {
    d3.csv("http://localhost:8080/../../data/new_school_data.csv")
        .then(jsonTuples => {
            makeSpendingChart(jsonTuples, defaultCounty, defaultYear.toString());

            $("#dropdown").change(function() {
                var county = $(this).val();
                makeSpendingChart(jsonTuples, county, currentYear.toString());
            });
        })
        .catch(e => console.log(e));
})

/* Retreives all data from a certain year for specified county */
function getCountySData(allData, year, county) {
    for (var i = 0; i < allData.length; i++) {
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
    var width = 400;
    var height = 250;
    var countyData = getCountySData(allData, year, county);
    updateSpendingText(countyData.enrollment);
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


    var color = d3.scaleOrdinal()
        .domain(graphData.map(d => d.name))
        .range(["rgb(252, 141, 98)", "rgb(102, 194, 165)", "rgb(141, 160, 203)", "rgb(231, 138, 195)", "rgb(179, 179, 179)"]);

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
            ret_val = d.long_name + ": " + d.value + " students";
            return ret_val;

        });

    // X-axis

    d3.select(spend_chart)
        .append("g")
        .attr("transform", `translate(0,${height - margins.btm})`)
        .call(d3.axisBottom(xBand))
        .selectAll("text")
        .attr("transform", "translate(0,0) rotate(-20)")
        .style("text-anchor", "end");

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
        .text("Students");

}

// Filters the json data so that it only returns funding for a specific county
function isolateSData(countyData) {
    var obj = [];
    var total = {};
    total.long_name = "Total Enrollment";
    total.name = "Total";
    total.value = countyData.enrollment;
    var meals = {};
    meals.long_name = "Free and Reduced Price Meals";
    meals.name = "FARMS";
    meals.value = countyData.farms;

    var sp = {};
    sp.long_name = "Special Education";
    sp.name = "SPED";
    sp.value = countyData.sped;

    var lep = {};
    lep.long_name = "Limited English Proficiency";
    lep.name = "LEP";
    lep.value = countyData.lep;
    obj.push(total);
    obj.push(meals);
    obj.push(sp);
    obj.push(lep);
    return obj;
}

function updateSpendingText(value) {
    document.getElementById("spending-title").innerHTML = "Total Students: " + numberWithCommas(parseInt(value));
}