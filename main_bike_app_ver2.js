import './style.css'
import { openCalendarWindow, popupstations, mockSlider, koira, erasemarkersandpolylines } from './aux_functions.js';
var map;
var regulargooglemarker = []
var polyline = [];
//var stationdata
var stationskeys = []
var tripdata
var stationview = 1
var pagerange
var activestationid = 501
var heatmapmaxradius = 200
var displaymap = 1
var daterange = [[2021, 5, 1], [2021, 7, 31]]
var pulldownitemToStationID = []
var coarseSteps=200
var startdatestring = '2021-06-17'

var name = 'Nimi'
var address = 'Osoite'
var city = 'Kaupunki'
var helsinki = 'Helsinki'

const canvas = document.getElementById("circle");
const ctx = canvas.getContext("2d");



var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// station data transformed to json where station id is the key. json is imported and hardcoded into js for speed and importance
import * as data2 from './stations_HelsinkiEspoo.json'
var stationdata = data2.default

// here we define the layout 
var placeitems = [['stationview', 10, 2, 30, 9],
    ['tripview', 50, 2, 30, 9],
    ['menu', 10, 30, 70, 70],
    ['stat_menu', 10, 30, 70, 70],
    ['menu-time', 10, 30, 15, 70],
    ['stationtitle', 10, 23, 20, 6],
    ['cleartext', 42, 23, 8, 6],
    ['operator', 57, 23, 11, 6],
    ['capacity', 69, 23, 11, 6],
    ['distance', 62, 23, 6, 6],
    ['duration', 70, 23, 6, 6],
['filterStations', 31.5, 23, 6, 5],
['map-container', 10, 30, 70, 70],
['innercalendar', 10, 30, 70, 70],
['departure_dropdown', 28, 23, 16, 6],
['return_dropdown', 46, 23, 16, 6],
['infoboard', 10, 16, 40, 10],
['infoboard3', 51, 16, 30, 10],

['currentdate', 12, 12, 11, 17],

    ['TopDeparture', 12, 31, 10, 10],
    ['TopReturn', 24, 31, 10, 10],
    ['HeatmapDeparture', 41, 31, 10, 10],
    ['HeatmapReturn', 53, 31, 10, 10],
['closemap', 70, 31, 10, 10],
['backgroundgray', 5, 13, 90, 92],
['downloadboard', 10.5, 30.2, 68, 68],
    ['fin', 77, 1, 3.4, 3.7],
    ['swe', 77, 5, 3.4, 3.7],
    ['eng', 77, 9, 3.4, 3.7]]



fixitemsize(placeitems, 0.9, 1, 1)



// adjust layout after window resize
window.onresize = function () {
 
        fixitemsize(placeitems, 0.9, 1, 1)
 
};




function fixitemsize(placeitems, containerreltoScreen, woff, wfac) {
    // measure the container and place everything in relation
    document.getElementById('container').style.height = containerreltoScreen * window.innerHeight + 'px'

    const containerelement = document.querySelector("#container");
    var containerwidth = parseInt(window.getComputedStyle(containerelement).width)
    var containerheight = parseInt(window.getComputedStyle(containerelement).height)



    for (let i = 0; i < placeitems.length; i++) {

        const element = document.getElementById(placeitems[i][0])
        element.style.left = (containerwidth * placeitems[i][1] / 100 - woff) + 'px'
        element.style.top = containerheight * placeitems[i][2] / 100 + 'px'
        element.style.width = wfac * (containerwidth * placeitems[i][3] / 100) + 'px'
        element.style.height = containerheight * placeitems[i][4] / 100 + 'px'


    }

}

function stacknHide(stackElements, startZ, hideElements) {
    // makes elements visible and hidden based on what the user is doing
    for (let i = 0; i < stackElements.length; i++) {
        document.getElementById(stackElements[i]).style.zIndex = startZ + 30 - i
        document.getElementById(stackElements[i]).style.visibility = "visible"
    }
    for (let i = 0; i < hideElements.length; i++) {
        document.getElementById(hideElements[i]).style.visibility = "hidden"
    }
}

