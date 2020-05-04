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
    btm: 50,
    lft: 80,
    rt: 30
};
var width = 400;
var height = 500;


function createChart(jsonTuples, county, chart) {

    $("#revenue-breakdown").empty();
    data = filterData(county, jsonTuples);
    makeChart(data, chart);
  }

function makeChart(graphData, chart) {



  $("#revenue-breakdown").empty();
  var revenue = ["Total", "Federal", "State", "Local"];
  var colors = ["b82a04", "b82a04", "e1a61c", "040300"];
  var keys = ["cat1", "cat2", "cat3", "cat4", "cat5", "cat6", "cat7"];

  // xBand
  var xBand = d3
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
  .range(d3.schemeCategory10);


  // Use http://bl.ocks.org/mstanaland/6100713 for stacked bar chart
var stack = d3.stack()
  .keys(keys);
var stacked_data = stack(graphData);

d3.select(chart)
      .append("g")
      .selectAll("g")
      .data(stacked_data)
      .enter().append("g")
      .attr("fill", function(d) { return color(d.key); })
      .selectAll("rect")

      // loop subgroup per subgroup to add stacked bars
      .data(function(d) { return d; })
      .enter().append("rect")
      .attr("x", (d) => xBand(d.data.name) + "px")
      .attr("y", (d) => margins.tp + hScale(d[1]) + "px")
      .attr("height", function(d) { return hScale(d[0]) - hScale(d[1]); })
      .attr("width", xBand.bandwidth())
      .append("svg:title")

    .text(function(d) {
      var val = d[1] - d[0];
      if (d.data.cat1 == val) {
        return d.data.cat1display;
      }

      else if (d.data.cat2 == val) {
        return d.data.cat2display;
      }
      else if (d.data.cat3 == val) {
        return d.data.cat3display;
      }
      else if (d.data.cat4 == val) {
        return d.data.cat4display;
      }
      else if (d.data.cat5 == val) {
        return d.data.cat5display;
      }
      else if (d.data.cat6 == val) {
        return d.data.cat6display;
      }
      else  {
        return d.data.cat7display;
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
    .text("Revenue ($)");

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
}

// Filters the json data so that it only returns funding for a specific county
function filterData(county, jsonTuples) {
    var obj = [];
    jsonTuples.forEach((countyData) => {
        if (countyData.NAME === county) {

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
          federal.cat3 =  parseInt(countyData.C16);
          federal.cat4 = parseInt(countyData.C19);
          federal.cat5 = parseInt(countyData.B11);
          federal.cat6 = parseInt(countyData.C25);
          federal.cat7 = parseInt(countyData.TFEDREV) - (federal.cat1 + federal.cat2 + federal.cat3 + federal.cat4 + federal.cat5 + federal.cat6);


          // Adding items for tooltip
          federal.cat1display = "Compensatory(Title I): $" + federal.cat1;
          federal.cat2display = "Children with disabilites: $" + federal.cat2;
          federal.cat3display = "Math, science, and teacher quality: $" + federal.cat3;
          federal.cat4display = "Vocational and technical education: $" + federal.cat4;
          federal.cat5display = "Bilingual education: $" + federal.cat5;
          federal.cat6display = "Child Nutrition Act: $" + federal.cat6;
          federal.cat7display = "All other federal aid: $" + federal.cat7;


          state.value = countyData.TSTREV;
          state.name = "State";

          state.cat1 = parseInt(countyData.C01);
          state.cat2 = parseInt(countyData.C05);
          state.cat3 = parseInt(countyData.C06);
          state.cat4 = parseInt(countyData.C07);
          state.cat5 = parseInt(countyData.C10);
          state.cat6 = parseInt(countyData.C12);
          state.cat7 = parseInt(countyData.TSTREV) - (state.cat1 + state.cat2 + state.cat3 + state.cat4 + state.cat5 + state.cat6);

          // Adding items for tooltip
          state.cat1display = "General formula assistance: $" + state.cat1;
          state.cat2display = "Special education programs: $" + state.cat2;
          state.cat3display = "Compensatory and basic skills attainment programs : $" + state.cat3;
          state.cat4display = "Bilingual Education programs : $" + state.cat4;
          state.cat5display = "School Lunch programs : $" + state.cat5;
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
