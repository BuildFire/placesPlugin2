import Navigo from "navigo"

const listViewDiv = document.getElementById("listViewB");
const mapViewDiv = document.getElementById("mapViewB");
let activeView = null;

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
    let view = document.getElementById("view");
    view.className = 'transition';
    
    setTimeout( function(){
        initFunction(data);
        view.className = 'fade';
        app.state.isBackNav = false;
    }, 250)
}

window.initMap = function(places){
    activeView = 'mapViewB';
    loadHTML('./map.html', 'mapViewB');  loadControl(mapView.initMap, places);
};

window.loadMap = function(){
    activeView = 'mapViewB';
    listViewDiv.style.display = 'none';
    mapViewDiv.style.display = 'block';
};

window.initList = function(places){
    activeView = 'listViewB';
    loadHTML('./list.html', 'listViewB'); loadControl(listView.initList, places);

};

window.loadList = function(){
    activeView = 'listViewB';
    mapViewDiv.style.display = 'none';
    listViewDiv.style.display = 'block';
};

function loadDetail(place){
    loadHTML('./detail.html', 'view'); loadControl(detailView.init, place)
}

// use #! to hash
window.router = new Navigo(null, true);
router.on({
    // 'view' is the id of the div element inside which we render the HTML
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