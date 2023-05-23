import './style.css'
import { generateCalendarHTML, popupstations, mockSlider, drawCircle, computeStatDir, movingaveragecalc, koira, erasemarkersandpolylines } from './aux_functions.js';
var map;
var regulargooglemarker = []
var polyline = [];
var stationskeys = []
var tripdata
var stationview = 1
var activestationid = 501
var inforboardid = [0, 0]

var heatmapmaxradius = 200
var displaymap = 1
var daterange = [[2021, 5, 1], [2021, 7, 31]]
var pulldownitemToStationID = []
//var coarseSteps = 200

var thispagepercentage = 49.5
var pagerange=0.5
var nroitems = 0
var startdatestring = '2021-06-17'
var arrowdirection  = 0
var toptripstats = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]

var intervalId

// starting new layout design



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



//fixitemsize(placeitems, 0.9, 1, 1.0)

let timeoutId;

// adjust layout after window resize, uses debouncing
window.onresize = function () {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
        fixitemsize(placeitems, 0.9, 1, 1.0)
    }, 250);

};

 

function stacknHide(stackElements, startZ, hideElements) {
    // makes elements visible and hidden based on what the user is doing
    for (let i = 0; i < stackElements.length; i++) {
       document.getElementById(stackElements[i]).style.zIndex = startZ + 30 - i
        document.getElementById(stackElements[i]).style.display = 'block'
    }
    for (let i = 0; i < hideElements.length; i++) {
        document.getElementById(hideElements[i]).style.display = 'none'
    }
}

//  this is the starting view arrangement
stacknHide(['labelrow', 'stat_menu'], 1, ['closemap', 'tripviewlabelrow', 'mapbuttons', 'innercalendar', 'menu', 'menu-time', 'circle', 'arr1','arr2', 'infoboard', 'infoboard2', 'infoboard3', 'map-container'])



let departure_dropdown = document.getElementById("departure_dropdown");
let return_dropdown = document.getElementById("return_dropdown");

departure_dropdown.onchange = onSelectChange;
return_dropdown.onchange = onSelectChange;



document.getElementById('tripview').addEventListener("click", () => {

   
   // stacknHide(['tripviewlabelrow'], 1, [])
    if (stationview == -1) { return }
    
    stacknHide(['menu-time', 'menu', 'tripviewlabelrow'], 31, ['labelrow', 'stat_menu', 'filterStations', 'arr1', 'arr2', 'infoboard', 'infoboard2', 'infoboard3','mapbuttons' ])

  

    var startstatid = pulldownitemToStationID.indexOf(inforboardid[0])
    var startstatid2 = pulldownitemToStationID.indexOf(inforboardid[1])

    if (startstatid > -1 && startstatid2 == -1 && arrowdirection == 1) {
        departure_dropdown.selectedIndex = startstatid + 1
        return_dropdown.selectedIndex = 0
    }
    if (startstatid > -1 && startstatid2 == -1 && arrowdirection == -1) {
        return_dropdown.selectedIndex = startstatid + 1
        departure_dropdown.selectedIndex = 0
    }

    if (startstatid > -1 && startstatid2 > -1 && arrowdirection == 1) {
        departure_dropdown.selectedIndex = startstatid + 1
        return_dropdown.selectedIndex = startstatid2 + 1
    }
    if (startstatid > -1 && startstatid2 > -1 && arrowdirection == -1) {
        return_dropdown.selectedIndex = startstatid + 1
        departure_dropdown.selectedIndex = startstatid2 + 1
    }

    stationview = -1
    document.getElementById('stationview').style.backgroundColor = '#ffffff'
    document.getElementById('stationview').style.border = 'none'
    document.getElementById('tripview').style.backgroundColor = '#eeeeee'
    document.getElementById('tripview').style.border='2px solid black'

    onSelectChange()
   
})


