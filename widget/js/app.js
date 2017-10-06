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
        state: {map: 'map', list: 'list'},
        placesTag: 'places',
        mode: null
    },
    places: null,
    init: (placesCallback, positionCallback) => {

        // TODO: Get from cache. If cache not present, get from dataStore. Save in cache for next time.
        //Set default state
        app.settings.mode = app.settings.state.list;

        buildfire.datastore.get (app.settings.placesTag, function(err, results){
            if(err){
              console.error('datastore.get error', err);
              return;
            }

            let places,
                data = results.data;

            if(data && data.places){
              let sortBy = sort[data.sortBy];
              places = data.places.sort(sortBy);
              app.places = places;
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
              let currentPlaces = app.places;

              let places = event.data.places;

              //TODO: Add unique ID, to detect new item from change

              //Do comparison to see what's changed
              let updatedPlaces= _.filter(places, function(obj){ return !_.find(currentPlaces, obj); });

              console.error('updatedPlaces', updatedPlaces);

              if(app.settings.mode === app.settings.state.map){
                  mapView.updateMap(updatedPlaces);
              }else{
                  //Load new items
                  listView.updateList(updatedPlaces);
              }
          }
        });
    }
};