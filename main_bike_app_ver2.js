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
var displaymap = 0
var daterange = [[2021, 5, 1], [2021, 7, 31]]
var pulldownitemToStationID = []
var coarseSteps=200
var startdatestring = '2021-06-17'
var starthour = 12
//var bookmarks = []
var name = 'Nimi'
var address = 'Osoite'
var city = 'Kaupunki'
var helsinki = 'Helsinki'




// station data transformed to json where station id is the key. json is imported and hardcoded into js for speed and importance
import * as data2 from './stations_HelsinkiEspoo.json'
var stationdata = data2.default

// here we define the layout 
var placeitems = [['stationvstrip', 10, 2, 30, 9],
    ['stationvstrip2', 50, 2, 30, 9],
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

['stationdetailsFrom', 12, 31, 10, 10],
['stationdetailsTo', 24, 31, 10, 10],
['stationdetailsFrom2', 41, 31, 10, 10],
['stationdetailsTo2', 53, 31, 10, 10],
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
stacknHide([], 1, ['currentdate', 'menu', 'menu-time','circle', 'downloadboard', 'distance', 'duration', 'departure_dropdown', 'return_dropdown', 'infoboard3', 'closemap', 'stationdetailsFrom', 'stationdetailsTo', 'stationdetailsFrom2', 'stationdetailsTo2', 'map-container'])






//document.getElementById('stationvstrip').addEventListener("click", stationTripView);
document.getElementById('stationvstrip2').addEventListener("click", stationTripView2);



document.getElementById('stationvstrip').addEventListener("click", () => {
    alert('dd')
})



document.getElementById('currentdate').addEventListener("click", changeDate);


const filterStations = document.getElementById('filterStations')

filterStations.addEventListener("input", () => {
    update2stations()
})

const cleartext = document.getElementById('cleartext')

cleartext.addEventListener("click", () => {
    filterStations.value = "";
    update2stations()
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

function updatelanguage(thislang) {
    document.getElementById('fin').style.opacity = 0.4
    document.getElementById('swe').style.opacity = 0.4
    document.getElementById('eng').style.opacity = 0.4
    document.getElementById(thislang).style.opacity = 1
    update2stations()
}





function changeDate() {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    // run when inner calendar date is selected. then fetch data for that date
    if (departure_dropdown.selectedIndex != 0 || return_dropdown.selectedIndex != 0 != 0) { return }


    

    if (stationview == 1) { return }
    //var thisdate = document.getElementById("currentdate").innerHTML

    const selectedDateNumerical = startdatestring.split("-").map(Number);
    var sss = selectedDateNumerical[2] + '.' + selectedDateNumerical[1] + '.' + selectedDateNumerical[0]
    //alert(sss)
    var generatedHTML = openCalendarWindow(daterange[0][0], daterange[0][1] - 1, daterange[1][1], sss)
    document.getElementById("innercalendar").innerHTML = generatedHTML;
    
    let generatedCells = document.getElementsByClassName("generatedCell");
    document.getElementById("innercalendar").style.zIndex = 10
    
    for (let i = 0; i < generatedCells.length; i++) {
        generatedCells[i].addEventListener('click', function () {
            let param = this.getAttribute("data-param");              
            document.getElementById(sss).style.backgroundColor = '#ffffff'
            document.getElementById(param).style.backgroundColor = '#999999'
            
            var dates = param.split('.')
            startdatestring = dates[2].toString() + '-' + dates[1].toString().padStart(2, '0') + '-' + dates[0].toString().padStart(2, '0')

            document.getElementById("currentdate").innerHTML = months[dates[1] - 1] + ' ' + dates[0].toString() + '<BR>' + dates[2].toString()


          //  getDates(startDate, endDate);

           getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=' + startdatestring, 3)
            setTimeout(() => {
                document.getElementById("innercalendar").style.zIndex = -1
            }, 400)

        });
    }

}


function gettripdata(data) {

    stacknHide(['departure_dropdown', 'return_dropdown', 'distance', 'duration', 'currentdate', 'menu', 'menu-time'], 1, ['stationtitle', 'cleartext', 'operator', 'capacity'])

   


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


       // showtripdata(tripdata, 344, 566, 1)

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
        showtripdata(triptempdata, 0, Object.entries(triptempdata).length - 1,0, 0.5)

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

    showtripdata(tripdata, Math.round(nroitems * scrollPercentage), Math.round(nroitems * (scrollPercentage + 1 / coarseSteps)), 1, scrollpos)

});




function showtripdata(triptempdata, startindex,endindex, fullinput, setslider) {
    // displays part of trip data and appropriate endings for browsing
    while (menu.firstChild) {
        menu.removeChild(menu.firstChild);
    }

    var nroitems = Object.entries(triptempdata).length

    

  


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
                var thisitemnro = startindex + Array.from(items).indexOf(this) - 1
                
                var dep_loc = [stationdata[triptempdata[thisitemnro]["did"]]["y"], stationdata[triptempdata[thisitemnro]["did"]]["x"]]
                var ret_loc = [stationdata[triptempdata[thisitemnro]["rid"]]["y"], stationdata[triptempdata[thisitemnro]["rid"]]["x"]]


                activestationid = triptempdata[thisitemnro]
 
                writeinfoboard(activestationid, 'trip')
                showmap([dep_loc, ret_loc], 2)

            });

            menu.appendChild(item);

    }


    menu.scrollTop = menu.scrollHeight * setslider

}