document.getElementById('stationview').addEventListener("click", () => {

 

    if (stationview == 1) { return }
   
    stacknHide(['stat_menu', 'labelrow', 'filterStations'], 31, ['tripviewlabelrow', 'menu-time', 'menu', 'arr1', 'arr2', 'infoboard', 'infoboard2', 'infoboard3','mapbuttons'])



   // document.getElementById('tripviewlabelrow').style.display = 'none'
   // document.getElementById('labelrow').style.display = 'block'


    


  //  stacknHide(['filterStations', 'cleartext'], 1, ['closemap', 'map-container', 'infoboard', 'infoboard2', 'infoboard3', 'arrimage', 'arrimageleft'])

    stationview = 1
    document.getElementById('tripview').style.backgroundColor = '#ffffff'
    document.getElementById('stationview').style.backgroundColor = '#eeeeee'

    document.getElementById('tripview').style.border = 'none'
    document.getElementById('stationview').style.border = '2px solid black'

    showstations()
})



document.getElementById('infoboard').addEventListener("click", () => {
    newbasestation(inforboardid[0])
})

document.getElementById('infoboard3').addEventListener("click", () => {
    newbasestation(inforboardid[1])
})

function newbasestation(newstation) {
    stationview = 1
    document.getElementById('tripview').style.backgroundColor = '#ffffff'
    document.getElementById('stationview').style.backgroundColor = '#eeeeee'
    document.getElementById('tripview').style.border = 'none'
    document.getElementById('stationview').style.border = '2px solid black'


        activestationid = newstation
        erasemarkersandpolylines(regulargooglemarker, polyline)
    stacknHide([], 1, ['infoboard', 'infoboard2','infoboard3', 'arr1', 'arr2'])
        writeinfoboard(activestationid, 'station')
        document.getElementById("infoboard2").innerHTML = 'Capacity:<BR>' + stationdata[activestationid]['Kapasiteet'] + ' bikes'

        var coords = [stationdata[activestationid]["y"], stationdata[activestationid]["x"]]
        
        showmap(coords)   
}

document.getElementById('currentdate').addEventListener("click", changeDate);

const filterStations = document.getElementById('filterStations')

filterStations.addEventListener("input", () => {
    if (filterStations.value == "") { var xbutton = '' }
    else { var xbutton = 'X' }
    document.getElementById('cleartext').innerHTML = xbutton
    showstations()
})

const cleartext = document.getElementById('cleartext')

cleartext.addEventListener("click", () => {
    document.getElementById('cleartext').innerHTML = ''
    filterStations.value = "";
    showstations()
})


const languageButtons = document.querySelectorAll('.langselect');

languageButtons.forEach(button => {
    button.addEventListener('click', event => {

        document.getElementById('fin').style.opacity = 0.4
        document.getElementById('swe').style.opacity = 0.4
        document.getElementById('eng').style.opacity = 0.4

        if (event.target.id == 'fin') {
            name = 'Nimi'; address = 'Osoite'; helsinki = 'Helsinki'
        }
        if (event.target.id == 'swe') {
            name = 'Namn'; address = 'Adress'; helsinki = 'Helsingfors'
        }
        if (event.target.id == 'eng') {
            name = 'Name'; address = 'Osoite'; helsinki = 'Helsinki'
        }

        document.getElementById(event.target.id).style.opacity = 1
        stationview = 1
        document.getElementById('tripview').style.backgroundColor = '#ffffff'
        document.getElementById('stationview').style.backgroundColor = '#eeeeee'
     //   stacknHide([], 1, ['arrimage', 'arrimageleft', 'currentdate', 'menu', 'menu-time', 'circle', 'downloadboard', 'distance', 'duration', 'departure_dropdown', 'return_dropdown', 'infoboard', 'infoboard2', 'infoboard3', 'closemap', 'map-container'])

        showstations()
    });
 
});



const statDetailButtons = document.querySelectorAll('.statdetails');

