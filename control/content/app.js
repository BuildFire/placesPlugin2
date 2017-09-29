var myapp = angular.module('places2Controller', ['ui.sortable']);


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
});