//  this is the starting view arrangement
stacknHide([], 1, ['currentdate', 'menu', 'menu-time', 'circle', 'downloadboard', 'distance', 'duration', 'departure_dropdown', 'return_dropdown', 'infoboard3', 'closemap', 'TopDeparture', 'TopReturn', 'HeatmapDeparture', 'HeatmapReturn', 'map-container'])


let departure_dropdown = document.getElementById("departure_dropdown");
let return_dropdown = document.getElementById("return_dropdown");

departure_dropdown.onchange = onSelectChange;
return_dropdown.onchange = onSelectChange;


document.getElementById('tripview').addEventListener("click", () => {

    stationview = -1
    document.getElementById('stationview').style.backgroundColor = '#ffffff'
    document.getElementById('tripview').style.backgroundColor = '#eeeeee'
    getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=' + startdatestring, 3)

})


document.getElementById('stationview').addEventListener("click", () => {
    stationview = 1
    document.getElementById('tripview').style.backgroundColor = '#ffffff'
    document.getElementById('stationview').style.backgroundColor = '#eeeeee'
    showstations()
})


document.getElementById('currentdate').addEventListener("click", changeDate);

const filterStations = document.getElementById('filterStations')

filterStations.addEventListener("input", () => {
    showstations()
})

const cleartext = document.getElementById('cleartext')

cleartext.addEventListener("click", () => {
    filterStations.value = "";
    showstations()
})

document.getElementById('fin').addEventListener("click", () => {
    name = 'Nimi'; address = 'Osoite'; helsinki = 'Helsinki'
    updatelanguage('fin')
})
document.getElementById('swe').addEventListener("click", () => {
    name = 'Namn'; address = 'Adress'; helsinki = 'Helsingfors'
    updatelanguage('swe')
})
document.getElementById('eng').addEventListener("click", () => {
    name = 'Name'; address = 'Osoite'; helsinki = 'Helsinki'
    updatelanguage('eng')
})

const statDetailButtons = document.querySelectorAll('.statdetails');

statDetailButtons.forEach(button => {
    button.addEventListener('click', event => {
       // alert(`Button ${event.target.id} was pressed.`);
        var addr = 'https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?'
       
        if (event.target.id == 'TopDeparture') {
            getdata(addr + 'action=D' + activestationid.toString(), 'rid', 0)
        }
        if (event.target.id == 'TopReturn') {
            getdata(addr + 'action=R' + activestationid.toString(), 'did', 0)
        }
        if (event.target.id == 'HeatmapDeparture') {
            getdata(addr + 'action=D' + activestationid.toString(), 'rid', 1)
        }
        if (event.target.id == 'HeatmapReturn') {
            getdata(addr + 'action=R' + activestationid.toString(), 'did', 1)
        }
    });
});


function updatelanguage(thislang) {
    document.getElementById('fin').style.opacity = 0.4
    document.getElementById('swe').style.opacity = 0.4
    document.getElementById('eng').style.opacity = 0.4
    document.getElementById(thislang).style.opacity = 1
    showstations()
}


function changeDate() {

    if (stationview == 1 || departure_dropdown.selectedIndex != 0 || return_dropdown.selectedIndex != 0) { return }

    const selectedDateNumerical = startdatestring.split("-").map(Number);
    var sss = selectedDateNumerical[2] + '.' + selectedDateNumerical[1] + '.' + selectedDateNumerical[0]
 
    var generatedHTML = openCalendarWindow(daterange[0][0], daterange[0][1] - 1, daterange[1][1], sss)
    document.getElementById("innercalendar").innerHTML = generatedHTML;
    
    let generatedCells = document.getElementsByClassName("generatedCell");
    document.getElementById("innercalendar").style.zIndex = 100
    
    for (let i = 0; i < generatedCells.length; i++) {
        generatedCells[i].addEventListener('click', function () {
            let param = this.getAttribute("data-param");              
            document.getElementById(sss).style.backgroundColor = '#ffffff'
            document.getElementById(param).style.backgroundColor = '#999999'
            
            var dates = param.split('.')
            startdatestring = dates[2].toString() + '-' + dates[1].toString().padStart(2, '0') + '-' + dates[0].toString().padStart(2, '0')

            document.getElementById("currentdate").innerHTML = months[dates[1] - 1] + ' ' + dates[0].toString() + '<BR>' + dates[2].toString()

           getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=' + startdatestring, 3)
            setTimeout(() => {
                document.getElementById("innercalendar").style.zIndex = -1
            }, 400)

        });
    }

}


