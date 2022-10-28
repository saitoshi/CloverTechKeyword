import csv
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import requests
with open('category.csv', 'r') as read_obj:
    csv_reader = csv.reader(read_obj)
    categoryList= list(csv_reader)
    print(categoryList[2])

df_category = pd.read_csv("category.csv")['カテゴリ名']

df_subCategory= pd.read_csv("category.csv")['サブカテゴリ']

df_keywordNoun = pd.read_csv("noun.csv")['keyword_noun']

#categoryList = df_category.to_list();
#subCategoryList = df_subCategory.to_list();
#keywordList = df_keywordNoun.to_list();
#print(categoryList);
print(df_keywordNoun[0].split());