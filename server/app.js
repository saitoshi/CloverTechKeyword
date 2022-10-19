const puppeteer = require('puppeteer');
const keyword = 'boats';
const fs = require('fs');
const parse = require('csv-parse/sync');

function csvToArray(src) {
  let data = fs.readFileSync(src);
  let dataList = parse.parse(data, {
    columns: true,
  });
  return dataList;
}
function keywordSerch() {
  let categoryData = fs.readFileSync('sampleFile/category.csv');
  let categoryList = parse.parse(categoryData, {
    columns: true,
  });
  let keywordData = fs.readFileSync('sampleFile/noun.csv');
  let keywordList = parse.parse(keywordData, {
    columns: true,
  });
  console.log(categoryList);
  console.log(keywordList);
}
async function keywordSearch() {
  // initialize a new collection filled with product_id, (category, keyword ) pair, count
  let keywordCategoryMatch = [];

  //get the categoryItems
  let categoryItems = csvToArray('sampleFile/category.csv');
  //get the nounItems List
  let nounItems = csvToArray('sampleFile/noun.csv');
  // loop through each proeuct in the category, subcategory list
  categoryItems.forEach(async (category) => {
    // for each product in the category&subcategory list
    // get the current product_id
    let currentProduct = category['product_id'];
    // get the current keyword of the current product id
    let currentKeyword = nounItems.find(
      (x) => x.product_id === currentProduct,
    ).keyword_noun;

    // split the keyword into

    let currentKeyList = currentKeyword.split(' ');

    let categoryGroup = categoryItems.find(
      (x) => x.product_id === currentProduct,
    ).category;
    let categoryList = categoryGroup.split(' ');
    for (let i = 0; i < categoryList.length - 1; i++) {
      let count = 0;
      while (count < currentKeyList.length - 1) {
        console.log(categoryList[i] + ',' + currentKeyList[count]);
        let searchQuery = categoryList[i] + ',' + currentKeyList[count];
        // open browser
        count = count + 1;
      }
    }

    let subcategoryGroup = categoryItems.find(
      (x) => x.product_id === currentProduct,
    ).subCategory;

    if (subcategoryGroup.length !== 0) {
      let subCategoryList = subcategoryGroup.split(' ');
      for (let i = 0; i < subCategoryList.length - 1; i++) {
        let count = 0;
        while (count < searchKeyword.length - 1) {
          if (subCategoryList[i] !== searchKeyword[count]) {
            console.log(subCategoryList[i] + ' , ' + searchKeyword[count]);
          }
          count = count + 1;
        }
      }
    }
  });
}
async function asyncCall() {
  // open a new browser
  const browser = await puppeteer.launch();

  // create a new page
  const page = await browser.newPage();

  // navigate to google
  await page.goto('https://www.google.com');

  // type slowly and parse the keyword
  await page.type("*[name='q']", 'sail boats b', { delay: 500 });

  // go to ul class listbox
  await page.waitForSelector("ul[role='listbox']");

  // extracting keywords from ul li span
  const search = await page.evaluate(() => {
    // count over the li's starting with 0
    let listBox = document.body.querySelectorAll(
      "ul[role='listbox'] li .wM6W7d",
    );
    // loop over each li store the results as x
    let item = Object.values(listBox).map((x) => {
      return {
        keyword: x.querySelector('span').innerText,
      };
    });
    return item;
  });

  // logging results
  console.log(search);

  await browser.close();
}

keywordSearch();
//keywordSerch();
