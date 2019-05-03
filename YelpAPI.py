
# Business Search      URL -- 'https://api.yelp.com/v3/businesses/search'
# Business Match       URL -- 'https://api.yelp.com/v3/businesses/matches'
# Phone Search         URL -- 'https://api.yelp.com/v3/businesses/search/phone'

# Business Details     URL -- 'https://api.yelp.com/v3/businesses/{id}'
# Business Reviews     URL -- 'https://api.yelp.com/v3/businesses/{id}/reviews'

# Businesses, Total, Region

# Import the modules
import random
import requests
import json

# Define a business ID
biz_id = []
image = []
unix_time = 1546047836

# Define my API Key, My Endpoint, and My Header
API_KEY = 'd-yJQSQLB6kXGGMW3-FDyGNeBXW-j89QbZxiWayPSg_9zKqo3IGyKhLZCXpDxM45ClJLMVoJzLt-w-FJBP4G4muQEq-PrNVw35r56-frAONXuqGPNlGGGFEqeZjGXHYx'
ENDPOINT = 'https://api.yelp.com/v3/businesses/search'
HEADERS = {'Authorization': 'bearer %s' % API_KEY}

# Define my parameters of the search
# BUSINESS SEARCH PARAMETERS - EXAMPLE
PARAMETERS = {'term': 'food', 'location': 'College Station', 'limit': '50', 'offset': '100'}

# BUSINESS MATCH PARAMETERS - EXAMPLE
# PARAMETERS = {'name': 'Peets Coffee & Tea',
#              'address1': '7845 Highland Village Pl',
#              'city': 'San Diego',
#              'state': 'CA',
#              'country': 'US'}

# Make a request to the Yelp API
response = requests.get(url=ENDPOINT,
                        params=PARAMETERS,
                        headers=HEADERS)

# print('The status code is {}'.format(response.status_code))
parsed = json.loads(response.text)
# print(json.dumps(parsed, indent=4))

businesses = parsed["businesses"]
random.shuffle(businesses)

file = open("urls_.txt", "w")
for business in businesses[:1]:
    biz_id = business["id"]
    ENDPOINT = 'https://api.yelp.com/v3/businesses/{}'.format(biz_id)
    res = requests.get(url=ENDPOINT, headers=HEADERS)
    biz_data = res.json()
    image = biz_data["photos"]
    file.write(business["name"]+'\n')
    for i in business["categories"][:1]:
        file.write(i["title"]+'\n')
    file.write("Rating: "+'{}'.format(business["rating"])+'\n')
    file.write(" ".join(business["location"]["display_address"])+'\n')
    file.write("Phone: " +business["phone"]+'\n')
    # print("Price:", business["price"])
    # image = biz_data["photos"]
    # print(image[0])
file.close()

# Convert the JSON String
# business_data = response.json()

# print the response
# print(json.dumps(business_data, indent = 3))