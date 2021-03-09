import Navigo from 'navigo';

/**
 * Loads an html template from the target url and renders it inside
 * a container identified by an 'id'
 *
 * @param   {String} url Template target url
 * @param   {String} id  Container element's id
 * @returns {Promise}
 */
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

/**
 * Handles loading a controller
 *
 * @param   {Function} initFunction Controller function
 * @param   {Object} data         Initialization data for controller
 */
function loadControl(initFunction, data){
    let view = document.getElementById('view');
    view.className = 'transition';

    initFunction(data);
    view.className = 'fade';
}

/**
 * Initialize the map controller
 *
 * @param   {Object}  places   Places data
 * @param   {Boolean} isActive Wether the map is active or not
 */
window.initMap = function(places, isActive, noHistoryTrack){
    if(isActive) {
        app.state.activeView = 'mapView';
        app.views[app.state.activeView].style.display = 'block';

        if(!noHistoryTrack)
            app.state.navHistory.push(app.settings.viewStates.map);
    }

    loadHTML('./map.html', 'mapView').then(() => {
        loadControl(mapView.initMap, places);
        app.state.mapInitiated = true;

        loadMap();
    });
};

/**
 * Initialize the list controller
 *
 * @param   {Object}  places   Places data
 * @param   {Boolean} isActive Wether the list is active or not
 */
window.initList = function(places, isActive){
    if(isActive){
        app.state.activeView = 'listView';
        app.views[app.state.activeView ].style.display = 'block';
        app.state.navHistory.push(app.settings.viewStates.list);
    }

    loadHTML('./list.html', 'listView')
        .then(() => loadControl(listView.initList, places));
};

window.loadMap = function() {
    updateView('mapView');
};

window.loadList = function(){
    updateView('listView');
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
    if (place) loadHTML('./detail.html', 'detailView').then(() => loadControl(detailView.init, place));
}

// use #! to hash
window.initRouter = function() {
    window.router = new Navigo(null, true);
    router.on({
        'map': () => {
            if(app.state.mapInitiated){
                loadMap(app.state.filteredPlaces);
            }
            else{
                initMap(app.state.places, true, true);
            }

            app.state.mode = app.settings.viewStates.map;

            if (!app.state.isBackNav) {
                var lastView = app.state.navHistory.slice(-1)[0];
                if (lastView === 'map' || lastView === 'list') {
                    app.state.navHistory[app.state.navHistory.length - 1] = app.settings.viewStates.map;
                }
            }
            window.app.state.isBackNav = false;
        },
        'list': () => {
            loadList(app.state.filteredPlaces);
            app.state.mode = app.settings.viewStates.list;

            if (!app.state.isBackNav) {
                var lastView = app.state.navHistory.slice(-1)[0];
                if (lastView === 'map' || lastView === 'list') {
                    app.state.navHistory[app.state.navHistory.length - 1] = app.settings.viewStates.list;
                }
            }
            window.app.state.isBackNav = false;
            window.buildfire.appearance.titlebar.show();
        },
        'detail': () => {
            loadDetail(app.state.selectedPlace[0] ? app.state.selectedPlace[0] : app.state.places[0]);
            app.state.mode = app.settings.viewStates.detail;

            if (!app.state.isBackNav) {
                var lastView = app.state.navHistory.slice(-1)[0];
                if (lastView) {
                    window.buildfire.history.push('Detail', { showLabelInTitlebar: false });
                }
                app.state.navHistory.push(app.settings.viewStates.detail);
            }
                

            window.app.state.isBackNav = false;
            window.buildfire.appearance.titlebar.show();
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
};
