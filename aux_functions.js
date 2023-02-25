

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




