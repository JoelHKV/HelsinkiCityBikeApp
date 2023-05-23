

export function erasemarkersandpolylines(regulargooglemarker, polyline) {
    // Erase markers and polylines on Google Maps
    regulargooglemarker.forEach(marker => marker.setMap(null));
    regulargooglemarker.length = 0;

    polyline.forEach(line => line.setMap(null));
    polyline.length = 0;
}

export function drawCircle(radiusList, canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvas.width = canvas.width;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.beginPath();

    for (let i = 0; i < 360; i++) {
        const angle = (i * Math.PI) / 180;
        const x = centerX + radiusList[i] * Math.cos(angle);
        const y = centerY + radiusList[i] * Math.sin(angle);

        ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.stroke();

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
    gradient.addColorStop(0, "blue");
    gradient.addColorStop(0.2, "green");
    gradient.addColorStop(0.5, "yellow");
    gradient.addColorStop(1, "red");

    ctx.fillStyle = gradient;
    ctx.fill();

    const dataURI = canvas.toDataURL();

    return dataURI;
}

export function movingaveragecalc(circularArray) {
    const movingAverageWindow = 10;
    const movingAverage = [];
    let MAAverage = 0;

    for (let i = 0; i < circularArray.length; i++) {
        let sum = 0;

        for (let j = i - movingAverageWindow; j <= i + movingAverageWindow; j++) {
            const index = (j >= 0 && j < circularArray.length) ? j : (j < 0) ? j + circularArray.length : j - circularArray.length;
            sum += circularArray[index];
        }

        const temp = sum / (movingAverageWindow * 2 + 1);
        MAAverage += temp;
        movingAverage.push(temp);
    }

    MAAverage /= movingAverage.length;

    for (let i = 0; i < movingAverage.length; i++) {
        movingAverage[i] = movingAverage[i] * 40 / MAAverage;

        if (movingAverage[i] < 10) {
            movingAverage[i] = 10;
        }
        if (movingAverage[i] > 200) {
            movingAverage[i] = 200;
        }
    }

    return movingAverage;
}


export function computeStatDir(tempstatdata, stationdata, activestationid, tofrom) {
    const nroTrips = Object.entries(tempstatdata).length;
    const distArray = [];
    const timeArray = [];
    const stationCount = new Array(1000).fill(0);
    const circularArray = new Array(360).fill(0);

    for (let i = 0; i < nroTrips; i++) {
        const distnum = parseFloat(tempstatdata[i]["dis"]);
        if (isFinite(distnum)) {
            distArray.push(distnum);
        }

        const timenum = parseInt(tempstatdata[i]["time"]);
        if (isFinite(timenum)) {
            timeArray.push(timenum);
        }

        const statnum = parseInt(tempstatdata[i][tofrom]);
        if (statnum in stationdata) {
            const xShift = parseFloat(stationdata[statnum]["x"] - stationdata[activestationid]["x"]);
            const yShift = parseFloat(stationdata[activestationid]["y"] - stationdata[statnum]["y"]);
            let direction = parseInt(Math.atan2(yShift, xShift) * 180 / Math.PI);

            if (direction < 0) {
                direction = 360 + direction;
            }

            circularArray[direction]++;
            stationCount[statnum]++;
        }
    }

    const stationPopularityIndices = new Array(1000);
    for (let i = 0; i < 1000; i++) {
        stationPopularityIndices[i] = i;
    }
    stationPopularityIndices.sort((a, b) => stationCount[a] - stationCount[b]);

    const averageDist = Math.round(10 * distArray.reduce((a, b) => a + b, 0) / distArray.length) / 10;
    const averageTime = Math.round(timeArray.reduce((a, b) => a + b, 0) / timeArray.length);

    return { averageDist, averageTime, nroTrips, circularArray, stationPopularityIndices };
}


export function mockSlider(coarseSteps, menuTime) {
    //coarse slider on the left of the tripview
    menuTime.innerHTML = '';

    for (let i = 0; i < coarseSteps; i++) {
        const item = document.createElement("div");
        item.classList.add("menu-time");
        item.textContent = "\u00A0"; 
        menuTime.appendChild(item);
    }
}


export function popupstations(stationdata, tempkeys, name) {
    departure_dropdown.innerHTML = '';
    return_dropdown.innerHTML = '';

    const pulldownitemToStationID = [];

    const createOption = (text) => {
        const option = document.createElement("option");
        option.text = text;
        return option;
    };

    for (let i = -1; i < tempkeys.length; i++) {
        if (i > -1) {
            const stationID = tempkeys[i];
            const stationName = stationdata[stationID][name];
            pulldownitemToStationID[i] = stationID;

            departure_dropdown.add(createOption(stationName));
            return_dropdown.add(createOption(stationName));
        } else {
            departure_dropdown.add(createOption('Departure: All'));
            return_dropdown.add(createOption('Return: All'));
        }
    }

    return pulldownitemToStationID;
}




export function koira(startdatestring) {
    stacknHide(['downloadboard'], 1, [])
}


export function generateCalendarHTML(currentYear, startMonth, endMonth, graydate) {
    // custom calendar popup function
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

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
      }
    </style>
  `;

    for (let currentMonth = startMonth; currentMonth < endMonth; currentMonth++) {
        const numberOfDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        let firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() || 7);
        let currentDay = 1;

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

        for (let i = 1; i < firstDayOfWeek; i++) {
            calendarHTML += `<td></td>`;
        }

        while (currentDay <= numberOfDaysInMonth) {
            if (firstDayOfWeek === 8) {
                calendarHTML += "</tr><tr>";
                firstDayOfWeek = 1;
            }

            const thisdate = `${currentDay}.${currentMonth + 1}.${currentYear}`;
            const colcol = (thisdate === graydate) ? '#999999' : '#ffffff';

            calendarHTML += `
        <td style="cursor: pointer; background-color: ${colcol};" id="${thisdate}" class="generatedCell" data-param="${thisdate}">
          ${currentDay}
        </td>`;

            firstDayOfWeek++;
            currentDay++;
        }

        calendarHTML += `
        </tr>
      </tbody>
      </table>
    `;
    }

    return calendarHTML;
}

