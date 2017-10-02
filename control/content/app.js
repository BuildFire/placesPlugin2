var myapp = angular.module('places2Controller', ['ui.sortable']);

let placesTag = 'places';

myapp.controller('contentController', function ($scope) {
    let placesTag = 'places';
    $scope.list = [];

    buildfire.datastore.get (placesTag, function(err, result){
        if(err){
            console.error('datastore.get error', err);
            return;
        }

        $scope.list = result.data;
        $scope.$apply()
    });

    $scope.sortableOptions = {
        update: function() {
            console.error('update');
        }
    };

    var input = document.getElementById('pac-input');
    var autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace(),
            address = place.formatted_address,
            geometry = place.geometry,
            coordinates,
            location;

        if (geometry) {
            coordinates = {lng: geometry.location.lng(), lat: geometry.location.lat()};

            location = {title: $scope.title, address: {name: address, lat: coordinates.lat, lng: coordinates.lng}};

            $scope.list.push(location);
            $scope.title = '';
            $scope.location = '';
            $scope.$apply();

            buildfire.datastore.save($scope.list, placesTag, function(err){
                if(err){
                    console.error(err);
                }
            });
        }else{
            //TODO: Handle manually entered lat/lng coordinates

            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            //window.alert("No details available for input: '" + place.name + "'");
            return;
        }


    });

    //This is just for testing
    $scope.addData = function(){
        console.error('add data');
        var mockData = [
            {title: 'Extra-ordinary desserts',
                address: {name:'1430 Union St, San Diego, CA 92101', lat:32.720285, lng:-117.165927}},
            {title: 'Ballast Point Brewing',
                address: {name:'2215 India St, San Diego, CA 92101', lat:32.727669, lng:-117.169695}},
            {title: 'Cafe Italia',
                address: {name: '1704 India St, San Diego, CA 92101', lat:32.723331, lng:-117.168570}}
        ];

        buildfire.datastore.save(mockData, placesTag, function(err){
            if(err){
                console.error('datastore.save error', err);
                return;
            }

            $scope.$apply();
        });
    }
});