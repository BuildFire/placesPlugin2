let placesTag = 'places',
    mode = 'map',
    map,
    places;

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

function initApp() {
    buildfire.datastore.get (placesTag, function(err, results){
        if(err){
            console.error('datastore.get error', err);
            return;
        }

        let data = results.data;

        if(data && data.places){
            let sortBy = sort[data.sortBy];
            places = data.places.sort(sortBy);

            console.error('places', places);
        }
    });

    buildfire.datastore.onUpdate(function(event) {
        //This isn't triggering
        if(event.tag === placesTag){
            let currentPlaces = places;

            places = event.data.places;

            //console.error('currentPlaces', currentPlaces);
            //console.error('newPlaces', places);

            //TODO: Add unique ID, to detect new item from change

            //Do comparison to see what's changed
            let updatedPlaces= _.filter(places, function(obj){ return !_.find(currentPlaces, obj); });

            console.error('updatedPlaces', updatedPlaces);

            if(mode === 'map'){
                updateMap(updatedPlaces);
            }else{
                //Load new items
                listView.updateList(updatedPlaces);
            }
        }
    });
}

initApp();
