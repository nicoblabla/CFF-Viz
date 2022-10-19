let map;
async function initMap() {
    let style = await fetch("/style.json").then(response => response.json());
    console.log(style);
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 9.5,
        center: { lat: 46.773357, lng: 8.2143418 },
        disableDefaultUI: true,
        mapId: "634d8c221b2996df",
        /*styles: [{
            featureType: "poi",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        }]*/
    });
    /*map = new google.maps.Map(document.getElementById("map"), {
        zoom: 17,
        tilt: 100,
        heading: 20,
        center: { lat: 46.9462332, lng: 7.4348058 },
        disableDefaultUI: true,
        mapId: "634d8c221b2996df",
    });*/
    /*let stops = await fetch('/api/getStations')
        .then(response => response.json());
    for (let stop of stops) {
        new google.maps.Circle({
            strokeColor: "#001514",
            strokeOpacity: 0.6,
            strokeWeight: 5,
            fillColor: "#001514",
            fillOpacity: 0.6,
            map,
            center: { lat: stop[0], lng: stop[1] },
            radius: 10,
        });
    }*/

    /*setInterval(() => {
        draw(t);
        t+= 600;
    }, 5000)*/
    draw(dateToSeconds(new Date()))

//2880


}

let t = 6 * 3600;
let circles = [];
function draw(t) {
    return new Promise((resolve, reject) => {
        fetch('/api/getTrains/' + t)
            .then(response => response.json())
            .then((trains) => {
                document.getElementById('clock').innerHTML = secondToTime(t);
                /*for (let circle of circles) {
                    circle.setMap(null);
                }
                circles.length = 0;*/
                /*for (let train of trains) {
                    let circle = new google.maps.Circle({
                        strokeColor: "#F44336",
                        strokeOpacity: 0.6,
                        strokeWeight: 2,
                        fillColor: "#F44336",
                        fillOpacity: 0.6,
                        map,
                        center: { lat: train[0], lng: train[1] },
                        radius: 200,
                    });
                    circles.push(circle);
                }*/
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
                    resolve();
                }, 2000)
            });
    });
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

}, 1000/30)*/s

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
    let h = Math.floor(s / 3600) % 24 +"";
    return h.padStart(2, "0") + ":" + m.padStart(2, "0") + ":" + s1.padStart(2, "0");
}