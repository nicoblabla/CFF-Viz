function Delays() {
    let map;
    this.initMap = async function() {
        map = new google.maps.Map(document.getElementById("map"), {
            zoom: 8.5,
            center: { lat: 46.773357, lng: 8.2143418 },
            disableDefaultUI: true,
            mapId: "634d8c221b2996df",
            gestureHandling: 'greedy'
        });

        Promise.all([
            fetch("../../data/actual_data/clean/delay_by_line.json").then(response => response.json()),
            fetch("../../data/actual_data/clean/stops.json").then(response => response.json()),
        ]).then(result => {
            draw(result[0], result[1]);
        })
    }

    function draw(delay_by_line, stops) {
        let delays = Object.values(delay_by_line).map(i => i.totalDelay / i.nbTrain);
        let max = Math.max(...delays)
        for (let line in delay_by_line) {
            let delay = delay_by_line[line];
            let delay_in_minutes = delay.totalDelay / delay.nbTrain;

            const linePath = new google.maps.Polyline({
                path: [stops[delay.stationA], stops[delay.stationB]],
                geodesic: true,
                strokeColor: lerpColor("#00FF00", "#FF0000", delay_in_minutes / max),
                strokeOpacity: 1.0,
                strokeWeight: (delay.totalDelay / delay.nbTrain) / 60,
            });
            
            linePath.setMap(map);
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
}

let delays = new Delays();