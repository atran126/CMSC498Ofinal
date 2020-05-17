// Run yarn, npm install express, npm install cors
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile)
const express = require('express');
const cors = require('cors');

var app = express();
app.use(cors()); // enable cors
app.use(express.static('.'));

// From https://stackoverflow.com/questions/8493195/how-can-i-parse-a-csv-string-with-javascript-which-contains-comma-in-data/8497474#8497474
function CSVtoArray(text) {
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    // Return NULL if input string is not well formed CSV string.

    var a = []; // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
        function(m0, m1, m2, m3) {
            // Remove backslash from \' in single quoted values.
            if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        });
    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
};
// Some code from https://stackoverflow.com/questions/28543821/convert-csv-lines-into-javascript-objects/28544299
app.get('/', function(req, res) {
    readFile('data/countyfunding.csv').then(data => {

            //Convert and store csv information into a buffer.
            bufferString = data.toString();

            //Store information for each individual person in an array index. Split it by every newline in the csv file.
            arr = bufferString.split('\r');
            var jsonObj = [];
            var headers = arr[0].split(',');
            null_val = true;
            for (var i = 1; i < arr.length; i++) {
                var row = CSVtoArray(arr[i]);
                var obj = {};
                for (var j = 0; j < row.length; j++) {
                    if (row[j].length > 0) {
                        obj[headers[j]] = row[j];
                        null_val = false;
                    }
                }
                if (!null_val) {
                    jsonObj.push(obj);
                }
            }

            JSON.stringify(jsonObj);
            res.send(jsonObj);
        })

        .catch(e => {
            console.log(e)
        });
});

app.listen(8080, function() {
    console.log("A4 Data Server is running at localhost: 8080")
});