let sort = {
    alpha: (a, b) => {
        if(a.title < b.title)
            return -1;
        if(a.title > b.title)
            return 1;

        return 0;
    },
    alphaDesc: (a, b) => {
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
        sortOptions: {alpha: 'alpha', alphaDesc: 'alphaDesc', manual: 'manual'},
        placesTag: 'places',
    },
    state: {
        mode: null,
        places: null,
        selectedPlace: null,
        sortBy: null,
        categories: null,
    },
    init: (placesCallback, positionCallback) => {

        // TODO: Get from cache. If cache not present, get from dataStore. Save in cache for next time.
        //Set default state
        app.state.mode = app.settings.viewStates.list;
        app.state.sortBy = app.settings.sortOptions.manual;

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
                //TODO: Change state.categories to have name and isShown boolean

                app.state.mode = data.defaultView;

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

              console.error('Got update');

              let currentPlaces = app.state.places;
              let newPlaces = event.data.places;
              let currentSortOrder = app.state.sortBy;
              let newSortOrder = event.data.sortBy;
              let currentViewState = app.state.mode;
              let newViewState = event.data.defaultView;

              if(currentSortOrder != newSortOrder){
                  app.state.sortBy = newSortOrder;
                  let sortBy = sort[app.state.sortBy];
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
              let updatedPlaces = _.filter(newPlaces, function(obj){ return !_.find(currentPlaces, obj); });

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