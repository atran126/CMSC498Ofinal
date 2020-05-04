
// set the dimensions and margins of the graph
var county = $("#dropdown").val();
console.log(width);
$(document).ready(function() {
    d3.csv("http://localhost:8080/data/funding2011to2017.csv")
        .then(data => {

            $("#dropdown").change(function() {
                // update HTML attribute so current county is accessible
                document.getElementById("dropdown").setAttribute("county", this.value);
                selectedCounty = this.value;
                createOverviewChart(data, selectedCounty, 2011);
            })

        
        })
        .catch(e => console.log(e));
})

function createOverviewChart(data, county, currYear) {
    $("#funding-overview").empty();

    var chart = document.getElementById("funding-overview");

    var currmargin = {
        top: 30,
        right: 30,
        bottom: 150,
        left: 150
    },
    currwidth = 1000 - currmargin.left - currmargin.right,
    currheight = 300 - currmargin.top - currmargin.bottom;

    // sort data
    data.sort(function(b, a) {
        return a.PPCSTOT - b.PPCSTOT;
    });
    data = data.filter(function(d) { 
        return d.Year == currYear 
    });
   
      
    // append the svg object to the body of the page
    var svgChart = d3.select(chart)
        .append("svg")
        .attr("width", currwidth + currmargin.left + currmargin.right)
        .attr("height", currheight + currmargin.top + currmargin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + currmargin.left + "," + currmargin.top + ")");

    console.log(currwidth)
    console.log(currheight + currmargin.top + currmargin.bottom)
    // X axis
    var x = d3.scaleBand()
        .range([0, currwidth])
        .domain(data.map(function(d) {
            return d.NAME;
        }))
        .padding(0.2);

    svgChart.append("g")
        .attr("transform", "translate(0," + currheight + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Y axis
    var y = d3.scaleLinear()
        .domain([8000, data[0].PPCSTOT])
        .range([currheight, 0]);
    svgChart.append("g")
        .call(d3.axisLeft(y));

    // Y Label
    svgChart
        .append('text')
        .attr('class', 'label')
        .attr('x', -(currheight / 3) - currmargin.top)
        .attr('y', -currmargin.left / 2)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Total Funding ($)')

    // Bars
    svgChart.selectAll("bars")
        .data(data)
        .enter()
        .append("rect")
            .attr("x", function(d) {
                return x(d.NAME);
            })
            .attr("y", function(d) {
                return y(d.PPCSTOT);
            })
            .attr("width", x.bandwidth())
            .attr("height", function(d) {
                return currheight - y(d.PPCSTOT);
            })
            .attr("fill", function(d) {
                if (d.NAME == county) return "red";
                else return "#69b3a2"
            })
            .on('mouseenter', function(actual, i) {
                d3.selectAll('.value')
                    .attr('opacity', 0)

                const countyY = y(actual.PPCSTOT)
                console.log("selected", actual, countyY);

                svgChart.append('line')
                    .attr('id', 'line-limit')
                    .attr('x1', 0)
                    .attr('y1', countyY)
                    .attr('x2', currwidth)
                    .attr('y2', countyY);

            })
        .on('mouseleave', function() {
            svgChart.select("#line-limit").remove()
            
        })


};
