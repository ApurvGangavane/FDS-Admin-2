// default map layer
let map = L.map('map', {
    layers: MQ.mapLayer(),
    center: [19.0760, 72.8777],
    zoom: 11
});

// let latToCoord = [
//                 { latLng: { lat: 20.001553, lng:73.770961} },
//                 { latLng: { lat: 19.097771, lng:72.881862} },
//                 { latLng: { lat: 18.542143, lng:73.836864} },
//                 { latLng: { lat: 17.284962, lng:74.191590} },
//                 { latLng: { lat: 19.114526, lng:74.760180} },
//                 { latLng: { lat: 20.001553, lng:73.770961} }
// ]


// function geoToEuclidean() {
//     const x = 6378100*lng*Math.cos(19.022375);
//     const y = 6378100*lat;
//     fs.appendfile('tsp-project.tsp');
// }

console.log(finalData);
    

    function runDirection() {
        
        
        var dir = MQ.routing.directions();
        
        dir.route({
            locations: finalData
        });
        console.log(start);
    

        CustomRouteLayer = MQ.Routing.RouteLayer.extend({
            createStartMarker: (location) => {
                var custom_icon;
                var marker;

                custom_icon = L.icon({
                    iconUrl: '/javascript/img/red.png',
                    iconSize: [20, 29],
                    iconAnchor: [10, 29],
                    popupAnchor: [0, -29]
                });

                marker = L.marker(location.latLng, {icon: custom_icon}).addTo(map);

                return marker;
            },

            createEndMarker: (location) => {
                var custom_icon;
                var marker;

                custom_icon = L.icon({
                    iconUrl: '/javascript/img/red.png',
                    iconSize: [20, 29],
                    iconAnchor: [10, 29],
                    popupAnchor: [0, -29]
                });

                marker = L.marker(location.latLng, {icon: custom_icon}).addTo(map);

                return marker;
            }
        });
        
        map.addLayer(new CustomRouteLayer({
            directions: dir,
            fitBounds: true
        })); 
    }

runDirection();


// function that runs when form submitted
function submitForm(event) {
    event.preventDefault();

    // delete current map layer
    map.remove();

    // getting form data
    start = document.getElementById("start").value;
    end = document.getElementById("destination").value;

    // run directions function
    runDirection(start, end);

    // reset form
    document.getElementById("form").reset();
}

// asign the form to form variable
const form = document.getElementById('form');

// call the submitForm() function when submitting the form
form.addEventListener('submit', submitForm);