let map,
    mode = 'list',
    usa = {lat: 37.09024, lng: -95.712891},
    zoomLevel = {city: 14, country: 3},
    defaultLocation = usa,
    lastKnownLocation = defaultLocation;

let filter = () => {document.getElementById("mySidenav").style.height = "100%";};
let changeView = () => {
    //let image= document.getElementById('list');
    //image.src  = (mode == 'list')? './images/map.svg' : './images/list.svg';
    //mode = (mode == 'list')? 'map' : 'list';
    router.navigate('/list');
};
let centerMap = () => {map.setCenter(lastKnownLocation);};

closeNav = () => document.getElementById("mySidenav").style.height = "0";

function createControl(controlDiv, buttons){
    let container = document.createElement('div');
    container.className = 'buttonContainer';

    controlDiv.appendChild(container);

    buttons.forEach((button) =>{
        let controlButton = document.createElement('div');
        controlButton.style.display = 'inline-block';
        controlButton.style.padding = button.padding;
        controlButton.innerHTML = `<img id="${button.name}" src="./images/${button.name}.svg"></img>`;
        if(button.action)
            controlButton.onclick = button.action;
        container.appendChild(controlButton);
    });

    return container;
}

function CenterControl(controlDiv) {
    createControl(controlDiv, [
        {name:'center', action: centerMap, padding: '8px'}
    ]);
}

function FilterControl (controlDiv){
    createControl(controlDiv, [
        {name:'list', action: changeView, padding: '12px'},
        {name:'filter', action: filter, padding: '12px'}
    ]);
}

function createMap(latitude, longitude){
    let locationBottomLeft = google.maps.ControlPosition.BOTTOM_LEFT,
        locationBottomRight = google.maps.ControlPosition.BOTTOM_RIGHT,
        mapTypeId = google.maps.MapTypeId.ROADMAP,
        zoomPosition = google.maps.ControlPosition.RIGHT_TOP;

    let options = {
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoom: zoomLevel.country,
        center: defaultLocation,
        mapTypeId: mapTypeId,
        zoomControlOptions: {
            position: zoomPosition
        }
    };

    map = new google.maps.Map(document.getElementById('map'), options);

    let centerControlDiv = document.createElement('div'),
        filterMapDiv = document.createElement('div');

    new CenterControl(centerControlDiv);
    new FilterControl(filterMapDiv);

    centerControlDiv.index = 1;

    map.controls[locationBottomLeft].push(centerControlDiv);
    map.controls[locationBottomRight].push(filterMapDiv);
}

function initMap() {
    //Create the map first (Don't wait for location)
    createMap(defaultLocation.lat, defaultLocation.lng);

    //Center map once location is obtained
    buildfire.geo.getCurrentPosition({}, (err, position) => {
        if(!err && position && position.coords){
            lastKnownLocation = {lat: position.coords.latitude, lng: position.coords.longitude};

            map.setCenter(lastKnownLocation);
            map.setZoom(zoomLevel.city);
        }
    });
}