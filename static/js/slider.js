d3.json("http://localhost:8080/../../data/yeardata.json")
    .then((data) => {
        timeHandler(data);
    })
    .catch((e) => console.log(e));

function updateFundingOverviewGraph(allData) {


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



  // approach: find the current year
  var yearData = getYearData(allData, year);

  toGraph = [];

  for (var key in yearData) {
    if (yearData.hasOwnProperty(key)) {
      toGraph.push(yearData[key]);
      // console.log(yearData[key].TOTALREV);
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

  federal.value = countyData.TFEDREV;
  federal.name = "Federal";
  // Adding categories for stacked bars
  federal.cat1 = countyData.C14;
  federal.cat2 = countyData.C15;
  federal.cat3 =  countyData.C16;
  federal.cat4 = countyData.C19;
  federal.cat5 = countyData.B11;
  federal.cat6 = countyData.C25;
  federal.cat7 = countyData.TFEDREV - (federal.cat1 + federal.cat2 + federal.cat3 + federal.cat4 + federal.cat5 + federal.cat6);


  // Adding items for tooltip
  federal.cat1display = "Compensatory(Title I): $" + countyData.C14;
  federal.cat2display = "Children with disabilites: $" + countyData.C15;
  federal.cat3display = "Math, science, and teacher quality: $" + federal.cat3;
  federal.cat4display = "Vocational and technical education: $" + federal.cat4;
  federal.cat5display = "Bilingual education: $" + federal.cat5;
  federal.cat6display = "Child Nutrition Act: $" + countyData.C25;
  federal.cat7display = "All other federal aid: $" + federal.cat7;


  state.value = countyData.TSTREV;
  state.name = "State";

  state.cat1 = countyData.C01;
  state.cat2 = countyData.C05;
  state.cat3 = countyData.C06;
  state.cat4 = countyData.C07;
  state.cat5 = countyData.C10;
  state.cat6 = countyData.C12;
  state.cat7 = countyData.TSTREV - (state.cat1 + state.cat2 + state.cat3 + state.cat4 + state.cat5 + state.cat6);

  // Adding items for tooltip
  state.cat1display = "General formula assistance: $" + countyData.C01;
  state.cat2display = "Special education programs: $" + countyData.C05;
  state.cat3display = "Compensatory and basic skills attainment programs : $" + countyData.C06;
  state.cat4display = "Bilingual Education programs : $" + countyData.C07;
  state.cat5display = "School Lunch programs : $" + countyData.C10;
  state.cat6display = "Transportation programs: $" + countyData.C12;
  state.cat7display = "All other state revenue: $" + state.cat7;

  local.value = countyData.TLOCREV;
  local.name = "Local";


  local.cat1 = countyData.T02;
  local.cat2 = countyData.A08;
  local.cat3 = countyData.A09;
  local.cat4 = countyData.A20;
  local.cat5 = countyData.U22;
  local.cat6 = countyData.A07;
  local.cat7 = countyData.TLOCREV - (local.cat1 + local.cat2 + local.cat3 + local.cat4 + local.cat5 + local.cat6);

  // Adding items for tooltip
  local.cat1display = "Parent government contributions : $" + countyData.T02;
  local.cat2display = "Transportation Fees: $" + countyData.A08;
  local.cat3display = "School lunch revenues: $" + countyData.A09;
  local.cat4display = "Other sales and service revenues: $" + countyData.A20;
  local.cat5display = "Interest Earnings: $" + countyData.U22;
  local.cat6display = "Tuition fees: $" + local.cat6;
  local.cat7display = "Other local revenues: $" + local.cat7;

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
