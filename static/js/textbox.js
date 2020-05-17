$(document).ready(function() {
    $("#dropdown").change(function() {
        county = $(this).val();
        var countyTitle = getPrettyName(county);
        document.getElementById("county-title").innerHTML = countyTitle + " County Public Schools";
    });
});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getPrettyName(county) {
    switch (county) {
        case "ALLEGANY COUNTY PUBLIC SCHOOLS":
            county = "Allegany";
            break;
        case "ANNE ARUNDEL CO SCHS":
            county = "Anne Arundel";
            break;
        case "CHARLES CO SCHS":
            county = "Charles";
            break;
        case "DORCHESTER CO SCHS":
            county = "Dorchester";
            break;
        case "HOWARD COUNTY SCHOOLS":
            county = "Howard";
            break;
        case "KENT COUNTY SCHOOLS":
            county = "Kent";
            break;
        case "QUEEN ANNES COUNTY SCHOOLS":
            county = "Queen Anne's";
            break;
        case "ST MARYS CO SCHS":
            county = "St. Mary's";
            break;
        case "TALBOT CO SCHS":
            county = "Talbot";
            break;
        case "WASHINGTON CO SCHS":
            county = "Washington";
            break;
        case "BALTIMORE COUNTY SCHOOLS":
            county = "Baltimore County";
            break;
        case "CALVERT CO SCHS":
            county = "Calvert";
            break;
        case "CAROLINE CO SCHS":
            county = "Caroline";
            break;
        case "CARROLL CO SCHS":
            county = "Carroll";
            break;
        case "CECIL COUNTY PUBLIC SCHOOLS":
            county = "Cecil";
            break;
        case "FREDERICK CO SCHOOLS":
            county = "Frederick";
            break;
        case "GARRETT COUNTY SCHOOLS":
            county = "Garrett";
            break;
        case "HARFORD CO SCH":
            county = "Harford";
            break;
        case "MONTGOMERY COUNTY SCHOOLS":
            county = "Montgomery";
            break;
        case "PRINCE GEORGES CO SCHS":
            county = "Prince George's";
            break;
        case "WICOMICO CO SCHOOLS":
            county = "Wicomico";
            break;
        case "WORCESTER CO BOARD OF EDUCATION":
            county = "Worcester";
            break;
        case "BALTIMORE CITY SCHOOLS":
            county = "Baltimore City";
            break;
        case "SOMERSET CO SCHS":
            county = "Somerset";
            break;
        default:
            county = "";
            break;
    }

    return county;
}