function gettripdata(data) {

    stacknHide(['departure_dropdown', 'return_dropdown', 'distance', 'duration', 'currentdate', 'menu', 'menu-time'], 1, ['filterStations','stationtitle', 'cleartext', 'operator', 'capacity'])

    tripdata = {}
    var counter = 0
    var nroitems = Object.entries(data).length - 1
 
    for (let i = 0; i < nroitems; i++) {
        if (data[i]["did"] in stationdata && data[i]["rid"] in stationdata) {
            var temp = data[i]
            tripdata[counter] = temp
            counter++

        }

    }

    var stationdid = 0
    var stationrid = 0

    if (departure_dropdown.selectedIndex > 0) { stationdid = pulldownitemToStationID[departure_dropdown.selectedIndex - 1]; }
    if (return_dropdown.selectedIndex > 0) { stationrid = pulldownitemToStationID[return_dropdown.selectedIndex - 1]; }

    if (stationdid == 0 && stationrid == 0) {

        stacknHide(['menu-time','currentdate'], 1, [])

        menu.scrollTop = menu.scrollHeight * 0.5
        menuTime.scrollTop = menuTime.scrollHeight * (0.45 + 0.1 * Math.random())
    }
    else {
        var triptempdata = []

        stacknHide([], 1, ['menu-time', 'currentdate'])

        for (let i = 0; i < Object.entries(tripdata).length; i++) {
            if (tripdata[i]["did"] == stationdid && tripdata[i]["rid"] == stationrid) {
                triptempdata.push(tripdata[i])
            }
            if (stationdid == 0 && tripdata[i]["rid"] == stationrid) {
                triptempdata.push(tripdata[i])
            }
            if (tripdata[i]["did"] == stationdid && stationrid == 0) {
                triptempdata.push(tripdata[i])
            }

        }
        showtripdata(triptempdata, 0, Object.entries(triptempdata).length - 1, 0.5)

    }

}


const menu = document.querySelector("#menu");
const stat_menu = document.querySelector("#stat_menu");
 
const menuTime = document.getElementById('menu-time');
mockSlider(coarseSteps, menuTime)


menu.addEventListener('scroll', () => {

    if (menu.scrollTop === 0) {
        const scrollHeight = menuTime.scrollHeight - menuTime.clientHeight;
        const scrollAmount = scrollHeight / coarseSteps;
        menuTime.scrollTop -= scrollAmount;

    }


    if (menu.scrollTop === (menu.scrollHeight - menu.clientHeight)) {
        const scrollHeight = menuTime.scrollHeight - menuTime.clientHeight;
        const scrollAmount = scrollHeight / coarseSteps;
        menuTime.scrollTop += scrollAmount;
    }

});

menuTime.addEventListener('scroll', () => {

    if (departure_dropdown.selectedIndex > 0 || return_dropdown.selectedIndex > 0) {
        return
    }

    var nroitems = Number(Object.entries(tripdata).length - 1)  
    var scrollPercentage = menuTime.scrollTop / (menuTime.scrollHeight - menuTime.clientHeight) * (1 + 2 / coarseSteps) - 2 / coarseSteps;
    var scrollpos = 0.5
    if (scrollPercentage < 0) { scrollPercentage = 0; scrollpos = 0 }
    if (scrollPercentage >= 1) { scrollPercentage = 1 - 1 / coarseSteps; scrollpos = 1}

    showtripdata(tripdata, Math.round(nroitems * scrollPercentage), Math.round(nroitems * (scrollPercentage + 1 / coarseSteps)), scrollpos)

});




