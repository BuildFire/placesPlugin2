let placesTag = 'places';
let places;

buildfire.datastore.get (placesTag, function(err, results){
    if(err){
        console.error('datastore.get error', err);
        return;
    }

    places = results.data;
    console.error('Places ', results.data);
});