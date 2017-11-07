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
    state: {
        mode: null,
        places: null,
        markers: [],
        bounds: null,
        filteredPlaces: null,
        selectedPlace: null,
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

        // TODO: Get from cache. If cache not present, get from dataStore. Save in cache for next time.
        //Set default state
        app.state.mode = app.settings.viewStates.list;
        app.state.sortBy = app.settings.sortOptions.manual;

        buildfire.datastore.get (app.settings.placesTag, function(err, results){
            if(err){
              console.log('datastore.get error', err);
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

              //TODO: Add unique ID, to detect new item from change
              //Do comparison to see what's changed
              let updatedPlaces = filter(newPlaces, function(obj){ return !find(currentPlaces, obj); });

              if(app.state.mode === app.settings.viewStates.map){
                  mapView.updateMap(updatedPlaces);
              }else{
                  //Load new items
                  listView.updateList(updatedPlaces);
              }
          }
        });
    }
};