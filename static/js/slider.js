d3.json("http://localhost:8080/../../data/yeardata.json")
  .then((data) => {
    timeHandler(data);
  })
  .catch((e) => console.log(e));

// when the time slider changes, need to update each graph accordingly 
function updateRevenueGraph(allData) {
  // get necessary variables
  var year = document.getElementById("time-div").getAttribute("year");
  var county = document.getElementById("dropdown").getAttribute("county");
  var chart = document.getElementById("vis");

  // isolate the county data
  var countyData = getCountyData(allData, year, county);

  // within county data, get data to graph 
  var graphData = isolateData(countyData);


  $("#vis").empty();
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

    .text(function (d) {
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
      // console.log(allData[i].year);
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

  state.value = countyData.TSTREV;
  state.name = "State";

  federal.value = countyData.TFEDREV;
  federal.name = "Federal";

  local.value = countyData.TLOCREV;
  local.name = "Local";

  obj.push(total);
  obj.push(federal);
  obj.push(state);
  obj.push(local);
  return obj;
}

function timeHandler(allData) {
  var dataTime = d3.range(0, 15).map(function (d) {
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
    .default(new Date(2005, 10, 3))
    .on("onchange", (val) => {
      var currYear = d3.timeFormat("%Y")(val);

      // updates year attribute in HTML div
      document.getElementById("time-div").setAttribute("year", currYear);

      // document.getElementById("time-label").setAttribute("year", currYear);
      d3.select("p#time-label").text(currYear);

      //  update graphs here 
      updateRevenueGraph(allData);
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
