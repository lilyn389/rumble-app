import requests
import json
import YelpAPI
from flask import Flask, render_template

api_key = 'acc_c651ce375352b6e'
api_secret = '53b3e724f146702ab88cdec6e32e1551'
categorizer_id = 'personal_photos'

file = open("urls_.txt", "a+")
for i in YelpAPI.image:
    image_url = i
    response = requests.get('https://api.imagga.com/v2/categories/%s?image_url=%s' % (categorizer_id, image_url),
                    auth=(api_key, api_secret))
    parsed = json.loads(response.text)
    categories = parsed["result"]["categories"]
    for j in categories:
        if j["name"]["en"] == 'food drinks':
            main_img = i
            file.write(main_img+'\n')
file.close()