function showtripdata(triptempdata, startindex, endindex, setslider) {
    // displays part of trip data and appropriate endings for browsing
    while (menu.firstChild) {
        menu.removeChild(menu.firstChild);
    }

    var nroitems = Object.entries(triptempdata).length

    
    if (startindex == 0) {
        additemtopulldown('Previous Day', -1)
    }

    if (nroitems == 0) {
        additemtopulldown('No trips', 2)
        return
    }

    const columnWidths = [25, 25, 25, 10, 10];


 

    for (let i = startindex; i < endindex; i++) {


            const item = document.createElement("div");
            item.classList.add("menu-item");

            for (let j = 1; j <= 5; j++) {
                const col = document.createElement("div");
                col.classList.add(`col`, `col-${i}`);
                col.style.width = `${columnWidths[j - 1]}%`;
                col.style.textAlign = "left";
                col.style.overflow = "hidden";
                if (j == 1) { col.textContent = triptempdata[i]["Departure"].substring(8, 10) + '.' + triptempdata[i]["Departure"].substring(5, 7) + ' ' + triptempdata[i]["Departure"].substring(11, 16) };
                if (j == 2) { col.textContent = stationdata[triptempdata[i]["did"]][name] };
                if (j == 3) { col.textContent = stationdata[triptempdata[i]["rid"]][name] };
                if (j == 4) { col.textContent = triptempdata[i]["dis"] };
                if (j == 5) { col.textContent = triptempdata[i]["time"] };
                item.appendChild(col);
            }

            item.addEventListener("click", function () {
                const items = menu.querySelectorAll(".menu-item");
                for (const it of items) {
                    it.style.backgroundColor = "";
                }
                this.style.backgroundColor = "gray";
                var thisitemnro = startindex + 1 + Array.from(items).indexOf(this) - 1
                
                var dep_loc = [stationdata[triptempdata[thisitemnro]["did"]]["y"], stationdata[triptempdata[thisitemnro]["did"]]["x"]]
                var ret_loc = [stationdata[triptempdata[thisitemnro]["rid"]]["y"], stationdata[triptempdata[thisitemnro]["rid"]]["x"]]


                activestationid = triptempdata[thisitemnro]
 
                writeinfoboard(activestationid, 'trip')           
                showmaptrip(dep_loc, ret_loc)

            });

            menu.appendChild(item);

    }

    var nroitems = Number(Object.entries(tripdata).length - 1) 
    if (endindex == nroitems) {
        additemtopulldown('Next Day', 1)
    }


    menu.scrollTop = menu.scrollHeight * setslider

}


function showstations() {

    stacknHide(['filterStations', 'stationtitle', 'cleartext', 'operator', 'capacity'], 1, ['departure_dropdown', 'return_dropdown', 'distance', 'duration', 'currentdate', 'menu', 'menu-time'])

    while (stat_menu.firstChild) {
        stat_menu.removeChild(stat_menu.firstChild);
    }

    const filterValue = filterStations.value.toLowerCase();

    let sortedData = Object.entries(stationdata).sort((a, b) => {
        if (a[1][name] > b[1][name]) {
            return 1;
        } else {
            return -1;
        }
    });

    stationskeys = sortedData.map(item => item[0]);
    pulldownitemToStationID = popupstations(stationdata, stationskeys, name)
    var columnWidths = [30, 30, 12, 20, 10]
    //stationskeys = []
    let filteredkeys = []
    for (let i = 0; i < stationskeys.length; i++) {
        var thisname = stationdata[stationskeys[i]][name]
        if (thisname.toLowerCase().startsWith(filterValue) == true) {
            filteredkeys.push(stationskeys[i]) // we need this to make a shorted index list for filtered stations
            const item = document.createElement("div");
            item.classList.add("menu-item");
            for (let j = 1; j <= 5; j++) {
                const col = document.createElement("div");
                col.classList.add(`col`, `col-${i}`);
                //  col.style.width = `40%`;
                col.style.width = `${columnWidths[j - 1]}%`;
                col.style.textAlign = "left";
                col.style.overflow = "hidden";
                if (j == 1) { col.textContent = thisname }
                if (j == 2) { col.textContent = stationdata[stationskeys[i]][address] }
                if (j == 3) {
                    if (stationdata[stationskeys[i]][city].length > 1) {
                        col.textContent = stationdata[stationskeys[i]][city]
                    }
                    else { col.textContent = helsinki }
                }
                if (j == 4) {
                    if (stationdata[stationskeys[i]]['Operaattor'].length > 1) {
                        col.textContent = stationdata[stationskeys[i]]['Operaattor']
                    }
                    else { col.textContent += 'Unknown' }

                }
                if (j == 5) { col.textContent = stationdata[stationskeys[i]]['Kapasiteet'] }
                item.appendChild(col);
            }

            item.addEventListener("click", function () {
                const items = stat_menu.querySelectorAll(".menu-item");
                for (const it of items) {
                    it.style.backgroundColor = "";
                }
                this.style.backgroundColor = "gray";
                var thisitemnro = Array.from(items).indexOf(this)

                writeinfoboard(filteredkeys[thisitemnro], 'station')

                var coords = [stationdata[filteredkeys[thisitemnro]]["y"], stationdata[filteredkeys[thisitemnro]]["x"]]
                activestationid = filteredkeys[thisitemnro]
                showmap(coords)

            });

            stat_menu.appendChild(item)

        }

    }


}


