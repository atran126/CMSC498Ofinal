// set the dimensions and margins of the graph
var county = $("#dropdown").val();
$(document).ready(function() {
    d3.csv("http://localhost:8080/data/new_school_data.csv")
        .then(data => {
            createOverviewChart(data, defaultCounty, defaultYear.toString());
            $("#dropdown").change(function() {
                // update HTML attribute so current county is accessible
                document.getElementById("dropdown").setAttribute("county", this.value);
                selectedCounty = this.value;
                createOverviewChart(data, selectedCounty, currentYear.toString());
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
            bottom: 175,
            left: 150
        },
        currwidth = 700 - currmargin.left - currmargin.right,
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

    // Append Div for tooltip to SVG
    var div = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

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
        .text('Spending per student($)')



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
            if (d.NAME == county) return "purple";
            else return "rgb(252, 141, 98)"; //"#1f77b4";
        })
        .on("mouseover", function(d) {
            $(".tooltip").empty();
            div.transition()
                .duration(200)
                .style("opacity", .9);

            $(".tooltip")
                .append(ret_val = getPrettyName(d.NAME) + " Public Schools <hr> $" + numberWithCommas(d.PPCSTOT))
                .css("left", (d3.event.pageX) + "px")
                .css("top", (d3.event.pageY - 28) + "px")
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
            svg.selectAll(".tooltip").remove()

        });

};