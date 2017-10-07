let sort = {
    alphabetical: (a, b) => {
        if(a.title < b.title)
            return -1;
        if(a.title > b.title)
            return 1;

        return 0;
    },
    reverseAlphabetical: (a, b) => {
        if(a.title > b.title)
            return -1;
        if(a.title < b.title)
            return 1;

        return 0;
    },
    manual: (a, b) => {
        if(a.sort < b.sort)
            return -1;
        if(a.sort > b.sort)
            return 1;

        return 0;
    }
};

let app = {
    settings: {
        viewStates: {map: 'map', list: 'list', detail: 'detail'},
        placesTag: 'places',
    },
    state: {
        mode: null,
        places: null,
        selectedPlace: null,
    },
    init: (placesCallback, positionCallback) => {

        // TODO: Get from cache. If cache not present, get from dataStore. Save in cache for next time.
        //Set default state
        app.state.mode = app.settings.viewStates.list;

        buildfire.datastore.get (app.settings.placesTag, function(err, results){
            if(err){
              console.error('datastore.get error', err);
              return;
            }

            let places,
                data = results.data;

            if(data && data.places){
                app.state.mode = data.defaultView;
                console.error(data);

                let sortBy = sort[data.sortBy];
                places = data.places.sort(sortBy);
                app.state.places = places;
            }

            placesCallback(null, places);
        });

        buildfire.geo.getCurrentPosition({}, (err, position) => {
            if(!err && position && position.coords){
                positionCallback(null, position.coords);
            }
        });

        buildfire.datastore.onUpdate(function(event) {
          if(event.tag === app.settings.placesTag){
              let currentPlaces = app.state.places;
              let newPlaces = event.data.places;
              let currentViewState = app.state.mode;
              let newViewState = event.data.defaultView;

              if(currentViewState != newViewState){
                  app.state.mode = newViewState;
                  router.navigate(newViewState);
                  return;
              }

              //TODO: Add unique ID, to detect new item from change
              //Do comparison to see what's changed
              let updatedPlaces = _.filter(newPlaces, function(obj){ return !_.find(currentPlaces, obj); });

              //console.error('updatedPlaces', updatedPlaces);

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