document.querySelector("#closemap").addEventListener("click", function () {

    erasemarkersandpolylines(regulargooglemarker, polyline)

    if (stationview == 1) {
        stacknHide(['filterStations', 'cleartext', 'operator', 'capacity'], 1, ['HeatmapDeparture', 'TopDeparture', 'HeatmapReturn', 'TopReturn','closemap', 'map-container', 'infoboard'])
    }
    else {
        stacknHide(['distance', 'duration', 'currentdate', 'menu-time', 'departure_dropdown', 'return_dropdown'], 1, ['closemap', 'map-container', 'infoboard'])
    }

});


function computeStatDir(tempstatdata, tofrom) {
    var nroTrips = Object.entries(tempstatdata).length
    var distArray = []
    var timeArray = []
    var stationCount = new Array(1000).fill(0); // init array for station id count
    var circularArray = new Array(360).fill(0);
    for (let i = 0; i < nroTrips; i++) {
        let distnum = parseFloat(tempstatdata[i]["dis"]);
        if (isFinite(distnum)) { distArray.push(distnum) }
        let timenum = parseInt(tempstatdata[i]["time"]);
        if (isFinite(timenum)) { timeArray.push(timenum) }
        let statnum = parseInt(tempstatdata[i][tofrom]);


        if (statnum in stationdata) {

            var xShift = parseFloat(stationdata[statnum]["x"] - stationdata[activestationid]["x"])
            var yShift = parseFloat(stationdata[activestationid]["y"] - stationdata[statnum]["y"])

            var direction = parseInt(Math.atan2(yShift, xShift) * 180 / Math.PI);
            if (direction < 0) { direction = 360 + direction; }


            circularArray[direction]++
            stationCount[statnum]++ // increment if dep/ret is founf
        }
    }


    const averageDist = Math.round(10 * (distArray.reduce((a, b) => a + b, 0) / distArray.length)) / 10;
    const averageTime = Math.round(1 * (timeArray.reduce((a, b) => a + b, 0) / timeArray.length)) / 1;

    return { averageDist, averageTime, nroTrips, stationCount, circularArray };
}



