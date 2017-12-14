import buildfire from 'buildfire';
import {filter, find} from 'lodash';
import "./lib/markercluster.js";

import "./filterControl.js";
import "./map.js";
import "./list.js";
import "./detail.js";
import "./router.js";
import PlacesSort from "./PlacesSort.js";

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
        places: [],
        markers: [],
        bounds: null,
        filteredPlaces: [],
        selectedPlace: [],
        sortBy: null,
        categories: null,
        navHistory: [],
        isBackNav: false
    },
    backButtonInit: () => {
        window.app.goBack = window.buildfire.navigation.onBackButtonClick;

        buildfire.navigation.onBackButtonClick = function() {
            if (window.app.state.navHistory.length > 0) {

                //Don't navigate to the current state (may occur when using back button)
                if(window.app.state.mode === window.app.state.navHistory[window.app.state.navHistory.length-1])
                    window.app.state.navHistory.pop();

                //Get previous state
                let lastNavState = window.app.state.navHistory.pop();

                window.app.state.isBackNav = true;

                window.router.navigate(lastNavState);
            }
            else{
                window.app.goBack();
            }
        };
    },
    init: (placesCallback, positionCallback) => {

        window.app.backButtonInit();

        buildfire.datastore.get (window.app.settings.placesTag, function(err, results){
            if(err){
              console.error('datastore.get error', err);
              return;
            }

            let places,
                data = results.data;

            if(data && data.places){
              if(window.app.state.categories){
                window.app.state.categories = data.categories.map(category => {
                    return {name: category, isActive: true};
                });
              }

              window.app.state.mode = data.defaultView;

              let sortBy = PlacesSort[data.sortBy];
              places = data.places.sort(sortBy);
              window.app.state.places = places;
              window.app.state.filteredPlaces = places;
              window.app.state.sortBy = data.sortBy;
              window.app.state.defaultView = data.defaultView;
              window.app.state.categories = data.categories;
            }

            placesCallback(null, places);
        });

        console.log('Calling getCurrentPosition');

        buildfire.geo.getCurrentPosition({}, (err, position) => {
            console.log('getCurrentPosition result', err, position);
            if(err){
                console.error('getCurrentPosition', err);
                return;
            }

            if(position && position.coords){
                positionCallback(null, position.coords);
            }
        });

        buildfire.datastore.onUpdate(function(event) {
          if(event.tag === window.app.settings.placesTag){

              console.log('Got update');

              let currentPlaces = window.app.state.places;
              let newPlaces = event.data.places;
              let currentSortOrder = window.app.state.sortBy;
              let newSortOrder = event.data.sortBy;
              let newViewState = event.data.defaultView;
              let currentDefaultView = window.app.state.defaultView;
              let newDefaultView = event.data.defaultView;

              /**
               * SORT ORDER
               */
              if(currentSortOrder != newSortOrder){
                  window.app.state.sortBy = newSortOrder;
                  let sortBy = PlacesSort[window.app.state.sortBy];
                  window.app.state.places.sort(sortBy);

                  if(window.app.state.mode === window.app.settings.viewStates.list)
                    window.loadList(window.app.state.places);

                  return;
              }

              let defaultViewChanged = currentDefaultView !== newDefaultView;
              let notInDefaultView = newDefaultView !== window.app.state.mode;

              // We want to update the widget to reflect the new default view if the setting
              // was changed and the user is not in that view already
              if (defaultViewChanged && notInDefaultView) {
                window.router.navigate(newViewState);
                window.app.state.mode = newViewState;
                return;
              }

              //Do comparison to see what's changed
              let updatedPlaces = filter(newPlaces, (newPlace) => { return !find(currentPlaces, newPlace)});

              if(window.app.state.mode === window.app.settings.viewStates.map){
                  window.mapView.updateMap(updatedPlaces);
              }else{
                  //Load new items
                  window.listView.updateList(updatedPlaces);
              }
          }
        });
    },
    gotPieceOfData() {
      if (window.app.state.places && window.app.state.location) {
        let { location } = window.app.state;
        let destinations = [];

        window.app.state.places.forEach(place => {
          destinations.push(new window.google.maps.LatLng(place.address.lat, place.address.lng));
        });

        let origin = [{lat: location.latitude, lng: location.longitude}];

        let service = new window.google.maps.DistanceMatrixService();

        service.getDistanceMatrix({
            origins: origin,
            destinations: destinations,
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.IMPERIAL //google.maps.UnitSystem.METRIC
        }, (response) => {
            //Update places with distance
            window.app.state.places.map((place, index)=>{
                place.distance =  response.rows[0].elements[index].distance.text;
            });

            if(window.app.state.mode == window.app.settings.viewStates.list){
                window.listView.updateDistances(window.app.state.filteredPlaces);
            }
        });
      }
    },
    gotPlaces(err, places) {
        if(window.app.state.mode === window.app.settings.viewStates.list){
            window.initList(places, true);
            //We can not pre-init the map, as it needs to be visible
        }
        else{
            window.initMap(places, true);
            window.initList(places);
        }
        window.app.gotPieceOfData();
    },

    gotLocation(err, location) {
        window.app.state.location = location;
        window.app.gotPieceOfData();
    }
};

document.addEventListener('DOMContentLoaded', () => window.app.init( window.app.gotPlaces, window.app.gotLocation));
//setTimeout(app.init(app.gotPlaces, app.gotLocation), 250);
