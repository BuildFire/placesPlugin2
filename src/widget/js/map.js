import axios from "axios"
import Handlebars from "./lib/handlebars"

window.usa = {lat: 37.09024, lng: -95.712891};
window.defaultLocation = usa;
window.originalHeight;

window.mapView = {
    settings: {
        markerClusterer: null,
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
                mapView.addMarker(map, place, mapView.settings.images.place);
            });

            mapView.addMarkerCluster();
            map.fitBounds(app.state.bounds);
        }
    },
    addMarkerCluster: () =>{
        let clusterOptions = {
            gridSize: 53,
            styles: [
                {
                    textColor: 'white',
                    url: 'https://czi3m2qn.cloudimg.io/s/width/53/https://app.buildfire.com/app/media/google_marker_blue_icon2.png',
                    height: 53,
                    width: 53
                }
            ],
            maxZoom: 15
        };

        // Add a marker clusterer to manage the markers.
        mapView.settings.markerClusterer = new MarkerClusterer(map, app.state.markers, clusterOptions);
    },
    updateMap: (newPlaces) => {
        //Add new markers
        newPlaces.forEach((place) => {
            mapView.addMarker(map, place, mapView.settings.images.place);
        });
    },
    filterMap: (placesToHide, placesToShow) => {

        placesToHide.forEach((placeToHide) => {
            app.state.markers = app.state.markers.filter((marker) =>{
                let lat = marker.getPosition().lat(),
                    lng = marker.getPosition().lng();

                const isMatch  = (placeToHide.address.lat === lat && placeToHide.address.lng === lng);

                if(isMatch){
                    marker.setVisible(false);
                }

                return !isMatch;
            })
        });

        placesToShow.forEach((place) =>{
            mapView.addMarker(map, place, mapView.settings.images.place);
        });

        if(placesToHide || placesToShow){
            mapView.settings.markerClusterer.clearMarkers();
            mapView.addMarkerCluster();
        }
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

            marker.addListener('click', () => {mapView.markerClick(place, marker)});
        }
    },
    markerClick: (place, marker) => {
        //Show the location as selected
        marker.setIcon(mapView.createMarker(mapView.settings.images.selected));

        place.marker = marker;

        app.state.selectedPlace.unshift(place);

        //Mark the other locations as not selected
        if(app.state.selectedPlace.length > 1 && app.state.selectedPlace[1].marker){
            app.state.selectedPlace[1].marker.setIcon(mapView.createMarker(mapView.settings.images.place));
        }

        let context = {
            title: place.title,
            address: place.address.name,
            distance: place.distance,
        };

        axios.get('./templates/locationSummary.hbs').then(response => {
            // Compile the template
            let theTemplate = Handlebars.compile(response.data);

            // Pass our data to the template
            let theCompiledHtml = theTemplate(context);

            // Add the compiled html to the page
            let locationSummary = document.getElementById('locationSummary');
            locationSummary.innerHTML = theCompiledHtml;

            locationSummary.onclick = e => {
                e.preventDefault();
                router.navigate(app.settings.viewStates.detail);
            };

            locationSummary.style.cursor = 'pointer';

            const detailsSize = 100;

            locationSummary.style.height = `${detailsSize}px`;

            if(app.views.mapView.getBoundingClientRect().height === originalHeight){
                let newHeight = originalHeight - detailsSize;
                app.views.mapView.style.height = `${newHeight}px`;
            }

            let closeDiv = locationSummary.querySelector('#close');

            closeDiv.onclick = e => {
                e.stopPropagation();

                locationSummary.style.height = 0;
                app.views.mapView.style.height = `${originalHeight}px`;

                //Un-select location
                app.state.selectedPlace[0]
                    .marker.setIcon(mapView.createMarker(mapView.settings.images.place));
                app.state.selectedPlace.shift();
            };
        });
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

        window.map = new google.maps.Map(document.getElementById('googleMap'), options);

        app.state.bounds = new google.maps.LatLngBounds();

        let filterDiv = document.getElementById('mapFilter');
        let centerDiv = document.getElementById('mapCenter');

        new CenterControl(centerDiv);
        new FilterControl(filterDiv);

        window.originalHeight = (app.views.mapView) ? app.views.mapView.getBoundingClientRect().height: 0;
    }
};