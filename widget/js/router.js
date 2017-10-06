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
function loadControl(initFunction, places){
    setTimeout( function(){ initFunction(places)}, 500)
}


function loadMap(places){
    loadHTML('./map.html', 'view');  loadControl(mapView.initMap, places)
}

function loadList(places){
    loadHTML('./list.html', 'view'); loadControl(listView.initList, places)
}

// use #! to hash
router = new Navigo(null, true);
router.on({
    // 'view' is the id of the div element inside which we render the HTML
    'map': () => { loadMap(app.places) },
    'list': () => { loadList(app.places) },
});

const gotPlaces = (err, places) => {
    if(app.settings.mode == app.settings.state.list){
        loadList(places)
    }
    else{
        loadMap(places);
    }
};

const gotLocation = (err, location) =>{
    //Calculate distances
    console.error('location', location.latitude, location.longitude, app.places);

    let distanceService = new google.maps.DistanceMatrixService();

    app.places.forEach(element => {
        distanceService.getDistanceMatrix(
            {
                origins: [{lat: location.latitude, lng: location.longitude}],
                destinations: [new google.maps.LatLng(element.lat, element.lng)],
                travelMode: 'DRIVING',
                unitSystem: google.maps.UnitSystem.IMPERIAL //google.maps.UnitSystem.METRIC
            }, (response, status) => {
                //element.distance =  response.rows[0].elements[0].distance.text;
                console.log('response', response);
                console.log('status', status);
                //console.error('element.distance', element.distance);
            });

    });
};

// set the default route
router.on(() => {
    app.init(gotPlaces, gotLocation);
});

// set the 404 route
router.notFound((query) => { $id('view').innerHTML = '<h3>Error</h3>'; })

router.resolve();