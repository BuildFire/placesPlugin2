import {filter, find} from 'lodash'
import "./lib/markercluster.js"

import "./filterControl.js"
import "./map.js"
import "./list.js"
import "./detail.js"
import "./router.js"
import PlacesSort from "./PlacesSort.js"

window.app = {
    goBack: null,
    settings: {
        viewStates: {map: 'map', list: 'list', detail: 'detail'},
        sortOptions: {alpha: 'alpha', alphaDesc: 'alphaDesc', manual: 'manual'},
        placesTag: 'places',
    },
    views: {
        listView: document.getElementById('listView'),
        mapView: document.getElementById('mapView'),
        detailView: document.getElementById('detailView'),
        sideNav: document.getElementById('sideNav'),
    },
    state: {
        mapInitiated: false,
        mode: null,
        activeView: null,
        places: null,
        markers: [],
        bounds: null,
        filteredPlaces: null,
        selectedPlace: [],
        sortBy: null,
        categories: null,
        navHistory: [],
        isBackNav: false
    },
    backButtonInit: () => {
        app.goBack = window.buildfire.navigation.onBackButtonClick;

        window.buildfire.navigation.onBackButtonClick = function(){
            if (app.state.navHistory.length > 0){

                //Don't navigate to the current state (may occur when using back button)
                if(app.state.mode === app.state.navHistory[app.state.navHistory.length-1])
                    app.state.navHistory.pop();

                //Get previous state
                let lastNavState = app.state.navHistory.pop();

                app.state.isBackNav = true;

                router.navigate(lastNavState);
            }
            else{
                app.goBack();
            }
        }
    },
    init: (placesCallback, positionCallback) => {

        app.backButtonInit();

        buildfire.datastore.get (app.settings.placesTag, function(err, results){
            if(err){
              console.error('datastore.get error', err);
              return;
            }

            let places,
                data = results.data;

            if(data && data.places){
                app.state.categories = data.categories.map(category => {
                    return {name: category, isActive: true};
                });

                app.state.mode = data.defaultView;

                let sortBy = PlacesSort[data.sortBy];
                places = data.places.sort(sortBy);
                app.state.places = places;
                app.state.filteredPlaces = places;
            }

            placesCallback(null, places);
        });

        console.log('Calling getCurrentPosition');

        buildfire.geo.getCurrentPosition({}, (err, position) => {
            console.log('getCurrentPosition result', err, position);
            if(err){
                console.error('getCurrentPosition', err);
                return
            }

            if(position && position.coords){
                positionCallback(null, position.coords);
            }
        });

        buildfire.datastore.onUpdate(function(event) {
          if(event.tag === app.settings.placesTag){

              console.log('Got update');

              let currentPlaces = app.state.places;
              let newPlaces = event.data.places;
              let currentSortOrder = app.state.sortBy;
              let newSortOrder = event.data.sortBy;
              let currentViewState = app.state.mode;
              let newViewState = event.data.defaultView;

              if(currentSortOrder != newSortOrder){
                  app.state.sortBy = newSortOrder;
                  let sortBy = PlacesSort[app.state.sortBy];
                  app.state.places.sort(sortBy);

                  if(app.state.mode === app.settings.viewStates.list)
                    loadList(app.state.places);

                  return;
              }

              if(currentViewState != newViewState){
                  app.state.mode = newViewState;
                  router.navigate(newViewState);
                  return;
              }

              //Do comparison to see what's changed
              let updatedPlaces = filter(newPlaces, (newPlace) => { return !find(currentPlaces, newPlace)});

              if(app.state.mode === app.settings.viewStates.map){
                  mapView.updateMap(updatedPlaces);
              }else{
                  //Load new items
                  listView.updateList(updatedPlaces);
              }
          }
        });
    },
    gotPlaces: (err, places) => {
        if(app.state.mode === app.settings.viewStates.list){
            initList(places, true);
            //We can not pre-init the map, as it needs to be visible
        }
        else{
            initMap(places, true);
            initList(places);
        }
    },
    gotLocation: (err, location) =>{
        //Calculate distances
        console.log('Got current location');

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
    }
};

document.addEventListener('DOMContentLoaded', () => { app.init( app.gotPlaces, app.gotLocation) });
//setTimeout(app.init(app.gotPlaces, app.gotLocation), 250);