let departure_dropdown = document.getElementById("departure_dropdown");
let return_dropdown = document.getElementById("return_dropdown");

departure_dropdown.onchange = onSelectChange;
return_dropdown.onchange = onSelectChange;

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


const canvas = document.getElementById("circle");
const ctx = canvas.getContext("2d");





update2stations()

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
            // if (mode == 1) { update2stations(data) }
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



function update2stations() {


    stacknHide(['stationtitle', 'cleartext', 'operator', 'capacity'], 1, ['departure_dropdown', 'return_dropdown', 'distance', 'duration', 'currentdate', 'menu', 'menu-time'])

   


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
    var columnWidths =[30,30,12,20,10] 
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
                showmap(coords, 1)

            });

            stat_menu.appendChild(item)

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


function stationTripView2() {
    // initializes the screen to trip view operations and fetches the data
    stationview = -1
  //  stacknHide(['stationvstrip', 'stationvstrip2', 'distance', 'duration', 'departure_dropdown', 'return_dropdown'], 1, ['filterStations', 'infoboard', 'infoboard3', 'closemap', 'stationdetailsFrom', 'stationdetailsTo', 'stationdetailsFrom2', 'stationdetailsTo2', 'map-container'])
 //   document.getElementById("currentdate").style.cursor = "pointer"
 //   document.getElementById("currentdate").style.opacity = 1;

    document.getElementById('stationvstrip').style.backgroundColor = '#ffffff'
    document.getElementById('stationvstrip2').style.backgroundColor = '#eeeeee'

    getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=' + startdatestring, 3)

}


function stationTripView() {
    // initializes the screen to station view operations
    stationview = 1
  //  stacknHide(['stationvstrip', 'stationvstrip2', 'filterStations'], 1, ['distance', 'duration', 'departure_dropdown', 'return_dropdown', 'infoboard', 'infoboard3', 'closemap', 'stationdetailsFrom', 'stationdetailsTo', 'stationdetailsFrom2', 'stationdetailsTo2', 'map-container'])
   // document.getElementById("currentdate").style.cursor = "default"
   // document.getElementById("currentdate").style.opacity = 0.4;
    document.getElementById('stationvstrip2').style.backgroundColor = '#ffffff'
    document.getElementById('stationvstrip').style.backgroundColor = '#eeeeee'
    update2stations()
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

            starthour += mode
            //alert('dd')
            if (starthour == -1) {
                starthour = 23;
                startdatestring = incrementOrDecrementDate(startdatestring, -1)
              //  getDates(startDate, endDate);
              //  getHours();
                return
            }
            if (starthour == 24) {
                ;
                startdatestring = incrementOrDecrementDate(startdatestring, 1)
             //   getDates(startDate, endDate);
              //  getHours();
                return
            }
            else {
             //   getHours()
              //  showtripdata(tripdata, bookmarks[starthour], bookmarks[starthour + 1],1)
            }

        });
    }
    menu.appendChild(item)

}

export function incrementOrDecrementDate(startdatestring, daysToAddOrSubtract) {
    var date = new Date(startdatestring);
    date.setDate(date.getDate() + daysToAddOrSubtract);
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    return year + '-' + month + '-' + day;
}