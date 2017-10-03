let usa = {lat: 37.09024, lng: -95.712891},
    zoomLevel = {city: 14, country: 3},
    defaultLocation = usa,
    lastKnownLocation = defaultLocation,
    images = {
        currentLocation: 'google_marker_blue_icon.png',
        place : 'google_marker_red_icon.png',
        selected : 'google_marker_green_icon.png'
    };

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

            addMarker(map, lastKnownLocation, images.currentLocation);

        }
    });

    buildfire.datastore.get(placesTag, function(err, results){
        if(err){
            console.error('datastore.get error', err);
            return;
        }

        //TODO: If there is only one entry, it returns an object

        if(places && places.length){
            places.forEach((place) => {
                addMarker(map, place.address, 'google_marker_red_icon.png');
            });
        }
    });

    buildfire.datastore.onUpdate((event) => {
        if(event.tag === placesTag){
            places = event.data.places;

            places.forEach((place) => {
                addMarker(map, place.address, 'google_marker_red_icon.png');
            });
        }
    });
}

function createMap(latitude, longitude){
    let locationBottomLeft = google.maps.ControlPosition.BOTTOM_LEFT,
        locationBottomRight = google.maps.ControlPosition.BOTTOM_RIGHT,
        mapTypeId = google.maps.MapTypeId.ROADMAP,
        zoomPosition = google.maps.ControlPosition.RIGHT_TOP;

    let zoomTo = (lastKnownLocation != defaultLocation) ? zoomLevel.city : zoomLevel.country,
        centerOn = (lastKnownLocation != defaultLocation) ? lastKnownLocation : defaultLocation ;

    let options = {
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoom: zoomTo,
        center: centerOn,
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

function addMarker(map, position, iconType){
    new google.maps.Marker({
        position: position,
        map: map,
        icon: createMarker(iconType)
    });
}

function createMarker(imageType){
    const iconBaseUrl = 'https://app.buildfire.com/app/media/';

    return {
        url: iconBaseUrl + imageType,
        // This marker is 20 pixels wide by 20 pixels high.
        scaledSize: new google.maps.Size(20, 20),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is at the center of the circle
        anchor: new google.maps.Point(10, 10)
    };
}