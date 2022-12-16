function Trains() {
    let simulationSpeed = 60;
    let pause = true;
    let map;
    let overlay;
    let ctx;
    let t = 6 * 3600;
    this.initMap = async function () {
        map = new google.maps.Map(document.getElementById("map2"), {
            zoom: 8.5,
            center: { lat: 46.773357, lng: 8.2143418 },
            disableDefaultUI: true,
            mapId: "634d8c221b2996df",
            gestureHandling: 'greedy'
        });

        const bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(45.7769477403, 6.02260949059),
            new google.maps.LatLng(47.8308275417, 10.4427014502)
        );
        // The photograph is courtesy of the U.S. Geological Survey.
        let image = "https://developers.google.com/maps/documentation/javascript/";

        image += "examples/full/images/talkeetna.png";

        class Overlay extends google.maps.OverlayView {
            bounds;
            canvas;
            div;
            overlayProjection;
            canvas;
            constructor(bounds, image) {
                super();
                this.bounds = bounds;
                this.image = image;
            }

            onAdd() {
                this.div = document.createElement("div");
                this.div.style.borderStyle = "none";
                this.div.style.borderWidth = "0px";
                this.div.style.position = "absolute";

                // Create the img element and attach it to the div.
                /*const img = document.createElement("img");

                img.src = this.image;
                img.style.width = "100%";
                img.style.height = "100%";
                img.style.position = "absolute";
                this.div.appendChild(img);*/
                this.canvas = document.createElement('canvas');
                this.canvas.width = "100%";
                this.canvas.height = "100%";
                ctx = this.canvas.getContext("2d");
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(10, 10, 100, 100);
                this.div.appendChild(this.canvas);

                // Add the element to the "overlayLayer" pane.
                const panes = this.getPanes();

                panes.overlayLayer.appendChild(this.div);
            }
            draw() {
                console.log("draw1");
                // We use the south-west and north-east
                // coordinates of the overlay to peg it to the correct position and size.
                // To do this, we need to retrieve the projection from the overlay.
                this.overlayProjection = this.getProjection();
                // Retrieve the south-west and north-east coordinates of this overlay
                // in LatLngs and convert them to pixel coordinates.
                // We'll use these coordinates to resize the div.
                const sw = this.overlayProjection.fromLatLngToDivPixel(
                    this.bounds.getSouthWest()
                );
                const ne = this.overlayProjection.fromLatLngToDivPixel(
                    this.bounds.getNorthEast()
                );

                // Resize the image's div to fit the indicated dimensions.
                if (this.div) {
                    this.div.style.left = sw.x + "px";
                    this.div.style.top = ne.y + "px";
                    this.div.style.width = ne.x - sw.x + "px";
                    this.div.style.height = sw.y - ne.y + "px";
                    if (this.canvas.width != ne.x - sw.x) {
                        this.canvas.width = ne.x - sw.x;
                        this.canvas.height = sw.y - ne.y;
                    }
                }



            }

            refresh(t) {


                if (!pause && false) {
                    setTimeout(() => {
                        if (!pause) {
                            currentSeconds += simulationSpeed;
                            currentSeconds %= 86400; // 24 * 3600
                            this.refresh(currentSeconds)
                        }
                    }, 60);
                }

                if (!this.overlayProjection)
                    return;
                console.log("refresh1");
                const sw = this.overlayProjection.fromLatLngToDivPixel(
                    this.bounds.getSouthWest()
                );
                const ne = this.overlayProjection.fromLatLngToDivPixel(
                    this.bounds.getNorthEast()
                );

                let trains = getTrains(t);
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                ctx.fillStyle = "red";
                document.getElementById('clock').innerHTML = secondToTime(t);
                for (let i = 0; i < trains.length; i++) {

                    const pos = this.overlayProjection.fromLatLngToDivPixel(
                        { lat: trains[i][0], lng: trains[i][1] }
                    );

                    ctx.beginPath();
                    console.log(pos.x - sw.x, pos.y - ne.y);
                    ctx.arc(pos.x - sw.x, pos.y - ne.y, 3, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }

        }

        overlay = new Overlay(bounds, image);

        overlay.setMap(map);

    }

    let currentSeconds = null;
    let stopTimes = null;
    let stops = null;

    let circles = [];
    function draw(t) {
        console.log("draw");
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

        /*if (!pause) {
            setTimeout(() => {
                if (!pause) {
                    currentSeconds += simulationSpeed;
                    currentSeconds %= 86400; // 24 * 3600
                    draw(currentSeconds)
                }
            }, 1);
        }*/
    }

    function getTrains(t) {
        let results = [];
        for (let i = 0; i < stopTimes.length; i++) {
            if (t >= stopTimes[i][2] + 15 && t <= stopTimes[i][3]) { // Trains in station
                results.push(stops[stopTimes[i][1]]);
            }
            if (stopTimes[i][0] == stopTimes[i + 1]?.[0] && t > stopTimes[i][3] && t < stopTimes[i + 1][2] + 15) { // Trains between i and i+1
                let p1 = stops[stopTimes[i][1]];
                let p2 = stops[stopTimes[i + 1][1]];
                let progression = (t - stopTimes[i][3]) / ((stopTimes[i + 1][2] + 15) - stopTimes[i][3])
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

    this.start = async function () {

        if (!stopTimes) {
            let buffer = await (await fetch('data/stop_times.json.utf16.lzs')).text();
            console.log(buffer);
            stopTimes = JSON.parse(LZString.decompressFromUTF16(buffer));
            console.log(stopTimes);
            stops = await (await fetch('data/stopsTrains.json')).json();
            currentSeconds = dateToSeconds(new Date());
        }

        pause = false;
        //draw(currentSeconds)
        overlay.refresh(currentSeconds);
    }

    this.stop = function () {
        pause = true;
    }

    this.changeSimulationSpeed = function (speed) {
        simulationSpeed = speed;
    }
}
let trains = new Trains();