statDetailButtons.forEach(button => {
    button.addEventListener('click', event => {
       // alert(`Button ${event.target.id} was pressed.`);
        var addr = 'https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?'
       
        if (event.target.id == 'TopDeparture') {
            document.getElementById("arr1").classList.remove('arrow-left-button');
            document.getElementById("arr2").classList.remove('arrow-left-button');
            getdata(addr + 'action=D' + activestationid.toString(), 'rid', 0)
        }
        if (event.target.id == 'TopReturn') {
            document.getElementById("arr1").classList.add('arrow-left-button');
            document.getElementById("arr2").classList.add('arrow-left-button');
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


function changeDate() {


    if (document.getElementById("currentdate").style.opacity == 0.4) { return };

    
    stacknHide(['innercalendar'], 1, ['menu', 'menu-time']);
    
    if (stationview == 1 || departure_dropdown.selectedIndex != 0 || return_dropdown.selectedIndex != 0) { return }

    const selectedDateNumerical = startdatestring.split("-").map(Number);
    var sss = selectedDateNumerical[2] + '.' + selectedDateNumerical[1] + '.' + selectedDateNumerical[0]
 
    var generatedHTML = generateCalendarHTML(daterange[0][0], daterange[0][1] - 1, daterange[1][1], sss)
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

            document.getElementById("currentdate").innerHTML = months[dates[1] - 1] + ' ' + dates[0].toString() + ' ' + dates[2].toString()

           getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=' + startdatestring, 3)
            setTimeout(() => {
                stacknHide(['menu', 'menu-time'], 1, ['innercalendar'])
            }, 400)

        });
    }

}

const buttons = document.querySelectorAll('button');

function gettripdata(data) {

    document.getElementById('downloadboarddiv').style.zIndex = -1

   
    buttons.forEach(button => button.disabled = false);
    clearInterval(intervalId);
    tripdata = {}
    var counter = 0
    nroitems = Object.entries(data).length - 1
 
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

       // stacknHide(['menu-time','currentdate'], 1, [])

        menu.scrollTop = menu.scrollHeight * 0.5


        thispagepercentage = 49.5     
        nroitems = Number(Object.entries(tripdata).length - 1) 
        menuTime.scrollTop = menuTime.scrollHeight * thispagepercentage /100

        showtripdata(tripdata, Math.round(nroitems * (thispagepercentage - pagerange) / 100), Math.round(nroitems * (thispagepercentage + pagerange) / 100), 0.5)




    }
    else {
        var triptempdata = []

      //  stacknHide([], 1, ['menu-time', 'currentdate'])

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
const menuTime = document.getElementById("menu-time");
mockSlider(201, menuTime)

menu.addEventListener('scroll', () => {

    if (menu.scrollTop === 0 && menuTime.scrollTop > 0) {
        thispagepercentage -= pagerange
        menuTime.scrollTop = menuTime.scrollHeight * thispagepercentage / 100
        showtripdata(tripdata, Math.round(nroitems * (thispagepercentage - pagerange) / 100), Math.round(nroitems * (thispagepercentage + pagerange) / 100), 0.5)
    }


    if (menu.scrollTop === (menu.scrollHeight - menu.clientHeight) && menuTime.scrollTop < (menuTime.scrollHeight - menuTime.clientHeight)) {
        thispagepercentage += pagerange
        menuTime.scrollTop = menuTime.scrollHeight * thispagepercentage / 100
        showtripdata(tripdata, Math.round(nroitems * (thispagepercentage - pagerange) / 100), Math.round(nroitems * (thispagepercentage + pagerange) / 100), 0.5)

    }

});


menuTime.addEventListener('scroll', () => {

    if (departure_dropdown.selectedIndex > 0 || return_dropdown.selectedIndex > 0) {
        return
    }

    var scrollPercentage = menuTime.scrollTop / (menuTime.scrollHeight - menuTime.clientHeight)
    thispagepercentage = Math.round(scrollPercentage * 200) / 2
    var scrollpos = 0.5
    if (thispagepercentage < 0.5) { thispagepercentage = 0.5; scrollpos = 0 }
    if (thispagepercentage > 99.5) { thispagepercentage = 99.5; scrollpos = 1 }

    showtripdata(tripdata, Math.round(nroitems * (thispagepercentage - pagerange) / 100), Math.round(nroitems * (thispagepercentage + pagerange) / 100), scrollpos)


});




function showtripdata(triptempdata, startindex, endindex, setslider) {
    // displays part of trip data and appropriate endings for browsing
    while (menu.firstChild) {
        menu.removeChild(menu.firstChild);
    }

    var nroitems = Object.entries(triptempdata).length

 
    if (nroitems == 0) {
        additemtopulldown('No trips', 2)
        return
    }
    var startoffset = 1
    if (startindex == 0 && return_dropdown.selectedIndex == 0 && departure_dropdown.selectedIndex == 0) {
        startoffset -= 1
        additemtopulldown('Previous Day', -1)
    }
    
    var thiselement = document.getElementById("menu").getBoundingClientRect()
    var timeper = 100 * 164 / parseInt(thiselement.width)
    const columnWidths = [timeper, (100 - timeper) / 3, (100 - timeper) / 3, (100 - timeper) / 6, (100 - timeper) / 6];

    document.getElementById("currentdate").style.marginLeft = 0
    document.getElementById("currentdate").style.width = columnWidths[0] - 4 + '%'


    document.getElementById("departure_dropdown").style.marginLeft = columnWidths[0] +'%'
    document.getElementById("departure_dropdown").style.width = columnWidths[1] - 4 + '%'
    document.getElementById("return_dropdown").style.marginLeft = columnWidths[0] + columnWidths[1] + '%'
    document.getElementById("return_dropdown").style.width = columnWidths[2] - 4 + '%'
    document.getElementById("distance").style.marginLeft = columnWidths[0] + columnWidths[1] + columnWidths[2] + '%'
    document.getElementById("duration").style.marginLeft = columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + '%'


    
    


    for (let i = startindex; i < endindex; i++) {


            const item = document.createElement("div");
            item.classList.add("menu-item");

            for (let j = 1; j <= 5; j++) {
                const col = document.createElement("div");
                col.classList.add(`col`, `colt-${j}`);
                col.style.width = `${columnWidths[j - 1]}%`;

                 if (j == 1) {
                    col.innerHTML = months[Number(triptempdata[i]["Departure"].substring(5, 7))-1]
                    col.innerHTML += '&nbsp' +  triptempdata[i]["Departure"].substring(8, 10)
                    col.innerHTML += '&nbsp' + triptempdata[i]["Departure"].substring(11, 16)
                    col.style.paddingLeft = '4px'
                };

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
                var thisitemnro = startindex + startoffset + Array.from(items).indexOf(this) - 1
                
                var dep_loc = [stationdata[triptempdata[thisitemnro]["did"]]["y"], stationdata[triptempdata[thisitemnro]["did"]]["x"]]
                var ret_loc = [stationdata[triptempdata[thisitemnro]["rid"]]["y"], stationdata[triptempdata[thisitemnro]["rid"]]["x"]]

                activestationid = triptempdata[thisitemnro]
            
                writeinfoboard(triptempdata[thisitemnro]["did"], 'station', 0)
                writeinfoboard(triptempdata[thisitemnro]["rid"], 'station', 2)
                writeinfoboard(triptempdata[thisitemnro], 'trip', 0)          
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
    arrowdirection = 0
  //  stacknHide(['stat_menu','cleartext', 'filterStations'], 1, ['departure_dropdown', 'return_dropdown', 'distance', 'duration', 'currentdate', 'menu', 'menu-time'])

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
                col.classList.add(`col`, `col-${j}`);
                //  col.style.width = `40%`;
                col.style.width = `${columnWidths[j - 1]}%`;
              //  col.style.textAlign = "left";
             //   col.style.overflow = "hidden";
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
              //  stacknHide(['infoboard2'], 1, [])
                document.getElementById("infoboard2").innerHTML = 'Capacity:<BR>' + stationdata[filteredkeys[thisitemnro]]['Kapasiteet'] + ' bikes'
                //writeinfoboard(stationdata[filteredkeys[thisitemnro]]['Kapasiteet'], 'bikes', 1)

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
        stacknHide(['stat_menu', 'labelrow', 'filterStations'], 1, ['arr1', 'arr2', 'mapbuttons', 'closemap', 'map-container', 'infoboard', 'infoboard2', 'infoboard3'])
    }
    else {
        stacknHide(['menu', 'menu-time', 'tripviewlabelrow'], 1, ['arr1', 'arr2', 'mapbuttons', 'closemap', 'map-container', 'infoboard', 'infoboard2', 'infoboard3'])


       if (departure_dropdown.selectedIndex == 0 && return_dropdown.selectedIndex == 0) {
         //   stacknHide(['currentdate', 'menu-time'],1,[])
        }
             

    }

});



function stationDetailMap(tempstatdata, tofrom, isheatmap) {

     
    stacknHide(['infoboard2'], 1, ['arr1', 'arr2','infoboard3'])
    


    // tofrom is either did or rid for dep or ret station id respectively
    inforboardid[1] = ''
    buttons.forEach(button => button.disabled = false);
    clearInterval(intervalId);
    erasemarkersandpolylines(regulargooglemarker, polyline)
    const { averageDist, averageTime, nroTrips, circularArray, stationPopularityIndices } = computeStatDir(tempstatdata, stationdata, activestationid, tofrom)
    var this_loc = [stationdata[activestationid]["y"], stationdata[activestationid]["x"]] 
  //  stacknHide([], 1, ['arrimage', 'arrimageleft'])
    
    //var whicharray = 'arrimage'

    arrowdirection = 1
    if (tofrom == 'did') {
      //  whicharray = 'arrimageleft'
        arrowdirection = -1
    
    }


    if (isheatmap == 1) {
    //    stacknHide(['infoboard2', whicharray], 1, ['infoboard3'])
        document.getElementById('infoboard2').innerHTML = 'Trips: ' + nroTrips + '<BR>Avg dist: ' + averageDist + ' km<BR>Avg time: ' + averageTime + ' min'
        stacknHide(['infoboard2'], 1, [])
        var movingAverage = movingaveragecalc(circularArray)     
        var customMarker = drawCircle(movingAverage, canvas, ctx)

        showmarker([this_loc[0], this_loc[1]], customMarker, activestationid, 'custom')
        return
    }

    if (isheatmap == 0) {
       // stacknHide(['infoboard3', whicharray], 1, ['infoboard2'])
        document.getElementById('infoboard2').innerHTML = 'Click markers<BR>for route info.'
        stacknHide(['infoboard2'], 1, [])

        
        for (var i = 1; i <= 5; i++) {

            var other_loc = [stationdata[stationPopularityIndices[1000 - i]]["y"], stationdata[stationPopularityIndices[1000 - i]]["x"]]

            var nro2Trips = Object.entries(tempstatdata).length
            var distval = 0
            var timeval = 0
            var ccounter = 0

            if (tofrom == 'did') { var spot1 = 'rid'; var spot2 = 'did' }
            if (tofrom == 'rid') { var spot1 = 'did'; var spot2 = 'rid' }

            for (let j = 0; j < nro2Trips; j++) {
                if (tempstatdata[i][spot1] == activestationid && tempstatdata[j][spot2] == stationPopularityIndices[1000 - i]) { 
                    distval += Number(tempstatdata[i]["dis"])
                    timeval += Number(tempstatdata[i]["time"])
                    ccounter++
            }
            }
 
            toptripstats[0][i - 1] = ccounter
            toptripstats[1][i - 1] = Math.round(10 * distval / ccounter)/10
            toptripstats[2][i - 1] = Math.round(10 * timeval / ccounter) / 10

            if (tofrom == 'rid') { showpolyline(this_loc, other_loc) }
            if (tofrom == 'did') { showpolyline(other_loc, this_loc) }
             
            showmarker([other_loc[0], other_loc[1]], i.toString(), stationPopularityIndices[1000 - i], 'reg')

        }
        
        return
    }
}



function showmap(coords) {
    if (displaymap == 0) { return }
     
    stacknHide(['mapbuttons', 'closemap', 'map-container', 'infoboard'], 1, ['stat_menu', 'menu', 'menu-time', 'tripviewlabelrow', 'labelrow','filterStations'])

  


        map.setCenter({ lat: coords[0], lng: coords[1] });

    showmarker(coords, ' ', 0, 'reg')
 
        fitMapToBounds([
            { lat: coords[0] + 0.005, lng: coords[1] + 0.005 },
            { lat: coords[0] - 0.005, lng: coords[1] - 0.005 },
       ]);

}

function showmaptrip(dep_loc, ret_loc) {
    if (displaymap == 0) { return }
    
    stacknHide(['closemap','map-container', 'infoboard', 'infoboard2', 'infoboard3'], 1, ['mapbuttons','stat_menu', 'menu', 'menu-time', 'tripviewlabelrow', 'labelrow'])

    map.setCenter({ lat: (dep_loc[0] + ret_loc[0]) / 2, lng: (dep_loc[1] + ret_loc[1]) / 2 });
    fitMapToBounds([
        { lat: Math.max(dep_loc[0], ret_loc[0]), lng: Math.max(dep_loc[1], ret_loc[1]) },
        { lat: Math.min(dep_loc[0], ret_loc[0]), lng: Math.min(dep_loc[1], ret_loc[1]) },
    ]);

    showpolyline(dep_loc, ret_loc)

}


function showmarker(coords, labeltext, thisid, type) {

    if (type == 'reg') {

        var temp = new google.maps.Marker({
            position: { lat: coords[0], lng: coords[1] },
            map: map,

            label: {
                text: labeltext,
                color: 'black',
                fontSize: "24px",
                fontWeight: 'bold'
            },

        });
    }

    if (type == 'custom') {

        var markerImage = new google.maps.MarkerImage(
            labeltext,

            new google.maps.Size(2 * heatmapmaxradius, 2 * heatmapmaxradius),
            new google.maps.Point(0, 0),
            new google.maps.Point(heatmapmaxradius, heatmapmaxradius)
        )

        var temp = new google.maps.Marker({
            position: { lat: coords[0], lng: coords[1] },
            map: map,
            icon: markerImage,

        });
    }

    if (thisid > 0) { 
    temp.addListener('click', function () {
        writeinfoboard(thisid, 'station', 2)
      //  stacknHide(['infoboard2'], 1, [])
        document.getElementById('infoboard2').innerHTML = 'Trips: ' + toptripstats[0][Number(labeltext) - 1] + '<BR>Avg dist: ' + toptripstats[1][Number(labeltext) - 1] + ' km<BR>Avg time: ' + toptripstats[2][Number(labeltext) - 1] + ' min'

    });
    }

    regulargooglemarker.push(temp)


}


function showpolyline(dep_loc, ret_loc) {
    var start = { lat: dep_loc[0], lng: dep_loc[1] };
    var end = { lat: ret_loc[0], lng: ret_loc[1] };
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
      //  stacknHide(['currentdate'], 1, [])

        if (document.getElementById("currentdate").style.opacity == 0.4) {
            document.getElementById("currentdate").innerHTML = 'Choose date'
        }
        document.getElementById("currentdate").style.opacity = 1;
        getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=' + startdatestring, 3)
        return
    }
    if (stationdid > 0) {
      // stacknHide([], 1, ['currentdate'])
        document.getElementById("currentdate").style.opacity = 0.4;   
        document.getElementById("currentdate").innerHTML='All dates'
        getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=D' + stationdid.toString(), 3)
        return
    }
    if (stationdid == 0) {
       //stacknHide([], 1, ['currentdate'])
        document.getElementById("currentdate").style.opacity = 0.4;      
        document.getElementById("currentdate").innerHTML = 'All dates'
        getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=R' + stationrid.toString(), 3)
        return
    }

}


function loadScript(src, callback) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
}

function initMap() {
    // Create a new map centered at Oulu, Finland
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 65.01, lng: 25.46 },
        zoom: 8,
    });
}


