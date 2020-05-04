$(document).ready(function() {

    var dropdown = document.getElementById("dropwdown");
    var chart = document.getElementById("revenue-breakdown");

    
    $("#dropdown").change(function() {
        // update HTML attribute so current county is accessible

        document.getElementById("dropdown").setAttribute("county", this.value);
        var county = this.value;
        
        document.getElementById("county-title").innerHTML = county;

        var year = document.getElementById("time-div").getAttribute("year");
        var countyFunds = 0;
        var schoolRating = 0;
        var medianListPrice = 0;

        d3.csv("http://localhost:8080/../../data/countyfunding.csv")
        .then(fundingTuples => {
            fundingTuples.forEach((countyData) => {
                if (countyData.NAME === county) {
                    countyFunds = countyData.TOTALREV;
                    document.getElementById("total-county-funding-title").innerHTML = "Total County funding: $" + countyFunds;
                }
            }
            )
        })
        
        // d3.json("http://localhost:8080/data/house_prices_historical.json")
        // .then(mapData => {
        //     mapData = d3.nest()
        //             .key(item => item.year)
        //             .key(item => item.county)
        //             .object(mapData);

        //     medianListPrice = mapData[year][county][0]["median_price"];
        //     document.getElementById("price-title").innerHTML = "Median List Price: $" + medianListPrice;
        // })
        // .catch(e => console.log(e));

        
        // document.getElementById("school-rating-title").innerHTML = " Average School Rating: 10000";
        
    });

});
