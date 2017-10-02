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

buildfire.datastore.get (placesTag, function(err, results){
    if(err){
        console.error('datastore.get error', err);
        return;
    }

    let data = results.data;

    if(data){
        let sortBy = sort[data.sortBy];
        places = data.places.sort(sortBy);

        console.error('places', places);
    }


    //If we add here, we need to ensure the map is ready

    /*
    places.forEach((place) => {
        addMarker(map, place.address, 'google_marker_red_icon.png');
    });
    */
});