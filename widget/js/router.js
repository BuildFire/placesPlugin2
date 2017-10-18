// getElementById wrapper
function $id(id) {
    return document.getElementById(id);
}

// asyncrhonously fetch the html template partial from the file directory,
// then set its contents to the html of the parent element
function loadHTML(url, id) {
    req = new XMLHttpRequest();
    req.open('GET', url);
    req.send();
    req.onload = () => {
        $id(id).innerHTML = req.responseText;
    }
}

//Provide a delay to let the template load first
function loadControl(initFunction, data){

    let view = document.getElementById("view");
    view.className = 'transition';

    setTimeout( function(){
        initFunction(data);
        view.className = 'fade';
    }, 150)
}

function loadMap(places){
    loadHTML('./map.html', 'view');  loadControl(mapView.initMap, places)
}

function loadList(places){
    loadHTML('./list.html', 'view'); loadControl(listView.initList, places)
}

function loadDetail(place){
    loadHTML('./detail.html', 'view'); loadControl(detailView.init, place)
}

// use #! to hash
router = new Navigo(null, true);
router.on({
    // 'view' is the id of the div element inside which we render the HTML
    'map': () => { loadMap(app.state.filteredPlaces) },
    'list': () => { loadList(app.state.filteredPlaces) },
    'detail': () => { loadDetail(app.state.selectedPlace) },
});

const gotPlaces = (err, places) => {
    if(app.state.mode == app.settings.viewStates.list){
        loadList(places)
    }
    else{
        loadMap(places);
    }
};
//TODO: Move logic to app.js
const gotLocation = (err, location) =>{
    //Calculate distances
    console.error('Got current location');

    let destinations = [];

    app.state.places.forEach(place => {
        destinations.push(new google.maps.LatLng(place.address.lat, place.address.lng))
    });

    let origin = [{lat: location.latitude, lng: location.longitude}];

    let service = new google.maps.DistanceMatrixService();

    service.getDistanceMatrix({
        origins: origin,
        destinations: destinations,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL //google.maps.UnitSystem.METRIC
    }, (response) => {
        //Update places with distance
        app.state.places.map((place, index)=>{
           place.distance =  response.rows[0].elements[index].distance.text;
        });

        if(app.state.mode == app.settings.viewStates.list){
            listView.updateDistances(app.state.filteredPlaces);
        }
    });
};

// set the default route
router.on(() => {
    //Artificial delay to ensure the app is ready
    setTimeout(() => app.init(gotPlaces, gotLocation), 2500);

    //app.init(gotPlaces, gotLocation);
});

// set the 404 route
router.notFound((query) => { $id('view').innerHTML = '<h3>Invalid Route</h3>'; })

router.resolve();