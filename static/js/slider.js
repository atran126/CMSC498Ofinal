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

  // get necessary variables
  var year = document.getElementById("time-div").getAttribute("year");
  var county = document.getElementById("dropdown").getAttribute("county");
  var chart = document.getElementById("revenue-breakdown");

  // isolate the county data
  var countyData = getCountyData(allData, year, county);
  // within county data, get data to graph
  var graphData = isolateData(countyData);
  makeChart(graphData, chart);

}

function getCountyData(allData, year, county) {
    for (var i = 0; i < allData.length; i++) {
        if (allData[i].year === parseInt(year)) {
            return allData[i].data[county];
        }
    }
}

function isolateData(countyData) {

  var obj = [];

  var total = {};
  var federal = {};
  var state = {};
  var local = {};
  total.value = countyData.TOTALREV;
  total.name = "Total";
  total.cat1 = 0;
  total.cat2 = 0;
  total.cat3 = 0;
  total.cat4 = 0;
  total.cat5 = 0;
  total.cat6 = 0;
  total.cat7 = countyData.TOTALREV;
  total.cat1display = "";
  total.cat2display = "";
  total.cat3display = "";
  total.cat4display = "";
  total.cat5display = "";
  total.cat6display = "";
  total.cat7display = "Total: $" + total.cat7;

  federal.value = countyData.TFEDREV;
  federal.name = "Federal";
  // Adding categories for stacked bars
  federal.cat1 = parseInt(countyData.C14);
  federal.cat2 = parseInt(countyData.C15);
  federal.cat3 = parseInt(countyData.C25);
  federal.cat4 = parseInt(countyData.C19);
  federal.cat5 = parseInt(countyData.B11);
  federal.cat6 =  parseInt(countyData.C16);
  federal.cat7 = parseInt(countyData.TFEDREV) - (federal.cat1 + federal.cat2 + federal.cat3 + federal.cat4 + federal.cat5 + federal.cat6);


  // Adding items for tooltip
  federal.cat1display = "Compensatory(Title I): $" + federal.cat1;
  federal.cat2display = "Children with disabilites: $" + federal.cat2;
  federal.cat3display = "Child Nutrition Act: $" + federal.cat3;
  federal.cat4display = "Vocational and technical education: $" + federal.cat4;
  federal.cat5display = "Bilingual education: $" + federal.cat5;
  federal.cat6display = "Math, science, and teacher quality: $" + federal.cat6;
  federal.cat7display = "All other federal aid: $" + federal.cat7;


  state.value = countyData.TSTREV;
  state.name = "State";

  state.cat1 = parseInt(countyData.C01);
  state.cat2 = parseInt(countyData.C05);
  state.cat3 = parseInt(countyData.C10);
  state.cat5 = parseInt(countyData.C06);
  state.cat4 = parseInt(countyData.C07);

  state.cat6 = parseInt(countyData.C12);
  state.cat7 = parseInt(countyData.TSTREV) - (state.cat1 + state.cat2 + state.cat3 + state.cat4 + state.cat5 + state.cat6);

  // Adding items for tooltip
  state.cat1display = "General formula assistance: $" + state.cat1;
  state.cat2display = "Special education programs: $" + state.cat2;
  state.cat3display = "School Lunch programs : $" + state.cat3;
  state.cat4display = "Bilingual Education programs : $" + state.cat4;
  state.cat5display = "Compensatory and basic skills attainment programs : $" + state.cat5;
  state.cat6display = "Transportation programs: $" + state.cat6;
  state.cat7display = "All other state revenue: $" + state.cat7;

  local.value = countyData.TLOCREV;
  local.name = "Local";


  local.cat1 = parseInt(countyData.T02);
  local.cat2 = parseInt(countyData.A08);
  local.cat3 = parseInt(countyData.A09);
  local.cat4 = parseInt(countyData.A20);
  local.cat5 = parseInt(countyData.U22);
  local.cat6 = parseInt(countyData.A07);
  local.cat7 = parseInt(countyData.TLOCREV) - (local.cat1 + local.cat2 + local.cat3 + local.cat4 + local.cat5 + local.cat6);

  // Adding items for tooltip
  local.cat1display = "Parent government contributions : $" + local.cat1;
  local.cat2display = "Transportation Fees: $" + local.cat2;
  local.cat3display = "School lunch revenues: $" + local.cat3;
  local.cat4display = "Other sales and service revenues: $" + local.cat4;
  local.cat5display = "Interest Earnings: $" + local.cat5;
  local.cat6display = "Tuition fees: $" + local.cat6;
  local.cat7display = "Other local revenues: $" + local.cat7;

  obj.push(total);
  obj.push(federal);
  obj.push(state);
  obj.push(local);
  return obj;

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
