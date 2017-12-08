import Handlebars from './lib/handlebars';

window.detailView = {
    init: (place) => {
        //Add filter control
        let view = document.getElementById('detailView');
        let screenWidth = window.innerWidth;
        const title = place.title;
        const imageName = place.image ? place.image : 'holder-16x9.png';

        //TODO:This is hacky ... come up with a better way
        const mapHeight = 238;

        let context = {
            width: screenWidth,
            height: mapHeight,
            imageName: imageName,
            title: title,
            distance: place.distance,
            address: place.address.name
        };

        console.log('place', place);

        fetch('./templates/detail.hbs')
            .then(response => {
                return response.text();
            })
            .then(response => {
                // Compile the template
                let theTemplate = Handlebars.compile(response);

                // Pass our data to the template
                let theCompiledHtml = theTemplate(context);

                // Add the compiled html to the page
                view.innerHTML = theCompiledHtml;

                //TODO: Move to common location
                let mapTypeId = window.google.maps.MapTypeId.ROADMAP,
                    zoomTo = 14, //city
                    centerOn = {lat: place.address.lat, lng: place.address.lng};

                let options = {
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    zoom: zoomTo,
                    center: centerOn,
                    mapTypeId: mapTypeId,
                    disableDefaultUI: true
                };

                let map = new window.google.maps.Map(document.getElementById('smallMap'), options);

                const iconBaseUrl = 'https://app.buildfire.com/app/media/',
                    icon = {
                        url: iconBaseUrl + 'google_marker_green_icon.png',
                        // This marker is 20 pixels wide by 20 pixels high.
                        scaledSize: new window.google.maps.Size(20, 20),
                        // The origin for this image is (0, 0).
                        origin: new window.google.maps.Point(0, 0),
                        // The anchor for this image is at the center of the circle
                        anchor: new window.google.maps.Point(10, 10)
                    };

                new window.google.maps.Marker({
                    position: place.address,
                    map,
                    icon
                });
        });
    },

};
