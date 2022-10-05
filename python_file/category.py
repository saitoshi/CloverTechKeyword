import csv
import pandas as pd
import requests
with open('category.csv', 'r') as read_obj:
    csv_reader = csv.reader(read_obj)
    categoryList= list(csv_reader)
    print(categoryList[2])

df_category = pd.read_csv("category.csv")['カテゴリ名']

df_subCategory= pd.read_csv("category.csv")['サブカテゴリ']

categoryList = df_category.to_list();
subCategoryList = df_subCategory.to_list();
print(categoryList);

r = requests.get('https://aramakijake.jp/') 
# print content of request
print(r.url)
   
print(r.status_code)