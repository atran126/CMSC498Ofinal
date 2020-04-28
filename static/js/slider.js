
d3.csv("http://localhost:8080/../../data/countyfunding.csv").then((data) => {
    timeHandler(data); 
}).catch(e => console.log(e));


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
        d3.select('p#time-label').text(currYear);
  
      //  update graphs here ?
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
  
