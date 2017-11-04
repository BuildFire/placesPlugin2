window.usa = {lat: 37.09024, lng: -95.712891};
window.defaultLocation = usa;
window.originalHeight;

window.mapView = {
    settings: {
        zoomLevel: {city: 14, country: 3},
        images: {
            currentLocation: 'google_marker_blue_icon.png',
            place : 'google_marker_red_icon.png',
            selected : 'google_marker_green_icon.png'
        }
    },
    lastKnownLocation: defaultLocation,
    initMap: (places) => {
        //Create the map first (Don't wait for location)
        mapView.createMap();

        //Center map once location is obtained
        buildfire.geo.getCurrentPosition({}, (err, position) => {
            if(!err && position && position.coords){
                mapView.lastKnownLocation = {lat: position.coords.latitude, lng: position.coords.longitude};

                //window.map.setCenter(mapView.lastKnownLocation);
                //window.map.setZoom(mapView.settings.zoomLevel.city);

                mapView.addMarker(map, mapView.lastKnownLocation, mapView.settings.images.currentLocation);
            }
        });

        //TODO: If there is only one entry, it returns an object (not an array)
        if(places && places.length){
            places.forEach((place) => {
                mapView.addMarker(map, place, 'google_marker_red_icon.png');
            });

            let clusterOptions = {
                gridSize: 53,
                styles: [
                    {
                        textColor: 'white',
                        url: 'https://app.buildfire.com/app/media/google_marker_blue_icon2.png',
                        height: 53,
                        width: 53
                    }
                ],
                maxZoom: 15
            };

            // Add a marker clusterer to manage the markers.
            new MarkerClusterer(map, app.state.markers, clusterOptions);

            map.fitBounds(app.state.bounds);
        }
    },
    updateMap: (newPlaces) => {
        //Add new markers
        newPlaces.forEach((place) => {
            mapView.addMarker(map, place, 'google_marker_red_icon.png');
        });
    },
    centerMap: () => { window.map.setCenter(mapView.lastKnownLocation) },
    addMarker: (map, place, iconType) => {
        let marker = new google.maps.Marker({
            position: place.address,
            map: map,
            icon: mapView.createMarker(iconType)
        });

        if(place.address){
            let lat = place.address.lat,
                lng = place.address.lng;

            app.state.markers.push(marker);
            app.state.bounds.extend({lat, lng});

            marker.addListener('click', () => {mapView.markerClick(place)});
        }
    },
    markerClick: (place) => {
        let locationDetails = document.getElementById('locationDetails');
        let titleDiv = locationDetails.querySelector('#name');
        let addressDiv = locationDetails.querySelector('#address');
        let distanceDiv = locationDetails.querySelector('#distance');
        let closeDiv = locationDetails.querySelector('#close');
        let arrowDiv = locationDetails.querySelector('#arrow');

        titleDiv.innerHTML = place.title;

        addressDiv.innerHTML = place.address.name;
        addressDiv.style['font-size'] = '12px';

        if((typeof place.distance !== 'undefined')){
            distanceDiv.innerHTML = place.distance;
            distanceDiv.style.paddingRight = '5px';
            arrowDiv.style.visibility = 'visible';
        }

        closeDiv.innerHTML = '&times';

        locationDetails.onclick = e => {
            e.preventDefault();

            app.state.selectedPlace = place;
            router.navigate(app.settings.viewStates.detail);
        };

        closeDiv.onclick = e => {
            e.stopPropagation();

            titleDiv.innerHTML = '';
            distanceDiv.innerHTML = '';
            closeDiv.innerHTML = '';
            locationDetails.style.height = 0;
            mapViewDiv.style.height = `${originalHeight}px`;
        };

        locationDetails.style.cursor = 'pointer';

        const detailsSize = 100;
        const mapViewDiv = document.getElementById('mapView');

        locationDetails.style.height = `${detailsSize}px`;

        if(mapViewDiv.getBoundingClientRect().height === originalHeight){
            let newHeight = originalHeight - detailsSize;
            mapViewDiv.style.height = `${newHeight}px`;
        }
    },
    createMarker:(imageType) => {
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
    },
    createMap: () =>{
        let mapTypeId = google.maps.MapTypeId.ROADMAP,
            zoomPosition = google.maps.ControlPosition.RIGHT_TOP;

        let zoomTo = (mapView.lastKnownLocation != defaultLocation) ? mapView.settings.zoomLevel.city : mapView.settings.zoomLevel.country,
            centerOn = (mapView.lastKnownLocation != defaultLocation) ? mapView.lastKnownLocation : defaultLocation ;

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

        window.map = new google.maps.Map(document.getElementById('mapView'), options);

        app.state.bounds = new google.maps.LatLngBounds();

        let filterDiv = document.getElementById('mapFilter');
        let centerDiv = document.getElementById('mapCenter');

        new CenterControl(centerDiv);
        new FilterControl(filterDiv);

        const mapViewDiv = document.getElementById('mapView');
        window.originalHeight = (mapViewDiv) ? mapViewDiv.getBoundingClientRect().height: 0;
    }
};