const myForm = document.getElementById('myForm');
const myFile = document.getElementById('myFile');
const keywordList = [];
var arrayLength = 0;

function failureCallback() {
  console.log('This is failure callback');
}

function tsvToArray(str, delimiter = '\t') {
  const headers = str.slice(0, str.indexOf('\n')).split(delimiter);
  for (var i = 0; i < headers.length; i++) {
    headers[i] = headers[i].replace(/"/g, '');
  }
  const rows = str.slice(str.indexOf('\n') + 1).split('\n');
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
function csvToArray(str, delimiter = ',') {
  const headers = str.slice(0, str.indexOf('\n')).split(delimiter);
  const rows = str.slice(str.indexOf('\n') + 1).split('\n');

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
  var csvOutput = '';
  for (let row of array) {
    csvOutput += row + '\n';
    for (let col of row) {
      csvOutput += col + ',';
    }
    csvOutput += '\r\n';
  }
  // (C) CREATE BLOB OBJECT
  var myBlob = new Blob([csvOutput], { type: 'text/csv' });

  // (D) CREATE DOWNLOAD LINK
  var url = window.URL.createObjectURL(myBlob);
  var anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = title + '.csv';

  // (E) "FORCE DOWNLOAD"
  // NOTE: MAY NOT ALWAYS WORK DUE TO BROWSER SECURITY
  // BETTER TO LET USERS CLICK ON THEIR OWN
  anchor.click();
  window.URL.revokeObjectURL(url);
  anchor.remove();
}

// arr to TSV
function saveTSV(array, title) {
  var csvOutput = '';
  for (let row of array) {
    for (let col of row) {
      csvOutput += col + '\t';
    }
    csvOutput += '\r\n';
  }
  // (C) CREATE BLOB OBJECT
  var myBlob = new Blob([csvOutput], { type: 'text/csv' });

  // (D) CREATE DOWNLOAD LINK
  var url = window.URL.createObjectURL(myBlob);
  var anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = title + '.tsv';

  // (E) "FORCE DOWNLOAD"
  // NOTE: MAY NOT ALWAYS WORK DUE TO BROWSER SECURITY
  // BETTER TO LET USERS CLICK ON THEIR OWN
  anchor.click();
  window.URL.revokeObjectURL(url);
  anchor.remove();
}

// obj to CSV
function convertToCSV(objArray, fileName) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';
  str += Object.keys(objArray[0]) + '\n';
  for (var i = 0; i < array.length; i++) {
    var line = '';
    for (var index in array[i]) {
      if (line != '') line += ',';

      line += array[i][index];
    }

    str += line + '\r\n';
  }

  // (C) CREATE BLOB OBJECT
  var myBlob = new Blob([str], { type: 'text/csv' });

  // (D) CREATE DOWNLOAD LINK
  var url = window.URL.createObjectURL(myBlob);
  var anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName + '.csv';

  // (E) "FORCE DOWNLOAD"
  // NOTE: MAY NOT ALWAYS WORK DUE TO BROWSER SECURITY
  // BETTER TO LET USERS CLICK ON THEIR OWN
  anchor.click();
  window.URL.revokeObjectURL(url);
  anchor.remove();
}

// obj to TSV
function convertToTSV(objArray, fileName) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';
  str += Object.keys(objArray[0]);
  for (var i = 0; i < array.length; i++) {
    var line = '';
    for (var index in array[i]) {
      if (line != '') line += '\t';

      line += array[i][index];
    }

    str += line + '\r\n';
  }

  // (C) CREATE BLOB OBJECT
  var myBlob = new Blob([str], { type: 'text/tsv' });

  // (D) CREATE DOWNLOAD LINK
  var url = window.URL.createObjectURL(myBlob);
  var anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName + '.tsv';

  // (E) "FORCE DOWNLOAD"
  // NOTE: MAY NOT ALWAYS WORK DUE TO BROWSER SECURITY
  // BETTER TO LET USERS CLICK ON THEIR OWN
  anchor.click();
  window.URL.revokeObjectURL(url);
  anchor.remove();
}

var processItem = {},
  processItems = [];
myForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const input = myFile.files[0];
  const fileExtention = myFile.files[0].type;
  const reader = new FileReader();
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let data;
  let nounList = [];
  reader.onload = function (e) {
    const text = e.target.result;
    if (fileExtention === 'text/tab-separated-values') {
      data = tsvToArray(text);
    } else if (fileExtention === 'text/csv') {
      data = csvToArray(text);
    }

    let categoryCollection = data.map(
      ({ category_name, sub_category_name }) => ({
        category_name,
        sub_category_name,
      }),
    );
    let categoryList = [];
    let subCategoryList = [];
    let finalCategoryList = [];
    let finalSubCategoryList = [];

    let categoryProcess = Object.entries(categoryCollection)
      .slice(0, data.length - 1)
      .map((entry) => entry[1]);
    categoryProcess.forEach((name) => {
      categoryList.push(name['category_name']);
      subCategoryList.push(name['sub_category_name']);
    });

    let categoryText = categoryList
      .toString()
      .replace(/"/g, String.fromCharCode(160))
      .replace(/\s/g, '');
    let subCategoryText = subCategoryList
      .toString()
      .replace(/"/g, String.fromCharCode(160))
      .replace(/\s/g, '');
    categoryList = [];
    subCategoryList = [];
    categoryList = categoryText.split(',');
    categoryList = _.uniq(categoryList);
    console.log(categoryList);
    subCategoryList = subCategoryText.split(',');
    subCategoryList = _.uniq(subCategoryList);
    console.log(subCategoryList);
    let preProcessList = data.map(({ product_id, product_name, keyword }) => ({
      product_id,
      product_name,
      keyword,
    }));
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

    let dataSize = keyWordCollection.length;

    let keywordProcess = Object.entries(keyWordCollection)
      .slice(0, 100)
      .map((entry) => entry[1]);
    keywordProcess.forEach((product) => {
      //console.log(product["product_id"]);
      let keyText = JSON.stringify(product['keyword']);
      let nameText = JSON.stringify(product['product_name']);
      keyText = keyText
        .replaceAll(/\|/g, ',')
        .replaceAll(/\\/g, String.fromCharCode(160));
      nameText = nameText
        .replaceAll(/\|/g, ',')
        .replaceAll(/\\/g, String.fromCharCode(160));
      var keywordNoun = '';
      rma = new RakutenMA(model_ja);
      rma.featset = RakutenMA.default_featset_ja;
      rma.hash_func = RakutenMA.create_hash_func(15);
      var tokens = rma.tokenize(
        HanZenKaku.hs2fs(HanZenKaku.hw2fw(HanZenKaku.h2z(keyText))),
      );

      var nameTokens = rma.tokenize(
        HanZenKaku.hs2fs(HanZenKaku.hw2fw(HanZenKaku.h2z(nameText))),
      );

      for (let i = 0; i < nameTokens.length; i++) {
        for (let j = 0; j < nameTokens[i].length; j++) {
          if (
            nameTokens[i][j] == 'N-n' ||
            nameTokens[i][j] == 'N-nc' ||
            nameTokens[i][j] == 'N-pn'
          ) {
            nounList.push(nameTokens[i][j - 1]);
          }
        }
      }
      for (let i = 0; i < tokens.length; i++) {
        for (let j = 0; j < tokens[i].length; j++) {
          if (
            tokens[i][j] == 'N-n' ||
            tokens[i][j] == 'N-nc' ||
            tokens[i][j] == 'N-pn'
          ) {
            nounList.push(tokens[i][j - 1]);
          }
        }
      }

      nounList = _.uniq(nounList);

      for (var i = 0; i < nounList.length; i++) {
        let currentNoun = nounList[i];
        if (categoryList.includes(currentNoun)) {
          finalCategoryList.push(currentNoun);
        } else if (subCategoryList.includes(currentNoun)) {
          finalSubCategoryList.push(currentNoun);
        }
      }

      finalCategoryList = _.uniq(finalCategoryList);
      finalSubCategoryList = _.uniq(finalSubCategoryList);
      let categoryNounList = '';
      let subCategoryNounList = '';
      for (noun in nounList) {
        if (categoryList.includes(nounList[noun])) {
          categoryNounList += nounList[noun] + ' ';
          keywordNoun += nounList[noun] + ' ';
        } else if (subCategoryList.includes(nounList[noun])) {
          subCategoryNounList += nounList[noun] + ' ';
          keywordNoun += nounList[noun] + ' ';
        } else {
          keywordNoun += nounList[noun];
          keywordNoun += ' ';
        }
      }
      processItems.push({
        product_id: product['product_id'],
        keyword_noun: keywordNoun,
      });

      categoryCombination.push({
        product_id: product['product_id'],
        category: categoryNounList,
        subCategory: subCategoryNounList,
      });
      //console.log(categoryCombination);
      nounList = [];
      keywordNoun = '';
    });
    finalCategoryList = _.uniq(finalCategoryList);
    finalSubCategoryList = _.uniq(finalSubCategoryList);

    //setTimeout(console.log(categoryCombination), 2000);
    setTimeout(exportFile(processItems, 'process'), 20000);
    setTimeout(exportFile(categoryCombination, 'categoryCombo', 21000));
    setTimeout(keywordCategoryMatch(processItems, categoryCombination), 2000);
  };

  reader.readAsText(input);
});

function exportFile(object, filename) {
  convertToCSV(object, filename);
  convertToTSV(object, filename);
  console.log(object);
}
