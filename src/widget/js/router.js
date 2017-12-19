import LazyLoad from 'vanilla-lazyload';
import Navigo from 'navigo';

// asyncrhonously fetch the html template partial from the file directory,
// then set its contents to the html of the parent element
function loadHTML(url, id) {
    return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.open('GET', url);
        req.send();
        req.onload = () => {
            let elem = document.getElementById(id);
            elem.innerHTML = req.responseText;
            resolve();
        };
        req.onerror = (err) => {
            reject(err);
        };
    });
}

function loadControl(initFunction, data){
    let view = document.getElementById('view');
    view.className = 'transition';

    //Provide a delay to let the template load first
    setTimeout( function(){
        initFunction(data);
        view.className = 'fade';
        window.app.state.isBackNav = false;
    }, 250);
}

window.initMap = function(places, isActive){
    if(isActive){
        app.state.activeView = 'mapView';
        app.views[app.state.activeView].style.display = 'block';
        app.state.navHistory.push(app.settings.viewStates.map);
    }

    loadHTML('./map.html', 'mapView');
    loadControl(mapView.initMap, places);
    app.state.mapInitiated = true;

    loadMap();
};

window.initList = function(places, isActive){
    if(isActive){
        app.state.activeView = 'listView';
        app.views[app.state.activeView ].style.display = 'block';
        app.state.navHistory.push(app.settings.viewStates.list);
    }

    loadHTML('./list.html', 'listView');
    loadControl(listView.initList, places);
};

window.loadMap = function(){
    updateView('mapView');
};

window.loadList = function(){
    updateView('listView');
    new LazyLoad({
        container: document.getElementById('view')
    });
};

function updateView(activeView){
    let view = document.getElementById('view');
    view.className = 'transition';

    app.state.activeView = activeView;
    app.views.mapView.style.display = 'none';
    app.views.listView.style.display = 'none';
    app.views.detailView.style.display = 'none';

    app.views[activeView].style.display = 'block';

    setTimeout(() => view.className = 'fade', 150);
}

function loadDetail(place){
    app.views.mapView.style.display = 'none';
    app.views.listView.style.display = 'none';
    app.views.detailView.style.display = 'block';
    loadHTML('./detail.html', 'detailView');
    loadControl(detailView.init, place);
}

// use #! to hash
window.router = new Navigo(null, true);
router.on({
    'map': () => {
        if(app.state.mapInitiated){
            loadMap(app.state.filteredPlaces);
        }
        else{
            initMap(app.state.places, true);
        }

        app.state.mode = app.settings.viewStates.map;

        if(!app.state.isBackNav)
            app.state.navHistory.push(app.settings.viewStates.map);
    },
    'list': () => {
        loadList(app.state.filteredPlaces);
        new LazyLoad();
        app.state.mode = app.settings.viewStates.list;

        if(!app.state.isBackNav)
            app.state.navHistory.push(app.settings.viewStates.list);
    },
    'detail': () => {
        console.log('app.state.selectedPlace', app.state.selectedPlace[0]);

        loadDetail(app.state.selectedPlace[0]);
        app.state.mode = app.settings.viewStates.detail;

        if(!app.state.isBackNav)
            app.state.navHistory.push(app.settings.viewStates.detail);
    },
});

// set the default route
router.on(() => {

});

// set the 404 route
router.notFound((query) => {
    document.getElementById('view').innerHTML = '<h3>Invalid Route</h3>';
});

router.resolve();
