const myForm = document.getElementById("myForm");
const myFile = document.getElementById("myFile");
const DICT_PATH = "./dict";
const keywordList = [];

//
//convert tsv into an array
function tsvToArray2(str, delimiter = "\t") {
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
  for (var i = 0; i < headers.length; i++) {
    headers[i] = headers[i].replace(/"/g, "");
  }
  const rows = str.slice(str.indexOf("\n")).split("\t");

  var arr = [];
  let countIndex = headers.length - 1;

  for (var i = 0; i < headers.length; i++) {
    let index = countIndex * i;
    var obj = {};
    let endPoint = index + countIndex;
    let rowWork = rows.slice(index, endPoint);
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = rowWork[j];
    }
    arr.push(obj);
  }
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

function saveCSV(array) {
  var csv = "";
  // (B) ARRAY TO CSV STRING
  csv += "キーワード";
  csv += "回数";
  csv += "\r\n";
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

myForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const input = myFile.files[0];
  const fileExtention = myFile.files[0].type;
  const reader = new FileReader();
  var dataValue = [];
  let data;
  var productID = [];
  const nounList = [];
  let tokenList = [];
  let sortedCount = [];
  let counterObj = {};

  reader.onload = function (e) {
    const text = e.target.result;
    if (fileExtention === "text/tab-separated-values") {
      data = tsvToArray2(text);
    } else if (fileExtention === "text/csv") {
      data = csvToArray(text);
    }
    dataValue = _.values(data);
    productID.push(_.pluck(data, "product_id"));
    let keyText = JSON.stringify(dataValue);
    keyText = keyText.replaceAll(/\|/g, " ");
    keyText = keyText.replaceAll(":", " ");
    keyText = keyText.replaceAll(/(?:\r\n|\r|\n)/g, " ");
    keyText = keyText.replaceAll("{", " ");
    keyText = keyText.replaceAll("}", " ");
    kuromoji.builder({ dicPath: DICT_PATH }).build((err, tokenizer) => {
      const tokens = tokenizer.tokenize(keyText); // 解析データの取得
      console.log(tokens);
      tokens.forEach((token) => {
        tokenList.push(token);
        if (token.pos == "名詞" && token.word_id != 80) {
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

      sortedCount.sort(function (a, b) {
        return b[1] - a[1];
      });
      console.log(nounList);
    });
  };

  reader.readAsText(input);
});
