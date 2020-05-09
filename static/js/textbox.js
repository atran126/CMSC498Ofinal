$(document).ready(function() {
    $("#dropdown").change(function() {
        // update HTML attribute so current county is accessible

        document.getElementById("dropdown").setAttribute("county", this.value);
        county = this.value;

        var countyTitle = getPrettyName(county);
        document.getElementById("county-title").innerHTML = countyTitle + " County Public Schools";

        var year = document.getElementById("time-div").getAttribute("year");
        updatePriceText(county, year);
    });

});

function updatePriceText(county, year){
    d3.json("http://localhost:8080/data/houseprices.json")
    .then(map_data => {
        map_data = d3.nest()
        .key(item => item.year)
        .key(item => item.county)
        .object(map_data);
        
    if (map_data[year][county]){
        
        medianListPrice = map_data[year][county][0].median_price;
        document.getElementById("price-title").innerHTML = "Median List Price: $" + numberWithCommas(parseInt(medianListPrice));
        addMedianPriceColorBar(medianListPrice);
    }
})
.catch(e => console.log(e));
}

function addMedianPriceColorBar(num){
    var categories = ["No Data", "< $200,000", "$200,000-$300,000", "$300,000-$400,000", "> $400,000"];
    var colors = ["#eee", "#bae4b3", "#74c476", "#31a354", "#006d2c"];
    
    var colorScale = d3.scaleOrdinal().domain(categories).range(colors);
    let i = 0;

    if (!isNumeric(num)) {
        i = 0;
    } else if (num < 200000) {
        i = 1;
    } else if (num < 300000) {
        i = 2;
    } else if (num < 400000) {
        i = 3;
    } else {
        i = 4;
    }

    let currcolor = colorScale(categories[i]);
    
    let txt = document.getElementById('price-title');
    txt.style.textDecoration = "underline";
    txt.style.textDecorationColor = currcolor;

}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getPrettyName(county){
    switch (county) {
        case "ALLEGANY COUNTY PUBLIC SCHOOLS":
            county = "Allegany";
            i = 0;
            break;
        case "ANNE ARUNDEL CO SCHS":
            county = "Anne Arundel";
            i = 1;
            break;
        case "CHARLES CO SCHS":
            county = "Charles";
            i = 2;
            break;
        case "DORCHESTER CO SCHS":
            county = "Dorchester";
            i = 3;
            break;
        case "HOWARD COUNTY SCHOOLS":
            county = "Howard";
            i = 4;
            break;
        case "KENT COUNTY SCHOOLS":
            county = "Kent";
            i = 5;
            break;
        case "QUEEN ANNES COUNTY SCHOOLS":
            county ="Queen Anne's";
            i = 6;
            break;
        case "ST MARYS CO SCHS":
            county = "St. Mary's";
            i = 7;
            break;
        case "TALBOT CO SCHS":
            county = "Talbot";
            i = 8;
            break;
        case "WASHINGTON CO SCHS":
            county = "Washington";
            i = 9;
            break;
        case "BALTIMORE COUNTY SCHOOLS":
            county = "Baltimore County";
            i = 10;
            break;
        case "CALVERT CO SCHS":
            county = "Calvert";
            i = 11;
            break;
        case "CAROLINE CO SCHS":
            county = "Caroline";
            i = 12;
            break;
        case "CARROLL CO SCHS":
            county = "Carroll";
            i = 13;
            break;
        case "CECIL COUNTY PUBLIC SCHOOLS":
            county = "Cecil";
            i = 14;
            break;
        case "FREDERICK CO SCHOOLS":
            county = "Frederick";
            i = 15;
            break;
        case "GARRETT COUNTY SCHOOLS":
            county = "Garrett";
            i = 16;
            break;
        case "HARFORD CO SCH":
            county = "Harford";
            i = 17;
            break;
        case "MONTGOMERY COUNTY SCHOOLS":
            county = "Montgomery";
            i = 18;
            break;
        case "PRINCE GEORGES CO SCHS":
            county = "Prince George's";
            i = 19;
            break;
        case "WICOMICO CO SCHOOLS":
            county = "Wicomico";
            i = 20;
            break;
        case "WORCESTER CO BOARD OF EDUCATION":
            county = "Worcester";
            i = 21;
            break;
        case "BALTIMORE CITY SCHOOLS":
            county = "Baltimore City";
            i = 22;
            break;
        case "SOMERSET CO SCHS":
            county = "Somerset";
            i = 23;
            break;
        default:
            county = "";
            i = -1;
            break;
    }

    return county; 
}