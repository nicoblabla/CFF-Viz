function Delays() {
    let map;
    let delayData = {};

    let lineOrStation = 'line';
    let allOrDayOrHour = 'all';
    let subOption = 0;
    let mapObjects = [];
    let popup = null;

    this.initMap = async function () {
        map = new google.maps.Map(document.getElementById("map"), {
            zoom: 8.5,
            center: { lat: 46.773357, lng: 8.2143418 },
            disableDefaultUI: true,
            mapId: darkmode.inDarkMode ? "ba8d9b8c2bd0cb9d" : "634d8c221b2996df",
            gestureHandling: 'greedy'
        });

        Promise.all([
            fetch("./data/stops.json").then(response => response.json()),
            fetch("./data/delay_by_line.json").then(response => response.json()),
            fetch("./data/delay_by_line_by_day.json").then(response => response.json()),
            fetch("./data/delay_by_line_by_hour.json").then(response => response.json()),
            fetch("./data/delay_by_station.json").then(response => response.json()),
            fetch("./data/delay_by_station_by_day.json").then(response => response.json()),
            fetch("./data/delay_by_station_by_hour.json").then(response => response.json()),

        ]).then(result => {
            delayData = {
                stops: result[0],
                line: {
                    all: result[1],
                    day: result[2],
                    hour: result[3]
                },
                station: {
                    all: result[4],
                    day: result[5],
                    hour: result[6]
                }
            }
            draw();
        });
    }

    function clear() {
        while (mapObjects.length > 0) {
            o = mapObjects.pop();
            o.setMap(null);
        }
    }

    function draw() {
        clear();
        let currentData = delayData[lineOrStation][allOrDayOrHour];
        if (allOrDayOrHour != 'all') {
            currentData = currentData[subOption];
        }
        let stops = delayData['stops'];
        if (lineOrStation === 'line') {
            let delays = Object.values(currentData)
                .filter(d => d.nbTrain >= 10)
                .map(i => i.totalDelay / i.nbTrain);
            let max = Math.max(...delays)
            for (let line in currentData) {
                let delay = currentData[line];
                let delay_in_minutes = delay.totalDelay / delay.nbTrain;

                if (!(delay.stationA in stops)) {
                    continue;
                }
                if (!(delay.stationB in stops)) {
                    continue;
                }
                if (delay.nbTrain < 10) {
                    //continue;
                }

                const linePath = new google.maps.Polyline({
                    path: [stops[delay.stationA], stops[delay.stationB]],
                    geodesic: true,
                    strokeColor: lerpColor("#1A85FF", "#FE6100", Math.min(delay.totalDelay / delay.nbTrain / 60 / 5, 1)),
                    strokeOpacity: 1.0,
                    strokeWeight: 1 + (delay.totalDelay / delay.nbTrain) / 200,
                });

                linePath.addListener('mouseover', (e) => {
                    if (popup) {
                        popup.setMap(null);
                    }
                    popup = new google.maps.InfoWindow({
                        content: `
                        <h2 style="color: black">${delay.stationA} → ${delay.stationB}</h2>
                        <div style="color: black">
                        <b>Train count:</b> ${delay.nbTrain}<br>
                        <b>Mean delay:</b> ${Math.round(delay.totalDelay / delay.nbTrain / 60)} minutes<br>
                        <b>Cancelled train:</b> ${delay.nbCancelled}
                        </div>
                        `,
                    });
                    popup.open({
                        map: map,
                        anchor: linePath
                    });
                    popup.setPosition(e.latLng)
                });

                linePath.setMap(map);
                mapObjects.push(linePath);
            }
        } else if (lineOrStation === 'station') {
            let delays = Object.values(currentData).map(i => i.totalDelay / i.nbTrain);
            let max = Math.max(...delays);
            for (let station in currentData) {
                let delay = currentData[station];
                let delay_in_minutes = delay.totalDelay / delay.nbTrain;

                if (!(delay.stationName in stops)) {
                    continue;
                }
                if (delay.nbTrain < 10) {
                    continue;
                }

                const circle = new google.maps.Circle({
                    geodesic: true,
                    strokeColor: lerpColor("#1A85FF", "#FE6100", Math.min(delay.totalDelay / delay.nbTrain / 60 / 5, 1)),
                    fillColor: lerpColor("#1A85FF", "#FE6100", Math.min(delay.totalDelay / delay.nbTrain / 60 / 5, 1)),
                    strokeOpacity: 1.0,
                    radius: (1 + (delay.totalDelay / delay.nbTrain) * 5),
                    fillOpacity: 1,
                    center: stops[delay.stationName],
                });

                circle.addListener('mouseover', (e) => {
                    if (popup) {
                        popup.setMap(null);
                    }
                    popup = new google.maps.InfoWindow({
                        content: `
                        <h2 style="color: black">${delay.stationName}</h2>
                        <div style="color: black">
                        <b>Train count:</b> ${delay.nbTrain}<br>
                        <b>Mean delay:</b> ${Math.round(delay.totalDelay / delay.nbTrain / 60)} minutes<br>
                        <b>Cancelled train:</b> ${delay.nbCancelled}
                        </div>
                        `,
                    });
                    popup.open({
                        map: map,
                        anchor: circle
                    });
                    popup.setPosition(e.latLng)
                });

                circle.setMap(map);
                mapObjects.push(circle);

            }
        }
    }


    //https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
    function lerpColor(a, b, amount) {

        var ah = parseInt(a.replace(/#/g, ''), 16),
            ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
            bh = parseInt(b.replace(/#/g, ''), 16),
            br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
            rr = ar + amount * (br - ar),
            rg = ag + amount * (bg - ag),
            rb = ab + amount * (bb - ab);

        return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
    }

    this.changeType = (radio) => {
        lineOrStation = radio.value;
        draw();
    }

    this.changeFrame = (radio) => {
        allOrDayOrHour = radio.value;
        if (allOrDayOrHour == 'all') {
            document.getElementById('subOptionDay').style.display = 'none';
            document.getElementById('subOptionHour').style.display = 'none';
        } else if (allOrDayOrHour == 'day') {
            document.getElementById('subOptionDay').style.display = 'block';
            document.getElementById('subOptionHour').style.display = 'none';
            subOption = document.getElementById('subOptionDayRange').value;
        } else if (allOrDayOrHour == 'hour') {
            document.getElementById('subOptionDay').style.display = 'none';
            document.getElementById('subOptionHour').style.display = 'block';
            subOption = document.getElementById('subOptionHourRange').value;
        }
        draw();
    }

    this.changeSubOption = (value) => {
        subOption = value;
        draw();
    }

    this.setMapTheme = function (theme) {
        try {
            map = new google.maps.Map(document.getElementById("map"), {
                zoom: 8.5,
                center: { lat: 46.773357, lng: 8.2143418 },
                disableDefaultUI: true,
                mapId: theme,
                gestureHandling: 'greedy'
            });
            draw();
        } catch { };
    }


}

let delays = new Delays();
