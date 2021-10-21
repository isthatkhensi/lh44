from flask import Flask, render_template, url_for, redirect
import datetime
import requests
import json
import wikipedia
from abc import abstractproperty
import os
from googleapiclient.discovery import build
from httplib2 import Response

app = Flask(__name__)

req = requests.get('http://ergast.com/api/f1.json?limit=1000')
ham44 = requests.get('https://ergast.com/api/f1/drivers/hamilton.json')
results = requests.get('https://ergast.com/api/f1/drivers/hamilton/results.json?limit=300')
pos1 = requests.get('https://ergast.com/api/f1/drivers/hamilton/results/1.json?limit=100')
teamResp = requests.get('http://ergast.com/api/f1/constructors/mercedes.json')
lastRace = requests.get('https://ergast.com/api/f1/current/last.json')
nextRace = requests.get('https://ergast.com/api/f1/current/next.json')
circuitList = requests.get('https://ergast.com/api/f1/circuits.json?limit=100')
wdc = requests.get('https://ergast.com/api/f1/drivers/hamilton/driverStandings/1.json')
standings = requests.get('https://ergast.com/api/f1/current/driverStandings.json')

# loads method converts the data from a string to a json
raceData = results.json()
lRace = lastRace.json()
nRace = nextRace.json()

# adding up the points from the datasource
pointsArray = []
for detail in raceData["MRData"]["RaceTable"]["Races"]:
    for point in detail["Results"]:
        pointsArray.append(point['points'])
       
ints = [float(item) for item in pointsArray]

#convert datetime for later use
for date in lRace["MRData"]["RaceTable"]["Races"]:
    lastRaceDate = date['date']
    lastRaceDate = datetime.datetime.strptime(lastRaceDate, '%Y-%m-%d')
    lastRaceDate = lastRaceDate.strftime("%d %B %Y")

for date in nRace["MRData"]["RaceTable"]["Races"]:
    nextRaceDate = date['date']
    nextRaceDate = datetime.datetime.strptime(nextRaceDate, '%Y-%m-%d')
    nextRaceDate = nextRaceDate.strftime("%d %B %Y")  



#YouTube API

api_key = os.environ.get('lhYT_api_key')

youtube = build('youtube', 'v3', developerKey=api_key)


request = youtube.search().list(
    part='snippet',
    channelId="UCB_qr75-ydFVKSF9Dmo6izg",
    q="hamilton",
    type="video",
    maxResults="5",
    order="rating",
)

searchResult = request.execute()

videoIds = []
for item in searchResult['items']:
    if item['snippet']['title'].find("Hamilton") != -1:
        videoIds.append(item['id']['videoId'])

vid_request = youtube.videos().list(
    part="player",
    id=','.join(videoIds)
)

vid_response = vid_request.execute()

embedHtml = []
for item in vid_response['items']:
    embedHtml.append(item['player']['embedHtml'])



#start template routes and variable passes
@app.route('/')
@app.route('/home')
def index(): 
    data = json.loads(results.content)
    wins = json.loads(pos1.content)
    last = json.loads(lastRace.content)
    next = json.loads(nextRace.content)
    points = ints
    return render_template('index.html', data=data["MRData"], wins=wins["MRData"], races=data["MRData"]["RaceTable"]["Races"], points=sum(points), lastRace=last["MRData"]["RaceTable"]["Races"], nextRace=next["MRData"]["RaceTable"]["Races"], nextRaceDate=nextRaceDate, lastRaceDate=lastRaceDate )
    

 
@app.route('/stats')
def stats():
    data = json.loads(results.content)
    dstandings = json.loads(standings.content)
    last = json.loads(lastRace.content)
    circuits = json.loads(circuitList.content)
    return render_template('stats.html', races=data["MRData"]["RaceTable"]["Races"], lastRace=last["MRData"]["RaceTable"]["Races"], standings=dstandings["MRData"]["StandingsTable"]["StandingsLists"], circuits=circuits["MRData"]["CircuitTable"]["Circuits"]  )

@app.route('/about')
def about():
    merc = wikipedia.summary("Mercedes-Benz in Formula One")
    lh = wikipedia.summary("Lewis Hamilton")
    hamilton = json.loads(ham44.content)
    wdc_wins = json.loads(wdc.content)

    #calculate Hamilton career years
    careeer_start = datetime.date(2007, 3, 18).year
    current_year = datetime.datetime.today().year
    active_years = current_year - careeer_start
    data = json.loads(results.content)
    points = ints
    return render_template('about.html', races=data["MRData"]["RaceTable"]["Races"], bio=lh, active_years=active_years, points=sum(points), hamilton=hamilton["MRData"]['DriverTable']['Drivers'], world_titles=wdc_wins['MRData'], yt_videos=embedHtml, merc=merc)

@app.route('/gallery')
def gallery():
    return render_template('gallery.html')

@app.route('/schedule')
def schedule():
    return render_template('schedule.html')

if __name__ == "__main__":
    app.run(debug=True, threaded=True)
    

