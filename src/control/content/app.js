var myapp = angular.module('places2Controller', ['ui.sortable']);

myapp.controller('contentController', function ($scope) {
    let placesTag = 'places', placesId;
    $scope.list = [];
    $scope.sortBy = 'manual';
    $scope.defaultView = 'map';
    $scope.categories = ['restaurant', 'park', 'site'];

    buildfire.datastore.get (placesTag, function(err, result){
        if(err){
            console.error('datastore.get error', err);
            return;
        }

        placesId = result.id;

        $scope.list = result.data.places;
        $scope.$apply()
    });

    let saveChanges = function(data){
        //Update the sort order to reflect the physical order
        data.places.forEach(function(place, index){
            place.sort = index;

            /* Mock categories until the UI is built
            if(index % 2 === 0){
                place.categories = ['restaurant']
            }else
            {
                place.categories = ['park']
            }

            if(index % 3 === 0){
                place.categories.push('site');
            }*/

        });

        console.error('saving data', data);

        buildfire.datastore.save(data, placesTag, function(err){
            if(err){
                console.error(err);
                return;
            }
        });
    };

    $scope.changeDefaultView = function(){
        processChanges();
    };

    $scope.changeSortOrder = function(){
        processChanges();
    };

    let processChanges = function(){
        let places = angular.copy($scope.list);
        let sortBy = angular.copy($scope.sortBy);
        let categories = angular.copy($scope.categories);
        let defaultView = angular.copy($scope.defaultView);

        saveChanges({places, sortBy, categories, defaultView});
    };

    $scope.sortableOptions = {
        update: function() {

            //Due to buggy nature of "sortable module", a delay is required
            setTimeout(function(){
                processChanges();
            }, 200);
        }
    };

    let input = document.getElementById('pac-input');
    let autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace(),
            address = place.formatted_address,
            geometry = place.geometry,
            coordinates,
            location;

        if (geometry) {
            coordinates = {lng: geometry.location.lng(), lat: geometry.location.lat()};

            location = {title: $scope.title, address: {name: address, lat: coordinates.lat, lng: coordinates.lng}};

            if($scope.list){
                $scope.list.push(location);
            }else{
                $scope.list = [location];
            }

            $scope.title = '';
            $scope.location = '';
            $scope.$apply();

            let places = angular.copy($scope.list);
            let sortBy = angular.copy($scope.sortBy);
            saveChanges(places, sortBy);
        }else{
            //TODO: Handle manually entered lat/lng coordinates

            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            //window.alert("No details available for input: '" + place.name + "'");
            return;
        }
    });
});