let map,
    usa = {lat: 37.09024, lng: -95.712891},
    zoomLevel = {city: 14, country: 3},
    defaultLocation = usa,
    lastKnownLocation = defaultLocation;

let centerMap = () => {map.setCenter(lastKnownLocation);};

function initMap() {
    //Create the map first (Don't wait for location)
    createMap(defaultLocation.lat, defaultLocation.lng);

    //Center map once location is obtained
    buildfire.geo.getCurrentPosition({}, (err, position) => {
        if(!err && position && position.coords){
            lastKnownLocation = {lat: position.coords.latitude, lng: position.coords.longitude};

            map.setCenter(lastKnownLocation);
            map.setZoom(zoomLevel.city);
        }
    });
}

function createMap(latitude, longitude){
    let locationBottomLeft = google.maps.ControlPosition.BOTTOM_LEFT,
        locationBottomRight = google.maps.ControlPosition.BOTTOM_RIGHT,
        mapTypeId = google.maps.MapTypeId.ROADMAP,
        zoomPosition = google.maps.ControlPosition.RIGHT_TOP;

    let options = {
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoom: zoomLevel.country,
        center: defaultLocation,
        mapTypeId: mapTypeId,
        zoomControlOptions: {
            position: zoomPosition
        }
    };

    map = new google.maps.Map(document.getElementById('mapView'), options);

    let centerControlDiv = document.createElement('div'),
        filterMapDiv = document.createElement('div');

    new CenterControl(centerControlDiv);
    new FilterControl(filterMapDiv);

    centerControlDiv.index = 1;

    map.controls[locationBottomLeft].push(centerControlDiv);
    map.controls[locationBottomRight].push(filterMapDiv);
}