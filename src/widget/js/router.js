import Navigo from "navigo"

// getElementById wrapper
function $id(id) {
    return document.getElementById(id);
}

// asyncrhonously fetch the html template partial from the file directory,
// then set its contents to the html of the parent element
function loadHTML(url, id) {
    let req = new XMLHttpRequest();
    req.open('GET', url);
    req.send();
    req.onload = () => {
        $id(id).innerHTML = req.responseText;
    }
}

//Provide a delay to let the template load first
function loadControl(initFunction, data){
    //let view = document.getElementById('view');
    //view.className = 'transition';

    setTimeout( function(){
        initFunction(data);
        //view.className = 'fade';
        app.state.isBackNav = false;
    }, 250)
}

window.initMap = function(places, isActive){
    if(isActive){
        app.views.activeView = 'mapView';
        app.views[app.views.activeView].style.display = 'block';
    }

    loadHTML('./map.html', 'mapView');  loadControl(mapView.initMap, places);
};

window.loadMap = function(){
    app.views.activeView = 'mapView';
    app.views.listView.style.display = 'none';
    app.views.mapView.style.display = 'block';
    app.views.detailView.style.display = 'none';
};

window.initList = function(places, isActive){
    if(isActive){
        app.views.activeView = 'listView';
        app.views[app.views.activeView ].style.display = 'block';
    }

    loadHTML('./list.html', 'listView'); loadControl(listView.initList, places);
};

window.loadList = function(){
    app.views.activeView = 'listView';
    app.views.mapView.style.display = 'none';
    app.views.listView.style.display = 'block';
    app.views.detailView.style.display = 'none';
};

function loadDetail(place){
    app.views.mapView.style.display = 'none';
    app.views.listView.style.display = 'none';
    app.views.detailView.style.display = 'block';
    loadHTML('./detail.html', 'detailView'); loadControl(detailView.init, place)
}

// use #! to hash
window.router = new Navigo(null, true);
router.on({
    'map': () => {
        loadMap(app.state.filteredPlaces);
        app.state.mode = app.settings.viewStates.map;

        if(!app.state.isBackNav)
            app.state.navHistory.push(app.settings.viewStates.map)
    },
    'list': () => {
        loadList(app.state.filteredPlaces);
        app.state.mode = app.settings.viewStates.list;

        if(!app.state.isBackNav)
            app.state.navHistory.push(app.settings.viewStates.list)
    },
    'detail': () => {
        console.error('app.state.selectedPlace', app.state.selectedPlace[0]);

        loadDetail(app.state.selectedPlace[0]);
        app.state.mode = app.settings.viewStates.detail;

        if(!app.state.isBackNav)
            app.state.navHistory.push(app.settings.viewStates.detail)
    },
});

// set the default route
router.on(() => {

});

// set the 404 route
router.notFound((query) => { $id('view').innerHTML = '<h3>Invalid Route</h3>'; })

router.resolve();