function stationDetailMap(tempstatdata, tofrom, isheatmap) {
    // tofrom is either did or rid for dep or ret station id respectively

    const { averageDist, averageTime, nroTrips, stationCount, circularArray } = computeStatDir(tempstatdata, tofrom)
     

    stacknHide(['infoboard3'], 1, [])
    document.getElementById('infoboard3').innerHTML = 'Trips: ' + nroTrips + '<BR>Avg dist: ' + averageDist + ' km<BR>Avg time: ' + averageTime + ' min'
     

    if (isheatmap == 1) {

        const movingAverageWindow = 10;
        const movingAverage = [];
        var MAAverage = 0;
        for (let i = 0; i < circularArray.length; i++) {
            let sum = 0;
            for (let j = i - movingAverageWindow; j <= i + movingAverageWindow; j++) {
                const index = j >= 0 && j < circularArray.length
                    ? j
                    : j < 0
                        ? j + circularArray.length
                        : j - circularArray.length;
                sum += circularArray[index];
            }
            var temp = sum / (movingAverageWindow * 2 + 1)
            MAAverage += temp
            movingAverage.push(temp);
        }


        MAAverage = MAAverage / movingAverage.length

        for (let i = 0; i < movingAverage.length; i++) {
            movingAverage[i] = movingAverage[i] * 40 / MAAverage
            if (movingAverage[i] < 10) { movingAverage[i] = 10 }
            if (movingAverage[i] > 200) { movingAverage[i] = 200 }


        }
        alert('hm')
        addmarker([stationdata[activestationid]["y"], stationdata[activestationid]["x"]], ' ', 1, movingAverage)
        return
    }

    if (isheatmap == 0) {
        
        var indices = new Array(1000);
        for (var i = 0; i < 1000; ++i) indices[i] = i;
        indices.sort(function (a, b) { return stationCount[a] < stationCount[b] ? -1 : stationCount[a] > stationCount[b] ? 1 : 0; });  
        var this_loc = [stationdata[activestationid]["y"], stationdata[activestationid]["x"]]
        for (var i = 999; i > 994; i--) {

            var other_loc = [stationdata[indices[i]]["y"], stationdata[indices[i]]["x"]]

            if (tofrom == 'did') { showpolyline(this_loc, other_loc) }
            if (tofrom == 'rid') { showpolyline(other_loc, this_loc) }
             


            // addPolyline(this_loc, other_loc, 1000 - i, 'markersnocenter', tofrom, indices[i])

        }
        
        return
    }
}



function showmap(coords) {
        if (displaymap == 0) { return }
        stacknHide(['closemap', 'map-container', 'infoboard'], 1, [])

    stacknHide(['HeatmapReturn', 'TopReturn'], 1, ['filterStations', 'cleartext', 'operator', 'capacity'])
    stacknHide(['HeatmapDeparture', 'TopDeparture'], 1, [])
        map.setCenter({ lat: coords[0], lng: coords[1] });

        var temp = new google.maps.Marker({
            position: { lat: coords[0], lng: coords[1] },
            map: map,
        });
        regulargooglemarker.push(temp)
 
        fitMapToBounds([
            { lat: coords[0] + 0.005, lng: coords[1] + 0.005 },
            { lat: coords[0] - 0.005, lng: coords[1] - 0.005 },
        ]);

}

function showmaptrip(dep_loc, ret_loc) {
    if (displaymap == 0) { return }


    stacknHide(['closemap', 'map-container', 'infoboard'], 1, ['distance', 'duration','currentdate', 'menu-time', 'departure_dropdown', 'return_dropdown'])





    map.setCenter({ lat: (dep_loc[0] + ret_loc[0]) / 2, lng: (dep_loc[1] + ret_loc[1]) / 2 });
    fitMapToBounds([
        { lat: Math.max(dep_loc[0], ret_loc[0]), lng: Math.max(dep_loc[1], ret_loc[1]) },
        { lat: Math.min(dep_loc[0], ret_loc[0]), lng: Math.min(dep_loc[1], ret_loc[1]) },
    ]);

    showpolyline(dep_loc, ret_loc)

}


function showmarkerline(coords, markertext) {



}



function showpolyline(dep_loc, ret_loc) {
    alert('ss')
    var start = { lat: dep_loc[0], lng: dep_loc[1] };
    var end = { lat: ret_loc[0], lng: ret_loc[1] };
    alert('sss')
    var temp = new google.maps.Polyline({
        path: [start, end],
        geodesic: true,
        strokeColor: "#ff0000",
        strokeOpacity: 1.0,
        strokeWeight: 4,
        icons: [{
            icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
            offset: "100%",
        }],
        map: map
    });

    polyline.push(temp)

}


// selects the area of google maps so that start and end is visible 
function fitMapToBounds(latLngArray) {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < latLngArray.length; i++) {
        bounds.extend(latLngArray[i]);
    }
    map.fitBounds(bounds);
}



