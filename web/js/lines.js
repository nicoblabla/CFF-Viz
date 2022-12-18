let map;
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 8.5,
        center: { lat: 46.773357, lng: 8.2143418 },
        disableDefaultUI: true,
        mapId: "30818625b47320dc",
        gestureHandling: 'greedy',
        styles:
            [
                {
                    "featureType": "all",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#202c3e"
                        }
                    ]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.text.fill",
                    "stylers": [
                        {
                            "gamma": 0.01
                        },
                        {
                            "lightness": 20
                        },
                        {
                            "weight": "1.39"
                        },
                        {
                            "color": "#ffffff"
                        }
                    ]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.text.stroke",
                    "stylers": [
                        {
                            "weight": "0.96"
                        },
                        {
                            "saturation": "9"
                        },
                        {
                            "visibility": "on"
                        },
                        {
                            "color": "#000000"
                        }
                    ]
                },
                {
                    "featureType": "all",
                    "elementType": "labels.icon",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "landscape",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "lightness": 30
                        },
                        {
                            "saturation": "9"
                        },
                        {
                            "color": "#29446b"
                        }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "saturation": 20
                        }
                    ]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "lightness": 20
                        },
                        {
                            "saturation": -20
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "lightness": 10
                        },
                        {
                            "saturation": -30
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#193a55"
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        {
                            "saturation": 25
                        },
                        {
                            "lightness": 25
                        },
                        {
                            "weight": "0.01"
                        }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "all",
                    "stylers": [
                        {
                            "lightness": -20
                        }
                    ]
                }
            ]
    });

    drawLine();

}

async function drawLine() {
    let lines = await (await fetch('data/lines.json')).json();
    let km = 0;

    for (let line of lines) {
        let coords = line.fields.geo_shape.coordinates.map(c => { return { lat: c[1], lng: c[0] } });
        /*for (let i = 1; i < coords.length; i++) {
            let prevCoord = coords[i-1];
            let coord = coords[i];
        }*/
        const path = new google.maps.Polyline({
            path: coords,
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });
        km += line.fields.km_agm_bis - line.fields.km_agm_von;
        path.setMap(map);
    }
    console.log(km);

}