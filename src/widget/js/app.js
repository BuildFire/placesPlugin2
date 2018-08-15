import buildfire from 'buildfire';
import filter from 'lodash/filter';
import find from 'lodash/find';
import "./lib/markercluster.js";

import "../css/general.css";
import "../css/slider.css";
import "../css/quill.css";
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
        cloudImg: {
            domain:'https://czi3m2qn.cloudimg.io',
            operations: {
                cdn: '/cdn/n/n',
                width: '/s/width',
                crop: '/s/crop'
            }
        }
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
        actionItems: [],
        places: [],
        markers: [],
        bounds: null,
        filteredPlaces: [],
        selectedPlace: [],
        sortBy: null,
        categories: [],
        navHistory: [],
        isBackNav: false
    },
    backButtonInit: () => {
        window.app.goBack = window.buildfire.navigation.onBackButtonClick;

        buildfire.navigation.onBackButtonClick = function() {
            const isLauncher = window.location.href.includes('launcherPlugin');

            if (window.app.state.navHistory.length > 0) {

                //Remove the current state
                if(window.app.state.mode === window.app.state.navHistory[window.app.state.navHistory.length-1]){

                    //Don't remove last state, if launcher plugin
                    if(!isLauncher || window.app.state.navHistory.length != 1){
                        window.app.state.navHistory.pop();
                    }
                }

                //Navigate to the previous state
                let lastNavState = window.app.state.navHistory[window.app.state.navHistory.length-1];

                window.app.state.isBackNav = true;

                window.router.navigate(lastNavState);
            }
            else{
                window.app.goBack();
            }
        };
    },
    init: (placesCallback, positionCallback) => {
        window.buildfire.appearance.titlebar.show();

        window.app.backButtonInit();

        let oldPlaces = [], newPlaces = [];

        var loadCount = 0;
        function onChunkLoaded() {
          loadCount += 1;
          if (loadCount === 2) {
            let places = oldPlaces.concat(newPlaces);
            window.app.state.places.push(...places);
            window.app.state.filteredPlaces.push(...places);
            placesCallback(null, places);
          }
        }

        function getPlacesList() {
          const pageSize = 50;
          let page = 0;

          const loadPage = () => {
            buildfire.datastore.search({
              page,
              pageSize,
              sort: (window.app.state.sortBy ? ({
                title: (window.app.state.sortBy === 'alphaDesc' ? -1 : 1)
              }) : null)
            }, 'places-list', (err, result) => {
              console.log('search', { err, result });

              if (err) {
                onChunkLoaded();
                return console.error(err);
              }
              const places = [];

              places.push(...result.map(place => {
                place.data.sort = window.app.state.itemsOrder.indexOf(place.id);
                place.data.id = place.id;
                return place.data;
              }));

              console.log('loaded page', page, { result });

              // This is the first page so we initialize
              if (result && page === 0) {
                newPlaces.push(...places);
                onChunkLoaded();

              // This is an additional page so we only push new data
              } else {
                window.app.state.places.push(...places);
                window.app.state.filteredPlaces.push(...places);

                if (window.app.state.mapInitiated) {
                  window.mapView.updateMap(places);
                }

                window.listView.updateList(places);
              }

              // If we have more pages we keep going
              if (result.length === pageSize) {
                page++;
                console.log('loading page', page);
                loadPage();
              }
            });
          };

          loadPage();
        }

        buildfire.datastore.get(window.app.settings.placesTag, function(err, results){
          if (err) {
            console.error('datastore.get error', err);
            return;
          }

          let data = results.data;

          if (data) {
            oldPlaces = data.places || [];
            window.app.state.mode = data.defaultView;
            window.app.state.sortBy = data.sortBy;
            window.app.state.itemsOrder = data.itemsOrder;
            window.app.state.actionItems = data.actionItems || [];
            window.app.state.defaultView = data.defaultView;

            if (data.categories) {
              window.app.state.categories = data.categories.map(category => {
                  return { name: category, isActive: true };
              });
            }
          }

          getPlacesList();
          onChunkLoaded();
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
          console.log('Got update');
          location.reload(); // TEMPORARY SOLUTION FOR THE DEMO

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
        });
    },
    gotPieceOfData() {
      if (window.app.state.places && window.app.state.location) {
        let { location } = window.app.state;
        let destinations = [];

        window.app.state.places.forEach(place => {
          destinations.push(new window.google.maps.LatLng(place.address.lat, place.address.lng));
        });

        let origin = {latitude: location.latitude, longitude: location.longitude};

        destinations.forEach((item, index) => {
          var destination = { latitude: item.lat(), longitude: item.lng() };
          var distance = buildfire.geo.calculateDistance(origin, destination);
          window.app.state.places[index].distance = Math.ceil(distance).toLocaleString() + ' mi';
        });

        window.listView.updateDistances(window.app.state.filteredPlaces);
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

//document.aEventListener('DOMContentLoaded', () => window.app.init( window.app.gotPlaces, window.app.gotLocation));
app.init(app.gotPlaces, app.gotLocation);
window.initRouter();
