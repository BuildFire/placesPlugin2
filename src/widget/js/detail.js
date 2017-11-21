import Handlebars from "./lib/handlebars"

window.detailView = {
    init: (place) => {
        //Add filter control
        let view = document.getElementById('detailView');
        let screenWidth = window.innerWidth;
        const title = place.title;
        const imageName = place.image ? place.image : 'holder-16x9.png';

        //TODO:This is hacky ... come up with a better way
        const mapHeight = document.getElementById('view').getBoundingClientRect().height/3;

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
                let mapTypeId = google.maps.MapTypeId.ROADMAP,
                    zoomPosition = google.maps.ControlPosition.RIGHT_TOP,
                    zoomTo = 14, //city
                    centerOn = {lat: place.address.lat, lng: place.address.lng};

                let options = {
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    zoom: zoomTo,
                    center: centerOn,
                    mapTypeId: mapTypeId,
                    zoomControlOptions: {
                        position: zoomPosition
                    }
                };

                map = new google.maps.Map(document.getElementById('smallMap'), options);

                const iconBaseUrl = 'https://app.buildfire.com/app/media/',
                    icon = {
                        url: iconBaseUrl + 'google_marker_green_icon.png',
                        // This marker is 20 pixels wide by 20 pixels high.
                        scaledSize: new google.maps.Size(20, 20),
                        // The origin for this image is (0, 0).
                        origin: new google.maps.Point(0, 0),
                        // The anchor for this image is at the center of the circle
                        anchor: new google.maps.Point(10, 10)
                    }

                new google.maps.Marker({
                    position: place.address,
                    map,
                    icon
                });
        });
    },

};