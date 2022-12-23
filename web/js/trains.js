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
            mapId: darkmode.inDarkMode ? "ba8d9b8c2bd0cb9d" : "634d8c221b2996df",
            gestureHandling: 'greedy'
        });

        const bounds = new google.maps.LatLngBounds(
            //new google.maps.LatLng(45.7769477403, 6.02260949059), // Switzerland only
            //new google.maps.LatLng(47.8308275417, 10.4427014502)

            new google.maps.LatLng(41.437517, -2.019690),
            new google.maps.LatLng(50.005379, 10.493168)
        );
        window.bounds = bounds;
        let previousTime = (new Date()).getTime();

        class Overlay extends google.maps.OverlayView {
            bounds;
            canvas;
            div;
            overlayProjection;
            canvas;
            constructor(bounds) {
                super();
                this.bounds = bounds;
            }

            onAdd() {
                this.div = document.createElement("div");
                this.div.style.borderStyle = "none";
                this.div.style.borderWidth = "0px";
                this.div.style.position = "absolute";
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
                if (!pause) {
                    setTimeout(() => {
                        if (!pause) {
                            let currentTime = (new Date()).getTime();
                            let elapsedTime = currentTime - previousTime
                            currentSeconds += simulationSpeed * elapsedTime / 1000;
                            currentSeconds %= 86400; // 24 * 3600
                            previousTime = currentTime;
                            this.refresh(currentSeconds)
                        }
                    }, 60);
                }

                if (!this.overlayProjection)
                    return;
                const sw = this.overlayProjection.fromLatLngToDivPixel(
                    this.bounds.getSouthWest()
                );
                const ne = this.overlayProjection.fromLatLngToDivPixel(
                    this.bounds.getNorthEast()
                );

                let trains = getTrains(t);
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                document.getElementById('clock').innerHTML = secondToTime(t);
                updateClock(t);
                ctx.fillStyle = "#FE6100";
                for (let i = 0; i < trains.length; i++) {

                    const pos = this.overlayProjection.fromLatLngToDivPixel(
                        { lat: trains[i][0], lng: trains[i][1] }
                    );

                    ctx.beginPath();
                    ctx.arc(pos.x - sw.x, pos.y - ne.y, 3, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }

        overlay = new Overlay(bounds);
        window.Overlay = Overlay;

        overlay.setMap(map);

    }

    let currentSeconds = null;
    let stopTimes = null;
    let stops = null;

    function getTrains(t) {
        let results = [];
        for (let i = 0; i < stopTimes.length; i++) {
            if (checkedTrains.has(stopTimes[i][5]) && checkedAgencies.has(stopTimes[i][4])) {
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
            stopTimes = JSON.parse(LZString.decompressFromUTF16(buffer));
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
        if (speed > 10) {
            document.getElementById('cffSecond').style.opacity = 0;
        } else {
            document.getElementById('cffSecond').style.opacity = 1;
        }
    }

    this.addTime = function (d) {
        currentSeconds += d;
    }

    this.resetTime = function () {
        currentSeconds = dateToSeconds(new Date());
    }

    this.setMapTheme = function (theme) {
        let oldMap = map;
        try {

            map = new google.maps.Map(document.getElementById("map2"), {
                zoom: 8.5,
                center: { lat: 46.773357, lng: 8.2143418 },
                disableDefaultUI: true,
                mapId: theme,
                gestureHandling: 'greedy'
            });
            if (window.Overlay) {
                overlay = new window.Overlay(window.bounds);
            }

            overlay.setMap(map);
        } catch (error) {
            map = oldMap;
            console.error("trains error: ", error)
        }
    }
}

let trains = new Trains();

function updateClock(s) {
    s = Math.round(s);
    let s1 = s % 60;
    let m = s / 60 % 60;
    let h = Math.floor(s / 3600) % 24;

    let hdegree = h * 30 + (m / 2);
    let hrotate = "rotate(" + hdegree + "deg)";

    let mdegree = m * 6;
    let mrotate = "rotate(" + mdegree + "deg)";

    let sdegree = s1 * 6;
    let srotate = "rotate(" + sdegree + "deg)";


    document.getElementById('cffHour').style.transform = hrotate;
    document.getElementById('cffMinute').style.transform = mrotate;
    document.getElementById('cffSecond').style.transform = srotate;
}

// GUILLAUME'S THINGS, MAY BE STUPID IDK

// Manage collapsibles

var collapsibles = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < collapsibles.length; i++) {
    collapsibles[i].addEventListener("click", function () {
        var content = this.nextElementSibling;
        content.classList.toggle("coll-content-showing");
        content.classList.toggle("coll-content-hidden");
        this.classList.toggle("coll-active");
        this.classList.toggle("btn-primary");
        this.classList.toggle("btn-outline-primary");
    });
}

// Manage train categories

async function manageTrains() {
    let routeShortNames = await (await fetch('data/route_short_names.json')).json();
    let colContainer = document.getElementById("col-container");

    Object.keys(routeShortNames).forEach((key) => {
        // counting
        totalsTrains[key] = routeShortNames[key].length;
        countersTrains[key] = 0;
        // div (column)
        let divCol = document.createElement('div');
        divCol.classList.add('col');
        // div overall
        let divOverall = document.createElement('div');
        divOverall.classList.add('form-check', 'mb-3');
        // Overall
        var overall = document.createElement('input');
        overall.classList.add('form-check-input');
        overall.type = 'checkbox';
        overall.id = `key_${key}`;
        overall.value = `key_${key}`;
        overall.addEventListener("click", function () {
            let cboxes = [];
            let sibling = this.parentElement.nextElementSibling;

            while (sibling) {
                let cbox = sibling.firstElementChild;
                if (cbox.type === 'checkbox') {
                    cboxes.push(cbox);
                }
                sibling = sibling.nextElementSibling;
            }

            if (this.checked) {
                cboxes.forEach((cbox) => {
                    cbox.checked = true;
                    countersTrains[key] = totalsTrains[key];
                    checkedTrains.add(cbox.value);
                });
            }
            else {
                cboxes.forEach((cbox) => {
                    cbox.checked = false;
                    countersTrains[key] = 0;
                    checkedTrains.delete(cbox.value);
                });
            }
        });
        // label
        let labelOverall = document.createElement('label');
        labelOverall.classList.add('fw-bold', 'mb-0', 'text-decoration-underline');
        labelOverall.htmlFor = `key_${key}`;
        labelOverall.innerText = key;
        // Adding
        divOverall.appendChild(overall);
        divOverall.appendChild(labelOverall);
        divCol.appendChild(divOverall);
        // Checkboxes
        routeShortNames[key].forEach((trainType) => {
            // div cbox
            let divCbox = document.createElement('div');
            divCbox.classList.add('form-check');
            // input (switch)
            var cbox = document.createElement('input');
            cbox.classList.add('form-check-input');
            cbox.type = 'checkbox';
            cbox.id = trainType;
            cbox.value = trainType;
            if (alreadyCheckedTrains.includes(trainType)) {
                cbox.checked = true;
                countersTrains[key]++;
            }
            cbox.addEventListener("click", function () {
                if (this.checked) {
                    countersTrains[key]++;
                    checkedTrains.add(this.value);
                }
                else {
                    countersTrains[key]--
                    checkedTrains.delete(this.value);
                }

                if (countersTrains[key] === 0) {
                    overall.checked = false;
                    overall.indeterminate = false;
                }
                else if (countersTrains[key] === totalsTrains[key]) {
                    overall.checked = true;
                    overall.indeterminate = false;
                }
                else {
                    overall.checked = false;
                    overall.indeterminate = true;
                }
            });
            // label
            var label = document.createElement('label');
            label.classList.add('form-check-label');
            label.htmlFor = trainType;
            label.innerText = trainType;
            // Adding
            divCbox.appendChild(cbox);
            divCbox.appendChild(label);
            divCol.appendChild(divCbox);
        })
        // Reevaluating overall checked
        if (countersTrains[key] === 0) {
            overall.checked = false;
            overall.indeterminate = false;
        }
        else if (countersTrains[key] === totalsTrains[key]) {
            overall.checked = true;
            overall.indeterminate = false;
        }
        else {
            overall.checked = false;
            overall.indeterminate = true;
        }
        // Adding
        colContainer.appendChild(divCol);
    });


}
manageTrains();

const alreadyCheckedTrains = ['IC1', 'IC2', 'IC3', 'IC4', 'IC5', 'IC6', 'IC8', 'IC21', 'IC51', 'IC61', 'TGV', 'ICE', 'm1', 'm2'];
let checkedTrains = new Set(alreadyCheckedTrains);

let totalsTrains = {};
let countersTrains = {};

// Manage agency categories

async function manageAgencies() {
    let agencyNames = await (await fetch('data/agency_names.json')).json();
    let cboxContainer = document.getElementById("cbox-container");

    totalAgencies = agencyNames.length;

    checkedAgencies = new Set(agencyNames);

    // div overall
    let divOverall = document.createElement('div');
    divOverall.classList.add('form-check', 'mb-2');
    // Overall
    var overall = document.createElement('input');
    overall.classList.add('form-check-input');
    overall.type = 'checkbox';
    overall.id = 'All';
    overall.checked = true;
    overall.addEventListener("click", function () {
        let cboxes = [];
        let sibling = this.parentElement.nextElementSibling;

        while (sibling) {
            let cbox = sibling.firstElementChild;
            if (cbox.type === 'checkbox') {
                cboxes.push(cbox);
            }
            sibling = sibling.nextElementSibling;
        }

        if (this.checked) {
            cboxes.forEach((cbox) => {
                cbox.checked = true;
                counterAgencies = totalAgencies;
                checkedAgencies.add(cbox.value);
            });
        }
        else {
            cboxes.forEach((cbox) => {
                cbox.checked = false;
                counterAgencies = 0;
                checkedAgencies.delete(cbox.value);
            });
        }
    });
    // label
    let labelOverall = document.createElement('label');
    labelOverall.classList.add('fw-bold', 'mb-0', 'fst-italic');
    labelOverall.htmlFor = 'All';
    labelOverall.innerText = 'Toggle all';
    // Adding
    divOverall.appendChild(overall);
    divOverall.appendChild(labelOverall);
    cboxContainer.appendChild(divOverall);
    // Checkboxes
    agencyNames.forEach((name) => {
        // div cbox
        let divCbox = document.createElement('div');
        divCbox.classList.add('form-check');
        // input (switch)
        var cbox = document.createElement('input');
        cbox.classList.add('form-check-input');
        cbox.type = 'checkbox';
        cbox.id = name;
        cbox.value = name;
        cbox.checked = true;
        cbox.addEventListener("click", function () {
            if (this.checked) {
                counterAgencies++;
                checkedAgencies.add(this.value);
            }
            else {
                counterAgencies--
                checkedAgencies.delete(this.value);
            }

            if (counterAgencies === 0) {
                overall.checked = false;
                overall.indeterminate = false;
            }
            else if (counterAgencies === totalAgencies) {
                overall.checked = true;
                overall.indeterminate = false;
            }
            else {
                overall.checked = false;
                overall.indeterminate = true;
            }
        });
        // label
        var label = document.createElement('label');
        label.classList.add('form-check-label');
        label.htmlFor = name;
        label.innerText = name;
        // Adding
        divCbox.appendChild(cbox);
        divCbox.appendChild(label);
        cboxContainer.appendChild(divCbox);
    });
}
manageAgencies();

let checkedAgencies;

let totalAgencies;
let counterAgencies;