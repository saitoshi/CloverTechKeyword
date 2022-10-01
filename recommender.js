const myForm = document.getElementById("myForm");
const myFile = document.getElementById("myFile");
const keywordList = [];
var arrayLength = 0;

function failureCallback() {
  console.log("This is failure callback");
}

function tsvToArray(str, delimiter = "\t") {
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
  for (var i = 0; i < headers.length; i++) {
    headers[i] = headers[i].replace(/"/g, "");
  }
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");
  arrayLength = rows.legnth;

  const arr = rows.map(function (row) {
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });
  return arr;
}

// convert csv into array
function csvToArray(str, delimiter = ",") {
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

  const arr = rows.map(function (row) {
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });

  // return the array
  return arr;
}

function keywordExtract(arr, keywordList) {
  var nameArray = [];
  for (var i = 0; i < keywordList.length; i++) {
    nameArray.push(_.pluck(arr, keywordList[i]));
  }
  return nameArray;
}

function getFifteen(arr) {
  let top15 = [];
  for (let i = 0; i < 15; i++) {
    top15.push(arr[i]);
  }
  return top15;
}

// arr to CSV
function saveCSV(array, title) {
  var csvOutput = "";
  for (let row of array) {
    csvOutput += row + "\r\n";
    for (let col of row) {
      csvOutput += col + ",";
    }
    csvOutput += "\r\n";
  }
  // (C) CREATE BLOB OBJECT
  var myBlob = new Blob([csvOutput], { type: "text/csv" });

  // (D) CREATE DOWNLOAD LINK
  var url = window.URL.createObjectURL(myBlob);
  var anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = title + ".csv";

  // (E) "FORCE DOWNLOAD"
  // NOTE: MAY NOT ALWAYS WORK DUE TO BROWSER SECURITY
  // BETTER TO LET USERS CLICK ON THEIR OWN
  anchor.click();
  window.URL.revokeObjectURL(url);
  anchor.remove();
}

// arr to TSV
function saveTSV(array, title) {
  var csvOutput = "";
  for (let row of array) {
    for (let col of row) {
      csvOutput += col + "\t";
    }
    csvOutput += "\r\n";
  }
  // (C) CREATE BLOB OBJECT
  var myBlob = new Blob([csvOutput], { type: "text/csv" });

  // (D) CREATE DOWNLOAD LINK
  var url = window.URL.createObjectURL(myBlob);
  var anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = title + ".tsv";

  // (E) "FORCE DOWNLOAD"
  // NOTE: MAY NOT ALWAYS WORK DUE TO BROWSER SECURITY
  // BETTER TO LET USERS CLICK ON THEIR OWN
  anchor.click();
  window.URL.revokeObjectURL(url);
  anchor.remove();
}

// obj to CSV
function convertToCSV(objArray, fileName) {
  var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
  var str = "";
  str += Object.keys(objArray[0]);
  for (var i = 0; i < array.length; i++) {
    var line = "";
    for (var index in array[i]) {
      if (line != "") line += ",";

      line += array[i][index];
    }

    str += line + "\r\n";
  }

  // (C) CREATE BLOB OBJECT
  var myBlob = new Blob([str], { type: "text/csv" });

  // (D) CREATE DOWNLOAD LINK
  var url = window.URL.createObjectURL(myBlob);
  var anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName + ".csv";

  // (E) "FORCE DOWNLOAD"
  // NOTE: MAY NOT ALWAYS WORK DUE TO BROWSER SECURITY
  // BETTER TO LET USERS CLICK ON THEIR OWN
  anchor.click();
  window.URL.revokeObjectURL(url);
  anchor.remove();
}

// obj to TSV
function convertToTSV(objArray, fileName) {
  var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
  var str = "";
  str += Object.keys(objArray[0]);
  for (var i = 0; i < array.length; i++) {
    var line = "";
    for (var index in array[i]) {
      if (line != "") line += "\t";

      line += array[i][index];
    }

    str += line + "\r\n";
  }

  // (C) CREATE BLOB OBJECT
  var myBlob = new Blob([str], { type: "text/tsv" });

  // (D) CREATE DOWNLOAD LINK
  var url = window.URL.createObjectURL(myBlob);
  var anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName + ".tsv";

  // (E) "FORCE DOWNLOAD"
  // NOTE: MAY NOT ALWAYS WORK DUE TO BROWSER SECURITY
  // BETTER TO LET USERS CLICK ON THEIR OWN
  anchor.click();
  window.URL.revokeObjectURL(url);
  anchor.remove();
}

var processItem = {},
  processItems = [];

myForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const input = myFile.files[0];
  const fileExtention = myFile.files[0].type;
  const reader = new FileReader();
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let data;
  let nounList = [];
  let sortedCount = [];
  var keyList = {};
  reader.onload = function (e) {
    var keywordNoun = "";
    const DICT_PATH = "./dict";
    const text = e.target.result;
    if (fileExtention === "text/tab-separated-values") {
      data = tsvToArray(text);
    } else if (fileExtention === "text/csv") {
      data = csvToArray(text);
    }
    wait(1000)
      .then(() => {
        var maxCount = data.length;
        let preProcessList = data.map(
          ({ product_id, product_name, keyword }) => ({
            product_id,
            product_name,
            keyword,
          }),
        );
        const preProcessEntries = Object.values(preProcessList);
        //convertToCSV(preProcessEntries, "preProcess");
        //convertToTSV(preProcessEntries, "preProcess");
        let keyWordCollection = data.map(
          ({ product_id, product_name, keyword }) => ({
            product_id,
            product_name,
            keyword,
          }),
        );
        var count = 0;
        do {
          var endCount = count + 40;
          let keywordProcess = Object.entries(keyWordCollection)
            .slice(count, endCount)
            .map((entry) => entry[1]);

          keywordProcess.forEach((product) => {
            //console.log(product["product_id"]);
            let keyText = JSON.stringify(product["keyword"]);
            keyText = keyText.replaceAll(/\|/g, ",").replaceAll(/\\/g, "");

            kuromoji.builder({ dicPath: "./dict" }).build((err, tokenizer) => {
              if (err) {
                console.log(err);
              }
              const tokens = tokenizer.tokenize(keyText);
              //console.log(tokens);
              tokens.forEach((token) => {
                if (token.pos == "名詞") {
                  nounList.push(token.surface_form);
                }
              });
              for (noun in nounList) {
                keywordNoun += nounList[noun];
              }
              processItems.push({
                product_id: product["product_id"],
                keyword: keywordNoun,
              });
              nounList = [];
              keywordNoun = "";
              console.log(processItems);
              count = count + 40;
              //keywordNoun.replace(String.fromCharCode(92), " ");
            });
          });
        } while (count < maxCount);
      })
      .catch(() => {});

    wait(60 * 1000)
      .then(() => {
        console.log(processItems);
        convertToCSV(processItems, "process");
        convertToTSV(processItems, "process");
      })
      .catch(() => {});
  };

  reader.readAsText(input);
});
/** 
processItems.push({
  product_id: product["product_id"],
  keyword: nounList[noun],
});*/
//convertToCSV(processItems, "process");
//convertToTSV(processItems, "process");