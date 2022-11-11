let map;
async function initMap() {
    map = new google.maps.Map(document.getElementById("map2"), {
        zoom: 8.5,
        center: { lat: 46.773357, lng: 8.2143418 },
        disableDefaultUI: true,
        mapId: "634d8c221b2996df",
    });

    /*setInterval(() => {
        draw(t);
        t+= 600;
    }, 5000)*/
    /*stopTimes = await (await fetch('../data/stop_times.json')).json();
    stops = await (await fetch('../data/stops.json')).json();
    currentSeconds = dateToSeconds(new Date());
    draw(currentSeconds)*/
    let buffer = await (await fetch('../data/stop_times.json.lzs')).arrayBuffer();
    stopTimes = JSON.parse(LZString.decompressFromUint8Array(new Uint8Array(buffer)));
    stops = await (await fetch('../data/stops.json')).json();
    currentSeconds = dateToSeconds(new Date());
    draw(currentSeconds)

    /*let a = LZString.compressToUint8Array(JSON.stringify(stopTimes));
    console.log(a);*/

    //2880
}

let currentSeconds = null;
let stopTimes = null;
let stops = null;

let t = 6 * 3600;
let circles = [];
function draw(t) {
    let trains = getTrains(t);
    document.getElementById('clock').innerHTML = secondToTime(t);
    for (let i = 0; i < trains.length; i++) {
        if (i < circles.length) {
            circles[i].setCenter({ lat: trains[i][0], lng: trains[i][1] });
            if (!circles[i].getMap())
                circles[i].setMap(map);
        } else {
            circles.push(new google.maps.Circle({
                strokeColor: "#F44336",
                strokeOpacity: 1,
                strokeWeight: 5,
                fillColor: "#F44336",
                fillOpacity: 1,
                map,
                center: { lat: trains[i][0], lng: trains[i][1] },
                radius: 50,
            }));
        }
    }
    for (let i = trains.length; i < circles.length; i++) {
        circles[i].setMap(null);
    }

    setTimeout(() => {
        console.log("draw", currentSeconds)
        currentSeconds += 60;
        currentSeconds %= 86400; // 24 * 3600
        draw(currentSeconds)
    }, 1);
}

function getTrains(t) {
    let results = [];
    for (let i = 0; i < stopTimes.length; i++) {
        if (t >= stopTimes[i][2]+15 && t <= stopTimes[i][3]) { // Trains in station
            results.push(stops[stopTimes[i][1]]);
        }
        if (stopTimes[i][0] == stopTimes[i+1]?.[0] && t > stopTimes[i][3] && t < stopTimes[i+1][2]+15) { // Trains between i and i+1
            let p1 = stops[stopTimes[i][1]];
            let p2 = stops[stopTimes[i+1][1]];
            let progression = (t - stopTimes[i][3]) / ((stopTimes[i+1][2]+15) - stopTimes[i][3])
            results.push([
                p1[0] + progression * (p2[0] - p1[0]),
                p1[1] + progression * (p2[1] - p1[1])
            ]);
        }
    }
    for (let result of results) {
        result[0] = rnd(result[0], 1e7);
        result[1] = rnd(result[1], 1e7);
    }
    return results;
}

let interval = setInterval(() => {
    if (document.querySelector('.dismissButton')) {
        document.querySelector('.dismissButton')?.click();
        clearInterval(interval);
    }
}, 50);

let tilt = 100, heading = 0, zoom = 10;
/*setInterval(() => {

    heading+=0.2;
    map.moveCamera({tilt, heading});

}, 1000/30)*/

function dateToSeconds(d) {
    return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000;
}

function timeToSeconds(h, m, s) {
    return h * 3600 + m * 60 + s;
}

function secondToTime(s) {
    s = Math.round(s);
    let s1 = s % 60 + "";
    let m = Math.floor(s / 60) % 60 + "";
    let h = Math.floor(s / 3600) % 24 + "";
    return h.padStart(2, "0") + ":" + m.padStart(2, "0") + ":" + s1.padStart(2, "0");
}

function rnd(v, e = 1e7) {
    return Math.round(v * e) / e;
}