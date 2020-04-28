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

                mapView.addMarker(map, { address: mapView.lastKnownLocation }, mapView.settings.images.currentLocation);
            }
        });

        //TODO: If there is only one entry, it returns an object (not an array)
        if(places && places.length){
            places.forEach((place) => {                
                if (place.address && place.address.lat && place.address.lng) {
                    mapView.addMarker(map, place, mapView.settings.images.place);
                }
            });
            
            mapView.addMarkerCluster();
            map.fitBounds(app.state.bounds);

            if(places.length == 1) {
                google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
                if (this.getZoom())
                   this.setZoom(mapView.settings.zoomLevel.city);
                });
            }
        }

        if(window.app.state.pendingMapFilter){
            const placesToHide = window.app.state.pendingMapFilter.placesToHide,
                placesToShow = window.app.state.pendingMapFilter.placesToShow;

            window.mapView.filter(placesToHide, placesToShow);
            window.app.state.pendingMapFilter = null;
        }
    },
    addMarkerCluster: () =>{
        const cloudImg = window.app.settings.cloudImg;
        if (!map) return;

        let clusterOptions = {
            gridSize: 53,
            styles: [
                {
                    textColor: 'white',
                    url: `${cloudImg.domain}${cloudImg.operations.width}/53/https://app.buildfire.com/app/media/google_marker_blue_icon2.png`,
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
    filter: (placesToHide, placesToShow) => {
        placesToHide.forEach((placeToHide) => {
            app.state.markers.forEach((marker) =>{
                const isMatch  = placeToHide.id === marker.markerData.id;

                if(isMatch){
                    marker.setVisible(false);
                    mapView.settings.markerClusterer.removeMarker(marker)
                }
            });
        });

        placesToShow.forEach((placeToShow) =>{
            app.state.markers.forEach((marker) =>{
                const isMatch  = placeToShow.id === marker.markerData.id;

                if(isMatch){
                    marker.setVisible(true);
                    mapView.settings.markerClusterer.addMarker(marker)
                }

            });
        });

    },
    centerMap: () => { window.map.setCenter(mapView.lastKnownLocation) },
    addMarker: (map, place, iconType) => {
        let marker = new google.maps.Marker({
            position: place.address,
            markerData: place,
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
        let categories = [];
        if (place.hasOwnProperty('categories')) place.categories.map(item => {
            categories.push(app.state.categories.filter(category => category.name.id === item).map(c => c.name.name))
        })
        if(!place.image) {
            let cloudImg = window.app.settings.cloudImg;
            place.image = `${cloudImg.domain}${cloudImg.operations.cdn}/https://pluginserver.buildfire.com/styles/media/holder-16x9.png`;
        }
        let context = {
            title: place.title,
            address: place.address.name,
            categories: categories,
            distance: place.distance,
            image: place.image
        };

        let req = new XMLHttpRequest();
        req.open('GET', './templates/locationSummary.hbs');
        req.send();
        req.onload = () => {
            let theTemplate = Handlebars.compile(req.responseText);

            // Pass our data to the template
            let theCompiledHtml = theTemplate(context);

            // Add the compiled html to the page
            let locationSummary = document.getElementById('locationSummary');
            locationSummary.innerHTML = theCompiledHtml;
            locationSummary.className = 'animated slideInDown';

            locationSummary.onclick = e => {
                e.preventDefault();
                router.navigate(app.settings.viewStates.detail);
            };

            let closeDiv = locationSummary.querySelector('#close');

            closeDiv.onclick = e => {
                e.stopPropagation();

                locationSummary.innerHTML = '';
                locationSummary.className = 'slideUp';


                //Un-select location
                app.state.selectedPlace[0]
                    .marker.setIcon(mapView.createMarker(mapView.settings.images.place));
                app.state.selectedPlace.shift();
            };
        };
    },
    createMarker:(imageType) => {
        const cloudImg = window.app.settings.cloudImg;
        const iconBaseUrl = 'https://app.buildfire.com/app/media/';

        return {
            url: `${cloudImg.domain}${cloudImg.operations.cdn}/${iconBaseUrl}${imageType}`,
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

        let pointsOfInterest = window.app.state.pointsOfInterest;
        
        let options = {
            minZoom: 3,
            maxZoom: 22,
            gestureHandling: 'greedy',
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoom: zoomTo,
            center: centerOn,
            mapTypeId: mapTypeId,
            zoomControlOptions: {
                position: zoomPosition
            },
            styles: [
                {
                  featureType: "poi.business",
                  elementType: "labels",
                  stylers: [
                    {
                      visibility: pointsOfInterest
                    }
                  ]
                }
            ],
            restriction: {
                latLngBounds: {
                    east: 180,
                    north: 85.050,
                    south: -85.050,
                    west: -180
                },
                strictBounds: true
            },
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
