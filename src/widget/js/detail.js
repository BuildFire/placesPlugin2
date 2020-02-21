import Buildfire, { components } from 'buildfire';
import Handlebars from './lib/handlebars';

window.detailView = {
    init: (place) => {
        //Add filter control
        let categories = [];
        if (place.hasOwnProperty('categories') && window.app.state.configCategories == true) place.categories.map(item => {
            categories.push(app.state.categories.filter(category => category.name.id === item).map(c => c.name.name))
        });
        let view = document.getElementById('detailView');
        let screenWidth = window.innerWidth;
        const title = place.title;
        let context = {
            isBookmarkingAllowed: window.app.state.isBookmarkingAllowed,
            isCarouselSwitched: window.app.state.isCarouselSwitched,
            width: screenWidth,
            image: place.image,
            id: place.id,
            title: title,
            description: place.description,
            distance: place.distance,
            address: place.address.name,
            actionItems: place.actionItems && place.actionItems.length > 0,
            lat: place.address.lat,
            lng: place.address.lng,
            bookmarked: false,
            categories: categories
        };

        let req = new XMLHttpRequest();
        req.open('GET', './templates/detail.hbs');
        req.send();
        req.onload = () => {
            let theTemplate = Handlebars.compile(req.responseText);

            // Pass our data to the template
            let theCompiledHtml = theTemplate(context);

            // Add the compiled html to the page
            view.innerHTML = theCompiledHtml;

            //TODO: Move to common location
            let mapTypeId = window.google.maps.MapTypeId.ROADMAP,
                zoomTo = 14, //city
                centerOn = {lat: place.address.lat, lng: place.address.lng};

            let options = {
                gestureHandling: 'greedy',
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                zoom: zoomTo,
                center: centerOn,
                mapTypeId: mapTypeId,
                disableDefaultUI: true
            };

            function getDistance(place) {
                let destinations = [];
                destinations.push(new window.google.maps.LatLng(place.lat, place.lng));
                window.buildfire.geo.getCurrentPosition(null, (err, position) => {
                    if (err) {
                        console.log(err);
                        return false;
                    } 
                    if (position && position.coords) {
                        let location = position.coords;
                        let origin = { latitude: location.latitude, longitude: location.longitude };
                        destinations.forEach((item) => {
                            let destination = { latitude: item.lat(), longitude: item.lng() };
                            let distance = window.buildfire.geo.calculateDistance(origin, destination, { decimalPlaces: 5 });
                            if (distance < 0.5) {
                                place.distance = (Math.round(distance * 5280)).toLocaleString() + ' ft';
                            } else {
                                place.distance = (Math.round(distance)).toLocaleString() + ' mi';
                            }
                        });
                        let distanceHolder = document.getElementById('distance-holder');
                        let distanceEl = document.createElement('span');
                        let imageEl = document.createElement('img');

                        distanceEl.setAttribute('class', 'distance');
                        imageEl.setAttribute('class', 'arrow');
                        imageEl.setAttribute('src', './images/arrow.png');

                        distanceEl.innerHTML = place.distance;
                        distanceHolder.appendChild(imageEl);
                        distanceHolder.appendChild(distanceEl);
                    }
                });
            }

            let placeContext = context;
            if (!placeContext.distance) {
                getDistance(placeContext);
            }

            /**
             * Get Directions
             */
             let directionsButton = document.getElementById('directionsBtn');
             directionsButton.className = 'btn btn-primary';
            directionsButton.addEventListener('click', getDirections);

             let contactButton = document.getElementById('contactBtn');
             if (contactButton) {
                contactButton.className = 'btn btn-success';
                contactButton.addEventListener('click', showContact);
             }

             function getDirections() {
                let hbsContext = context;
                Buildfire.getContext((err, context) => {
                    if (context && context.device && context.device.platform === 'ios') {
                        Buildfire.navigation.openWindow(`https://maps.apple.com/?q=${hbsContext.title}&t=m&daddr=${hbsContext.lat},${hbsContext.lng}`, '_system');
                    } else {
                        Buildfire.navigation.openWindow(`http://maps.google.com/maps?daddr=${hbsContext.lat},${hbsContext.lng}`, '_system');
                    }
                });
             }

             function showContact() {
                const { actionItems } = place;
                window.buildfire.actionItems.list(actionItems, {}, (err, actionItem) => {
                    if (err) return console.error(err);
                    console.log(actionItem);
                });
            }
            if (context.isBookmarkingAllowed) {
                document.getElementById('bookmarkBtn').addEventListener('click', handleBookmarkClicked);
                setBookmark();
            }

            function setBookmark() { 
                let bookmarkButton = document.getElementById('bookmarkBtn');
                bookmarkButton.className = context.bookmarked ? 'glyphicon glyphicon-star' : 'glyphicon glyphicon-star-empty';       
            }

            function getBookmarks() {
              window.buildfire.bookmarks.getAll(function (err, bookmarks) {
                if (err) console.log(err);
                let bookmark = bookmarks.find(bookmark => bookmark.id === context.id);
                if (bookmark) {
                  context.bookmarked = true;
                  setBookmark();
                }
              });
            }

            getBookmarks();

            function handleBookmarkClicked() {
                window.buildfire.bookmarks.getAll(function (err, bookmarks) {
                    if (err) console.log(err);
                    let bookmark = bookmarks.find(bookmark => bookmark.id === context.id);
                    if (bookmark) {
                        window.buildfire.bookmarks.delete(bookmark.id, function (err, bookmark) {
                            if (err) console.log("Bookmark err", err);
                            context.bookmarked = false;
                            setBookmark();
                        });
                    } else {
                        let options = {
                            id: context.id,
                            title: context.title,
                            icon: context.image,
                            payload: {
                                id: context.id
                            }
                        };
                        window.buildfire.bookmarks.add(options, function (err, data) {
                            if (err) console.log("Bookmark err", err);
                            context.bookmarked = true;
                            setBookmark();
                        });
                    }
                });
            }

            /**
             * Carousel
             */
            if (place.carousel && place.carousel.length) {
                let targetNode = document.getElementById('carouselView');
                // Set carousel's height to a 16:9 aspect ratio
                targetNode.style.height = `${window.innerWidth / 16 * 9}px`;
                new components.carousel.view({
                    selector: targetNode,
                    items: place.carousel
                });
            } else {
                let targetNode = document.getElementById('carouselView');
                targetNode.setAttribute('style', 'display: none;')
            }

            /**
             * Google Maps
             */

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
        };
    },
};
