
const stopTimes = require('../data/stop_times.json');
const stops = require('../data/stops.json');

exports.getTrains = function(t) {
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

exports.getStations = function(t) {
    let results = [];
    for (let stop in stops) {
        results.push(stops[stop]);
    }
    const unique = [...new Map(results.map(item =>
        [`${rnd(item[0], 1e6)},${rnd(item[1], 1e6)}`, item])).values()];
    return unique;
}

exports.dateToSeconds = function(d) {
    return d.getHours * 3600 + d.getMinutes * 60 + d.getSeconds + d.getMilliseconds / 1000;
}

exports.timeToSeconds = function(h, m, s) {
    return h * 3600 + m * 60 + s;
}

function rnd(v, e = 1e7) {
    return Math.round(v * e) / e;
}

if (require.main === module) {
    let t = this.timeToSeconds(14,35,0);
    console.log(this.getTrains(t));
}
