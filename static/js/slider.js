var sliderWidth = 350;
var defaultCounty = "PRINCE GEORGES CO SCHS";
var defaultYear = 2017;
var currentYear = defaultYear;

d3.json("http://localhost:8080/../../data/yeardata.json")
    .then((data) => {
        timeHandler(data);
    })
    .catch((e) => console.log(e));

function updateGraphs() {
    d3.csv("http://localhost:8080/../../data/new_school_data.csv")
        .then((data) => {
            var year = document.getElementById("time-div").getAttribute("year");
            var county = document.getElementById("dropdown").getAttribute("county");

            // update map
            d3.json("http://localhost:8080/../../data/houseprices-prettynames.json")
                .then((mapdata) => {
                    mapdata = d3.nest()
                        .key(item => item.year)
                        .key(item => item.county)
                        .object(mapdata);
                    updateMap(mapdata, year);
                })
                .catch((e) => console.log(e));

            // update the graphs
            createOverviewChart(data, county, year);
            makeSpendingChart(data, county, year);
            makeRevenueChart(data, county, year);

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
        .default(new Date(defaultYear, 10, 3))
        .on("onchange", (val) => {
            var currYear = d3.timeFormat("%Y")(val);
            currentYear = currYear;
            // updates year attribute in HTML div
            document.getElementById("time-div").setAttribute("year", currYear);
            d3.select("p#time-label").text(currYear);
            //  update graphs here
            updateGraphs(allData);
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