var margins = {tp: 20, btm: 180, lft: 80, rt: 30};
var width = 600;
var height = 600;

function rsubmission() {

    var county = document.getElementById("county").value;
    var chart = document.getElementById("vis");
    getData()
    .then(jsonTuples => { // renders the data table
      createChart(jsonTuples, county, chart);
    })
    .catch(e => console.log(e));
  }

function createChart(jsonTuples, county, chart) {
  data = filterData(county, jsonTuples);
  var revenue = ["Total", "Federal", "State", "Local"];

  var xBand = d3.scaleBand()
    .domain(revenue)
    .range([margins.lft, width - margins.rt])
    .paddingInner(0.2);

    var hScale = d3.scaleLinear()
      .domain([1, data[0].value])
      .range([height - margins.btm - margins.tp,0]);

      // Creates bar chart
      d3.select(chart)
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => xBand(d.name) + "px")
        .attr("y", d => margins.tp + hScale(d.value) + "px")
        .attr("width", xBand.bandwidth())
        .attr("height", d=> (height - margins.tp - margins.btm - hScale(d.value)))
        .attr("fill", "red");

        // X-axis
        d3.select(chart).append("g")
          .attr("transform",`translate(0,${height - margins.btm})`)
          .call(d3.axisBottom(xBand))



        // Y-axis
        d3.select(chart).append("g")
          .attr("transform", `translate(${margins.lft}, ${margins.tp})`)
          .call(d3.axisLeft(hScale));

          // Y-axis label
        d3.select(chart).append("text")
          .attr("x", 0 - height/2)
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
      console.log("Hello there");

      // Create objects for each type of funding
      var total = {};
      var federal = {};
      var state = {};
      var local = {};

      total.value =j.TOTALREV;
      total.name = "Total";

      federal.value= j.TFEDREV;
      federal.name = "Federal";

      state.value = j.TSTREV;
      state.name = "State";
      local.value= j.TLOCREV;
      local.name = "Local";

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
      json.forEach( d => {
        data_arr.push(d);
           });
        resolve(data_arr);
    });
  });
}
