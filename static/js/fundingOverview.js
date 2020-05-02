// set the dimensions and margins of the graph
var county = $("#dropdown").val();
console.log(width);
$(document).ready(function() {
    d3.csv("http://localhost:8080/data/countyfunding.csv")
        .then(data => {

            $("#dropdown").change(function() {
                // update HTML attribute so current county is accessible
                document.getElementById("dropdown").setAttribute("county", this.value);
                county = this.value;
                createChart(data);
            })

            console.log("funding overview");
            console.log(width);

            function createChart(data) {
                var margin = {
                    top: 30,
                    right: 30,
                    bottom: 150,
                    left: 150
                },
                width = 1200 - margin.left - margin.right,
                height = 800 - margin.top - margin.bottom;
                
                $("#funding-overview").empty();

                // var county = document.getElementById("county").value;
                var chart = document.getElementById("funding-overview");

                // sort data
                data.sort(function(b, a) {
                    return a.TOTALREV - b.TOTALREV;
                });

                // this logs each county name and total revenue
                // data.forEach((d) => console.log(d.NAME, d.TOTALREV));

                // append the svg object to the body of the page
                var svgChart = d3.select(chart)
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

                console.log(width)
                console.log(height + margin.top + margin.bottom)
                // X axis
                var x = d3.scaleBand()
                    .range([0, width])
                    .domain(data.map(function(d) {
                        return d.NAME;
                    }))
                    .padding(0.2);

                svgChart.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x))
                    .selectAll("text")
                    .attr("transform", "translate(-10,0)rotate(-45)")
                    .style("text-anchor", "end");

                // Y axis
                var y = d3.scaleLinear()
                    .domain([0, data[0].TOTALREV])
                    .range([height, 0]);
                svgChart.append("g")
                    .call(d3.axisLeft(y));

                // Y Label
                svgChart
                    .append('text')
                    .attr('class', 'label')
                    .attr('x', -(height / 3) - margin.top)
                    .attr('y', -margin.left / 2)
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
                        return y(d.TOTALREV);
                    })
                    .attr("width", x.bandwidth())
                    .attr("height", function(d) {
                        return height - y(d.TOTALREV);
                    })
                    .attr("fill", function(d) {
                        if (d.NAME == county) return "red";
                        else return "#69b3a2"
                    })
                    .on('mouseenter', function(actual, i) {
                        d3.selectAll('.value')
                            .attr('opacity', 0)

                        const countyY = y(actual.TOTALREV)
                        console.log("selected", actual, countyY);

                        svgChart.append('line')
                            .attr('id', 'line-limit')
                            .attr('x1', 0)
                            .attr('y1', countyY)
                            .attr('x2', width)
                            .attr('y2', countyY);

                    })
                .on('mouseleave', function() {
                    svgChart.select("#line-limit").remove()
                    
                })


            };
        })
        .catch(e => console.log(e));
})
