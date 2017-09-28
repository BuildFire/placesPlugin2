let placesTag = 'places',
    mode = 'map',
    places;

buildfire.datastore.get (placesTag, function(err, results){
    if(err){
        console.error('datastore.get error', err);
        return;
    }

    places = results.data;

    //TODO: Trigger event to indicate ready state

    console.error('Places ', results.data);
});