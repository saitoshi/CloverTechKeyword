const myForm = document.getElementById("myForm");
const myFile = document.getElementById("myFile");
const keywordList = [];

//
function tsvToArray(str, delimiter = "\t") {
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
  for (var i = 0; i < headers.length; i++) {
    headers[i] = headers[i].replace(/"/g, "");
  }
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

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
function saveCSV(array) {
  var csv = "";
  // (B) ARRAY TO CSV STRING
  for (let i = 0; i < array.length + 1; i++) {
    for (let j = 0; j < array[i].length; j++) {
      csv += array[i][j];
    }
    csv += "\r\n";
  }
  // (C) CREATE BLOB OBJECT
  var myBlob = new Blob([csv], { type: "text/csv" });

  // (D) CREATE DOWNLOAD LINK
  var url = window.URL.createObjectURL(myBlob);
  var anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "demo.csv";

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
  var myBlob = new Blob([str], { type: "text/csv" });

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

myForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const input = myFile.files[0];
  const fileExtention = myFile.files[0].type;
  const reader = new FileReader();
  let data;
  let nounList = [];
  let sortedCount = [];
  let counterObj = {};

  reader.onload = function (e) {
    const DICT_PATH = "./dict";
    const text = e.target.result;
    if (fileExtention === "text/tab-separated-values") {
      data = tsvToArray(text);
    } else if (fileExtention === "text/csv") {
      data = csvToArray(text);
    }
    let preProcessList = data.map(({ product_id, product_name, keyword }) => ({
      product_id,
      product_name,
      keyword,
    }));
    //console.log(typeof preProcessList);
    const preProcessEntries = Object.values(preProcessList);
    //convertToCSV(preProcessEntries, "preProcess");
    //convertToTSV(preProcessEntries, "preProcess");
    let keyWordCollection = data.map(({ product_name, keyword }) => ({
      product_name,
      keyword,
    }));
    let keywordProcess = Object.values(keyWordCollection);
    var keyText = JSON.stringify(keywordProcess);
    keyText = keyText.replaceAll("product_name", "");
    keyText = keyText.replaceAll("keyword", "");
    keyText = keyText.replaceAll(/\|/g, " ");
    keyText = keyText.replaceAll(":", " ");
    keyText = keyText.replaceAll(/(?:\r\n|\r|\n)/g, " ");
    keyText = keyText.replaceAll("{", " ");
    keyText = keyText.replaceAll("}", " ");
    console.log(keyText);

    kuromoji.builder({ dicPath: "./dict" }).build((err, tokenizer) => {
      if (err) {
        console.log(err);
      }
      const tokens = tokenizer.tokenize(keyText); // 解析データの取得
      tokens.forEach((token) => {
        // 解析結果を順番に取得する
        console.log(token);
        if (token.pos == "名詞") {
          nounList.push(token);
        }
      });
      for (let token of nounList) {
        counterObj[token.surface_form] =
          1 + (counterObj[token.surface_form] || 0);
      }
      for (var noun in counterObj) {
        sortedCount.push([noun, counterObj[noun]]);
      }
      console.log(sortedCount);
    });
    /** 
      sortedCount.sort(function (a, b) {
        return b[1] - a[1];
      });
      
      saveArrayCSV(sortedCount);
    });*/
  };

  reader.readAsText(input);
});
