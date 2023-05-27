# HelsinkiCityBikeApp

[The app is deployed to Google Cloud](https://storage.googleapis.com/joelvuolevi/bikeapp/index.html)


## General Information

The app is designed for exploring stations and trips made with Helsinki city bikes.

## Features

In 'Station' mode, users can browse through a list of stations where bikes can be rented or returned. After clicking on a station, Google Maps will be displayed along with additional buttons for details.

- 'Ave Departure' will display aggregated trip data from the station, as well as a radial heatmap revealing the direction bikes are headed.
- 'Ave Return' will display aggregated trip data to the station, as well as a radial heatmap revealing the direction bikes are coming from.
- 'Top Departure' will show the top 5 departures from this station as clickable Google Map markers. Clicking on a marker will reveal details about the specific journey.
- 'Top Return' will similarly show the top 5 returns to this station as clickable Google Map markers. Clicking on a marker will reveal details about the specific journey.

The station view also includes a search bar.

In 'Trip' mode, users can browse through individual trips from one station to another. These trips are sorted by time and shown one day at a time. Due to the large number of trips, even within one day, the trip view allows for coarse scrolling on the left and fine (normal) scrolling on the right. At the beginning and end of the scrollable section, there are buttons for 'Previous Day' and 'Next Day', respectively. Users can also change the date by clicking the date button.

With the Departure and Return dropdown menus, users can filter trips from and to a particular station. Since the amount of data is much smaller in this view, the entire date range will be shown. Finally, when the user clicks on a particular trip, it will be displayed on Google Maps. From there, the user can also click on the departure or return station to return to the station view.


Here are some screenshots from the app:



 **Figure 1: Browse trips and view them as arrows on the map:**
 
 <p align="left">
 <img src="https://storage.googleapis.com/joelvuolevi/bikeapp/bikeapp_feature1.png" width="750" height="450">
 </p>
 


**Figure 2: Browse stations and view the most popular destinations/origins as clickable markers:**

<p align="left">
 <img src="https://storage.googleapis.com/joelvuolevi/bikeapp/bikeapp_feature2.png" width="750" height="450">
 </p>



**Figure 3: Browse stations and view departing/arriving traffic as heatmaps indicating the direction bikes are heading to/arriving from:**

<p align="left">
 <img src="https://storage.googleapis.com/joelvuolevi/bikeapp/bikeapp_feature3.png" width="750" height="450">
 </p>
 
The heatmap data can provide insight into bike traffic patterns and help the bike operator allocate bikes more efficiently.




## Setup

To run the app you will need:
- index.html
- main_bike_app2.js
- aux_functions.js
- style.css

You will also need to download and import ```stations_HelsinkiEspoo.json```
or have it delivered dynamically by a cloud function:
```https://jsonhandler-c2cjxe2frq-lz.a.run.app/?action=stations```

Finally, you will need an API key for Google Maps. To run the app locally you can simply create secret.js file as follows (see index.html how to use it):

```
const API_KEY = �API_KEY� 
const script = document.createElement('script');
script.src = API_KEY;
script.async = true;
script.defer = true;
document.head.appendChild(script);
```

## Technologies Used
The frontend is written in JavaScript, HTML, and CSS and the backend is powered by Google Cloud Functions.

## Testing

```
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
import random
import time

def openbroswer(browser):
    if browser=='Chrome':
        from selenium.webdriver.chrome.service import Service
        from selenium.webdriver.chrome.options import Options
        s=Service('C:/Program Files (x86)/chromedriver.exe')
        driver = webdriver.Chrome(service=s)
    if browser=='Firefox':
        from selenium.webdriver.firefox.service import Service
        from selenium.webdriver.firefox.options import Options
        options = Options()
        options.binary_location = 'C:/Program Files/Mozilla Firefox/firefox.exe'  # Path to the Firefox binary
        s = Service('C:/Program Files (x86)/geckodriver.exe')  # Path to the geckodriver executable
        driver = webdriver.Firefox(service=s, options=options)
    if browser=='Edge': 
        from msedge.selenium_tools import Edge, EdgeOptions
        driver_path = 'C:/Program Files (x86)/msedgedriver.exe'
        options = EdgeOptions()
        driver = Edge(executable_path=driver_path, options=options)
           
    return driver

def randomdate():
    element = driver.find_element(By.ID, "tripview")
    element.click()
    element = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "menu")))
    time.sleep(1)
    element = driver.find_element(By.ID, "currentdate")
    element.click()
    time.sleep(1)
    items = driver.find_elements(By.CLASS_NAME, 'generatedCell')
    random_item = random.choice(items)
    random_item.click()
    time.sleep(1)
    wait = WebDriverWait(driver, 10)
    wait.until(EC.element_to_be_clickable((By.ID, "fin")))
    
def clickrandomdiv(menu, div,subdiv,close):
    element = driver.find_element(By.ID, menu)
    element.click()
    element = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, div)))  
    time.sleep(1)
    items = element.find_elements(By.CSS_SELECTOR, subdiv)
    random_item = random.choice(items)
    random_item.click()
    if close=='close':
        time.sleep(2)
        element = driver.find_element(By.ID, "closemap")
        element.click()
        
def clickspecialbutton(specialbuttons):
    random_item = random.choice(specialbuttons)
    element = driver.find_element(By.ID, random_item)
    element.click()        
        
        
        
        
def click_random_button(driver, excluded_buttons=[]):
    elements = driver.find_elements(By.XPATH, "//button")
    ids = [element.get_attribute("id") for element in elements if element.get_attribute("id") not in excluded_buttons]

    while True:    
        random_id = random.choice(ids)
        if random_id:
            button_to_click = driver.find_element(By.XPATH, "//button[@id='" + random_id + "']")
            if button_to_click.is_enabled() and button_to_click.is_displayed() and len(button_to_click.get_attribute("id")):
                print(random_id)
                button_to_click.click()
                wait = WebDriverWait(driver, 10)
                wait.until(EC.element_to_be_clickable((By.ID, "fin")))
                print('Successfully clicked ' + button_to_click.get_attribute("id"))
                wait = WebDriverWait(driver, 10)
                wait.until(EC.element_to_be_clickable((By.ID, "fin")))
                break
    return    
    


driver=openbroswer('Edge')

url='http://127.0.0.1:5173/HelsinkiCityBikeApp/'
driver.get(url)

function_probabilities = [0,0.2,0.2,0.2,0.2,0.2] 

for x in range(50):
    #time.sleep(0.3)
    random_index = random.choices(range(len(function_probabilities)), function_probabilities)[0]
    if random_index==0:
        clickrandomdiv("tripview","menu","div.menu-item","close")
    if random_index==1:
        clickrandomdiv("stationview","stat_menu","div.menu-item","noclose")
        time.sleep(1)
        specialbuttons = ['TopDeparture', 'TopReturn', 'HeatmapDeparture', 'HeatmapReturn']
        clickspecialbutton(specialbuttons)
        time.sleep(1)
        clickspecialbutton(['closemap'])
    if random_index==2:
        clickrandomdiv("tripview","menu","div.menu-item","close")
    if random_index==3:
        clickrandomdiv("stationview","stat_menu","div.menu-item","close")        
    if random_index==4:
        randomdate()
    if random_index==5:
        click_random_button(driver, excluded_buttons=['currentdate','cleartext',"''",'fin','swe','eng','distance','duration'])

driver.quit()
```





## Data

The station data is converted to JSON format with the station ID as the key. Here is the Python script:
```
import pandas as pd
import json
import numpy as np
df = pd.read_csv(r"C:\Users\joel_\Downloads\Helsingin_ja_Espoon.csv")
df = df.set_index('ID')
# Convert the DataFrame to a JSON object
json_data = df.to_json(orient='index')
# Open the file for writing
with open("stations_HelsinkiEspoo.json", "w") as f:
    # Write the JSON object to the file
    json.dump(json_data, f)
    
```
The trip data is filtered to meet the following criteria:
- The trip must be at least 10 minutes long
- The trip must last at least 10 seconds
- The station ID must be a positive integer
- The return time must be later than the departure time
- The trip is not already included (multiple items deleted) 

The data is split into three different categories for ease of use:
- Per day (92 files)
- Per departure station ID (approx. 500 files)
- Per return station ID (approx. 500 files)

This results in three times the amount of data but provides it in small, useful chunks for faster fetching. 
Here is the Python script for creating the per day files (station files very similar):

```
from datetime import datetime

df5 = pd.read_csv(r"C:\Users\joel_\Downloads\2021-05.csv")
df6 = pd.read_csv(r"C:\Users\joel_\Downloads\2021-06.csv")
df7 = pd.read_csv(r"C:\Users\joel_\Downloads\2021-07.csv")

df_all = pd.concat([df5, df6])
df_all = pd.concat([df_all, df7])
#startmonth = 5
startyear = 2021
dayinmonth=[31,30,31]
for startmonth in range(5,7):
    for startday in range(1,dayinmonth[startmonth-5]+1):
        df=df_all
        df = df.drop(columns=['Departure station name','Return station name'])
        start_time = pd.to_datetime(str(startyear) +"-" + str(startmonth).zfill(2) + "-" + str(startday).zfill(2) + "T00:00:00")
        end_time = pd.to_datetime(str(startyear) +"-" + str(startmonth).zfill(2) + "-" + str(startday).zfill(2) + "T23:59:59")
        df['Departure2'] = pd.to_datetime(df['Departure'])
        df = df[(df['Departure2'] >= start_time) & (df['Departure2'] <= end_time)]

        mask = df.duplicated()
        df = df[~mask]
        delrows = []
        relreason = []

        for index, row in df.iterrows():
            if df['Covered distance (m)'][index]<10 or df['Duration (sec.)'][index]<10:
                delrows.append(index)
                relreason.append(1)
            start_time = datetime.fromisoformat(df['Departure'][index]).timestamp()    
            end_time = datetime.fromisoformat(df['Return'][index]).timestamp()         
            if start_time>end_time:
                delrows.append(index)
                relreason.append(2) 

            depstatval=df['Departure station id'][index]                
            if not (isinstance(depstatval, (int, np.int64)) and depstatval > 0):
                delrows.append(index)
                relreason.append(3) 
            retstatval=df['Return station id'][index]                
            if not (isinstance(retstatval, (int, np.int64)) and retstatval > 0):
                delrows.append(index)
                relreason.append(4)         

        df.drop(delrows, inplace=True) 

        df = df.drop(columns=['Return','Departure2'])
        df = df.iloc[::-1] # time goes up down
        # shorter names better for json
        df = df.rename(columns={'Departure station id': 'did', 'Return station id': 'rid', 'Covered distance (m)': 'dis', 'Duration (sec.)': 'time'}) 
        df['dis'] = (df['dis']/1000).round(1) # distance in km with one decimal
        df['time'] = (df['time']/60).round().astype(int) # time in min no decimal
        df = df.reset_index(drop=True) 

        if not df.empty:
            filename='bikedata2/' + str(startyear) +"-" + str(startmonth).zfill(2) + "-" + str(startday).zfill(2) + '.json'
            with open(filename, "w") as f:
                filename='bikedata1/' + str(startyear) +"-" + str(startmonth).zfill(2) + "-" + str(startday).zfill(2) + '.csv'
                df.to_csv(filename, index=False)

```

The data files are saved as CSV and uploaded to Google Storage. They are served by a cloud function written in Python, which returns the data in JSON format. The code for the cloud function is here.


```

import functions_framework
from io import StringIO
import pandas as pd
from google.cloud import storage
import json

storage_client = storage.Client()
bucket_name = 'joeltestfiles'
BUCKET = storage_client.get_bucket(bucket_name)

@functions_framework.http
def readcsv(request):

    request_json = request.get_json(silent=True)
    request_args = request.args
    if request_json and 'action' in request_json:
       action = request_json['action']
    elif request_args and 'action' in request_args:
       action = request_args['action']
    else:
       action = '2021-05-09'

    filename = 'bikedata/' + action + '.csv'

    blob = BUCKET.get_blob(filename)
    csv_content = blob.download_as_string().decode("utf-8")
    df = pd.read_csv(StringIO(csv_content))

    json_data = df.to_json(orient='index')

    headers= {
      'Access-Control-Allow-Origin': '*',
      'Content-Type':'application/json'
    }
    return (json_data, 200, headers)

```

## Room for improvement
- Add more flexibility in browsing trips and stations
- Improve the effectiveness of the calendar pop-up for all types of filtering
- Introduce more filters and sorting options
- Address issues with very small layout sizes
- Enhance the language selection window.

