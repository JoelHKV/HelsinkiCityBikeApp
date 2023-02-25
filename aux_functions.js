

export function erasemarkersandpolylines() {
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