function onSelectChange() {
 
    var stationdid = 0
    var stationrid = 0
   
    if (departure_dropdown.selectedIndex > 0) {  stationdid = pulldownitemToStationID[departure_dropdown.selectedIndex-1]; }

    if (return_dropdown.selectedIndex > 0) { stationrid = pulldownitemToStationID[return_dropdown.selectedIndex-1]; }


    if (stationdid == 0 && stationrid == 0) {
    
        getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=' + startdatestring, 3)

        return
    }
    if (stationdid > 0) {
        document.getElementById("currentdate").style.opacity = 0.4;
        getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=D' + stationdid.toString(), 3)
        return
    }
    if (stationdid == 0) {
        document.getElementById("currentdate").style.opacity = 0.4;
        getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=R' + stationrid.toString(), 3)
        return
    }

}




showstations()

window.onload = function () {

    if (displaymap == 1) {
        const maploc = { lat: 64, lng: 26 };
        map = new google.maps.Map(document.getElementById("map"), {
            zoom: 5,
            center: maploc,
        });
    }

};


function getdata(thisaddress, mode, display) {
    // fetches the data from a google cloud function
    if (mode != 'did' && mode != 'rid') {
        document.getElementById('downloadboard').innerHTML = '<BR><BR>Downloading'
        stacknHide(['downloadboard'], 1, [])
    }
    fetchThis(thisaddress, mode, display)
        .then((data) => {
            stacknHide([], 1, ['downloadboard'])
            if (mode == 3) { gettripdata(data) }
            if (mode == 'did' || mode == 'rid') { stationDetailMap(data, mode, display) }
        })
        .catch(error => {
            document.getElementById('downloadboard').innerHTML = '<BR><BR>Error downloading data<BR>refresh or try again later'
            stacknHide(['downloadboard'], 1, [])
        })


    async function fetchThis(thislocation, mode) {

        let response = await fetch(thislocation,
            {
                method: 'GET'
            });

        if (response.headers.get('Content-Type').includes('application/json')) {
            return await response.json();
        }
        else {
            return await response.text();
        }

    }

}



function writeinfoboard(stationid, mode, whichtextfield) {
    // writes specific station info
    if (mode == 'trip') {
        let temphtml = 'From: ' + stationdata[stationid["did"]][name] + '<BR>To: '
        temphtml += stationdata[stationid["rid"]][name] + '<BR>Dist: '
        temphtml += stationid["dis"] + ' km Time: ' + stationid["time"] + ' min'
        document.getElementById("infoboard").innerHTML = temphtml
    }

    if (mode == 'station') {

        let temphtml = stationdata[stationid][name] + '<BR>'
        temphtml += stationdata[stationid][address] + '<BR>'

        if (stationdata[stationid][city].length > 1) {
            temphtml += stationdata[stationid][city]
        }
        else {
            temphtml += helsinki
        }
        if (whichtextfield == 2) { document.getElementById("infoboard3").innerHTML = temphtml }
        else { document.getElementById("infoboard").innerHTML = temphtml }

    }

}





function additemtopulldown(text, mode) {

    // populate station data to pull down menus
    const item = document.createElement("div");
    item.classList.add("menu-item");
    const col = document.createElement("div");
    col.classList.add(`col`, `col-1`);
    col.style.width = `100%`;
    if (mode == -1 || mode == 1) {
        col.style.border = '1px solid black'
        col.style.backgroundColor = '#A5A5A5'
    }
    col.style.textAlign = "center";
    col.textContent = text
    item.appendChild(col);

    if (mode == -1 || mode == 1) {
        item.addEventListener("click", function () {              
        startdatestring = incrementOrDecrementDate(startdatestring, mode)
        const dates = startdatestring.split("-").map(Number);
        document.getElementById("currentdate").innerHTML = months[dates[1] - 1] + ' ' + dates[2].toString() + '<BR>' + dates[0].toString() 
        getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=' + startdatestring, 3)     
        });
    }
    menu.appendChild(item)

}

function incrementOrDecrementDate(startdatestring, daysToAddOrSubtract) {
    var date = new Date(startdatestring);
    date.setDate(date.getDate() + daysToAddOrSubtract);
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    return year + '-' + month + '-' + day;
}