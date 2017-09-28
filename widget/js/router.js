// getElementById wrapper
function $id(id) {
    return document.getElementById(id);
}

// asyncrhonously fetch the html template partial from the file directory,
// then set its contents to the html of the parent element
function loadHTML(url, id) {
    console.error(url);

    req = new XMLHttpRequest();
    req.open('GET', url);
    req.send();
    req.onload = () => {
        $id(id).innerHTML = req.responseText;
    }
}

//Provide a delay to let the template load
function loadView(initFunction){
    setTimeout( function(){ initFunction()}, 200)
}

// use #! to hash
router = new Navigo(null, true);
router.on({
    // 'view' is the id of the div element inside which we render the HTML
    'map': () => { loadHTML('./map.html', 'view');  loadView(initMap) },
    'list': () => { loadHTML('./list.html', 'view'); loadView(initList) },
});

// set the default route
router.on(() => { loadHTML('./map.html', 'view'); setTimeout( function(){ initMap()}, 200)});

// set the 404 route
router.notFound((query) => { $id('view').innerHTML = '<h3>Couldn\'t find the page you\'re looking for...</h3>'; })

router.resolve();