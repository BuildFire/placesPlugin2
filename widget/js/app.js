let placesTag = 'places',
    mode = 'map',
    map,
    places;

buildfire.datastore.get (placesTag, function(err, results){
    if(err){
        console.error('datastore.get error', err);
        return;
    }

    places = results.data;

    //If we add here, we need to ensure the map is ready

    /*
    places.forEach((place) => {
        addMarker(map, place.address, 'google_marker_red_icon.png');
    });
    */
});