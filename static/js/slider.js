var sliderWidth = 350;

d3.json("http://localhost:8080/../../data/yeardata.json")
    .then((data) => {
        timeHandler(data);
    })
    .catch((e) => console.log(e));

function updateFundingOverviewGraph() {
  d3.csv("http://localhost:8080/../../data/funding2011to2017.csv")
  .then((data) => {
    console.log("slider > funding overview update");

    var year = document.getElementById("time-div").getAttribute("year");
    var county = document.getElementById("dropdown").getAttribute("county");

    // update the graph
    createOverviewChart(data, county, year);
  })
  .catch((e) => console.log(e));

}

function getYearData(allData, year) {
    for (var i = 0; i < allData.length; i++) {
        if (allData[i].year === parseInt(year)) {
            return allData[i].data;
        }
    }
}

// when the time slider changes, need to update each graph accordingly
function updateRevenueGraph(allData) {



  d3.csv("http://localhost:8080/../../data/funding2011to2017.csv")
  .then((data) => {

    var year = document.getElementById("time-div").getAttribute("year");
    var county = document.getElementById("dropdown").getAttribute("county");

    // update the graph
    makeRevenueChart(data, county, year);

  })
  .catch((e) => console.log(e));

}

function updateSpendingGraph(allData) {



  d3.csv("http://localhost:8080/../../data/funding2011to2017.csv")
  .then((data) => {

    var year = document.getElementById("time-div").getAttribute("year");
    var county = document.getElementById("dropdown").getAttribute("county");

    // update the graph
    makeSpendingChart(data, county, year);

  })
  .catch((e) => console.log(e));

}



function timeHandler(allData) {
    var dataTime = d3.range(0, 7).map(function(d) {
        return new Date(2011 + d, 6, 3);
    });

    var slider = d3
        .sliderBottom()
        .min(d3.min(dataTime))
        .max(d3.max(dataTime))
        .step(1000 * 60 * 60 * 24 * 365)
        .width(sliderWidth)
        .tickFormat(d3.timeFormat("%Y"))
        .tickValues(dataTime)
        .default(new Date(2017, 10, 3))
        .on("onchange", (val) => {
            var currYear = d3.timeFormat("%Y")(val);

            // updates year attribute in HTML div
            document.getElementById("time-div").setAttribute("year", currYear);
            // $("#time-div").data("year", currYear);

            // document.getElementById("time-label").setAttribute("year", currYear);
            d3.select("p#time-label").text(currYear);

            //  update graphs here
            updateRevenueGraph(allData);
            updateSpendingGraph(allData);
            updateFundingOverviewGraph(allData);
        });

    var gTime = d3
        .select("div#slider-time")
        .append("svg")
        .attr("width", sliderWidth + 50)
        .attr("height", 100)
        .append("g")
        .attr("transform", "translate(30,30)");

    gTime.call(slider);
}