showstations()

window.onload = function () {

    if (displaymap == 1) {
        loadScript("https://returnsecret-c2cjxe2frq-lz.a.run.app", function () {
            // Google Maps API loaded, call initMap to create the map.
            initMap()
        });

    }

};


function prefetch() {
    buttons.forEach(button => button.disabled = true);
    document.getElementById('downloadboarddiv').style.zIndex = 900

     
   // stacknHide(['downloadboard'], 1, ['tripviewlabelrow', 'labelrow','menu', 'stat_menu', 'menu-time', 'innercalendar','map-container'])
    let rotation = 0;
    intervalId = setInterval(() => {
        rotation += 2;
        document.getElementById('downloadboard').style.transform = `rotate(${rotation}deg)`;
    }, 100);

}


function getdata(thisaddress, mode, display) {
    if (mode == 3) { prefetch() }
 
    fetchThis(thisaddress, mode, display)
        .then((data) => {
          //  stacknHide([], 1, ['downloadboard'])
            if (mode == 3) { gettripdata(data) }
            if (mode == 5) { initthismap(data) }
            if (mode == 'did' || mode == 'rid') { stationDetailMap(data, mode, display) }
        })
        .catch(error => {

            clearInterval(intervalId);
          //  alert('error')
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

        let temphtml = months[Number(stationid["Departure"].substring(5, 7)) - 1]
        temphtml += '&nbsp' + stationid["Departure"].substring(8, 10)
        temphtml += '&nbsp' + stationid["Departure"].substring(11, 16)
        temphtml += '<BR>Dist: '
        temphtml += stationid["dis"] + ' km<BR>Length: ' + stationid["time"] + ' min'
        document.getElementById("infoboard2").innerHTML = temphtml
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
        
        
        if (whichtextfield == 2) { 
            inforboardid[1] = stationid.toString()


            stacknHide(['infoboard3', 'arr1', 'arr2'], 1, [])
            document.getElementById('infoboard3').innerHTML = temphtml
        }
        else {
            inforboardid[0] = stationid.toString()
            document.getElementById('infoboard').innerHTML = temphtml
        }
        

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
        document.getElementById("currentdate").innerHTML = months[dates[1] - 1] + ' ' + dates[2].toString() + ' ' + dates[0].toString() 
        getdata('https://readlocalcsvdeliverjson-c2cjxe2frq-lz.a.run.app/?action=' + startdatestring, 3)     
        });
    }
    menu.appendChild(item)

}

function incrementOrDecrementDate(startdatestring, daysToAddOrSubtract) {

    var edgedate = daterange[0][0].toString() + '-' + daterange[0][1].toString().padStart(2, '0') + '-' + daterange[0][2].toString().padStart(2, '0')
    if (startdatestring == edgedate) { daysToAddOrSubtract = 0 }

    var edgedate = daterange[1][0].toString() + '-' + daterange[1][1].toString().padStart(2, '0') + '-' + daterange[1][2].toString().padStart(2, '0')
    if (startdatestring == edgedate) { daysToAddOrSubtract = 0 }

    var date = new Date(startdatestring);
    date.setDate(date.getDate() + daysToAddOrSubtract);
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    return year + '-' + month + '-' + day;
}