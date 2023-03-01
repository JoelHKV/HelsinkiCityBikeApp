

export function erasemarkersandpolylines(regulargooglemarker, polyline) {
    // erase markers and drawings on google maps
    for (let i = 0; i < regulargooglemarker.length; i++) {
        regulargooglemarker[i].setMap(null);
    }
    regulargooglemarker.length = 0;

    for (let i = 0; i < polyline.length; i++) {
        polyline[i].setMap(null);
    }
    polyline.length = 0;

}

export function drawCircle(radiusList, canvas, ctx) {
    // this is the draw the heatmap


    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvas.width = canvas.width;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < 360; i++) {
        const angle = (i * Math.PI) / 180;
        const x = centerX + radiusList[i] * Math.cos(angle);
        const y = centerY + radiusList[i] * Math.sin(angle);

        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();


    var gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
    gradient.addColorStop(0, "blue");
    gradient.addColorStop(0.2, "green");
    gradient.addColorStop(0.5, "yellow");
    gradient.addColorStop(1, "red");

    ctx.fillStyle = gradient;
    ctx.fill();

    const dataURI = canvas.toDataURL();

    return dataURI

}

export function movingaveragecalc(circularArray) {
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
    return movingAverage
}


export function computeStatDir(tempstatdata, stationdata, activestationid, tofrom) {
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

    var stationPopularityIndices = new Array(1000);
    for (var i = 0; i < 1000; ++i) stationPopularityIndices[i] = i;
    stationPopularityIndices.sort(function (a, b) { return stationCount[a] < stationCount[b] ? -1 : stationCount[a] > stationCount[b] ? 1 : 0; });

    const averageDist = Math.round(10 * (distArray.reduce((a, b) => a + b, 0) / distArray.length)) / 10;
    const averageTime = Math.round(1 * (timeArray.reduce((a, b) => a + b, 0) / timeArray.length)) / 1;

    return { averageDist, averageTime, nroTrips, circularArray, stationPopularityIndices };
}







export function mockSlider(coarseSteps, menuTime) {
    menuTime.innerHTML = '';
    for (let i = 0; i < coarseSteps; i++) {
        const item = document.createElement("div");
        item.classList.add("menu-time");
        item.innerHTML = "&nbsp;";
        menuTime.appendChild(item);
    }
}




export function popupstations(stationdata, tempkeys, name) {

   // alert(pulldownitemToStationID)
    departure_dropdown.options.length = 0;
    return_dropdown.options.length = 0;
    var pulldownitemToStationID = []
    for (let i = -1; i < tempkeys.length; i++) {
        let option = document.createElement("option");
        if (i > -1) {
            pulldownitemToStationID[i] = tempkeys[i]
            option.text = stationdata[tempkeys[i]][name]
            //  option.style.textAlign = "left";
            departure_dropdown.add(option);
            return_dropdown.add(option.cloneNode(true));
        }

        else {
            option.text = 'Departure: All'
            departure_dropdown.add(option);

            let option2 = document.createElement("option");
            option2.text = 'Return: All'
            return_dropdown.add(option2);

        }
    }
    return pulldownitemToStationID
}




export function koira(startdatestring) {
    stacknHide(['downloadboard'], 1, [])
}


export function openCalendarWindow(currentYear, startMonth, endMonth, graydate) {
    /// custom calendar selector as innerHTML
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


    let colcol = '#ffffff'
    let calendarHTML = `
    <style>
      table {
        width: 100%;
        border-collapse: collapse;
      }

      td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: center;
        cursor: pointer;
      }</style>`

    for (let currentMonth = startMonth; currentMonth < endMonth; currentMonth++) {
        const numberOfDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        calendarHTML += `
 
    <table>
      <thead>
        <tr>            
          <th colspan="7">${monthNames[currentMonth]} ${currentYear}</th>          
        </tr>
        <tr>
            <th colspan="7">&nbsp;</th>
        </tr>
        <tr>
          <th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th>
        </tr>
      </thead>
      <tbody>
        <tr>
  `;

        let firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        let firstDayOfWeek = firstDayOfMonth.getDay() || 7;
        let currentDay = 1;
        for (let i = 1; i < firstDayOfWeek; i++) {
            calendarHTML += `<td></td>`;
        }

        while (currentDay <= numberOfDaysInMonth) {
            if (firstDayOfWeek === 8) {
                calendarHTML += "</tr><tr>";
                firstDayOfWeek = 1;
            }

            var thisdate = currentDay + '.' + (currentMonth + 1) + '.' + currentYear
            if (thisdate == graydate) { colcol = '#999999' }
            calendarHTML += `<td style="cursor: pointer; background-color: ${colcol};" id='${thisdate}' class="generatedCell" data-param='${thisdate}'>${currentDay}</td>`;
            colcol = '#ffffff'

            firstDayOfWeek++;
            currentDay++;
        }
        calendarHTML += `
        </tr>
      </tbody>
    </table>`

    }
    return calendarHTML
}



