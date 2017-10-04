// getElementById wrapper
function $id(id) {
    return document.getElementById(id);
}

// asyncrhonously fetch the html template partial from the file directory,
// then set its contents to the html of the parent element
function loadHTML(url, id) {
    req = new XMLHttpRequest();
    req.open('GET', url);
    req.send();
    req.onload = () => {
        $id(id).innerHTML = req.responseText;
    }
}

//Provide a delay to let the template load first
function loadControl(initFunction){
    setTimeout( function(){ initFunction()}, 500)
}


function loadMap(){
    loadHTML('./map.html', 'view');  loadControl(mapView.initMap)
}

function loadList(){
    loadHTML('./list.html', 'view'); loadControl(listView.initList)
}

// use #! to hash
router = new Navigo(null, true);
router.on({
    // 'view' is the id of the div element inside which we render the HTML
    'map': () => { loadMap() },
    'list': () => { loadList() },
});

// set the default route
router.on(() => {
    app.init();

    if(app.settings.mode == 'list'){
        loadList()
    }
    else{
        loadMap();
    }
});

// set the 404 route
router.notFound((query) => { $id('view').innerHTML = '<h3>Couldn\'t find the page you\'re looking for...</h3>'; })

router.resolve();