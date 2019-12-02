import "./lib/lazyload";

window.listView = {
    initialized: false,
    imagePrefix: null,
    defaultImage: null,
    listScrollingContainer: null,
    imageHeight: null,
    imageWidth: null,
    addPlaces: (places) => {
        if(!places){
            return;
        }

        function init() {
            console.log('Initializing list view !!!');
            // Crop image to 16:9 aspect ratio
            window.listView.imageWidth = Math.floor(window.innerWidth);
            window.listView.imageHeight = Math.floor(window.innerWidth / 16 * 9);

            const cloudImg = window.app.settings.cloudImg;
            window.listView.imagePrefix = `${cloudImg.domain}${cloudImg.operations.crop}/${window.listView.imageWidth}x${window.listView.imageHeight}/`;
            window.listView.defaultImage = `${cloudImg.domain}${cloudImg.operations.cdn}/https://pluginserver.buildfire.com/styles/media/holder-16x9.png`;

            const listContainer = document.getElementById("listView");

            window.listView.listScrollingContainer = document.createElement('div');
            window.listView.listScrollingContainer.className = 'list-scrolling-container';
            window.listView.listScrollingContainer.id = 'list--container';
            listContainer.appendChild(window.listView.listScrollingContainer);
            window.listView.initialized = true;
        }
        if (!window.listView.initialized) { 
           init(); 
        }
        
        window.listView.sorting(places);
        window.lazyload();
    },
    sorting: (places) => {
        if (typeof (window.listView.listScrollingContainer) != undefined && window.listView.listScrollingContainer != null) {
            window.listView.listScrollingContainer.querySelectorAll('*').forEach(node => node.remove());
        }
            places.forEach((place, index) => {

                if (!place.address || !place.address.lat || !place.address.lng) {
                    return;
                }

                const listItem = document.createElement('div');
                listItem.setAttribute('style', `${window.listView.imageHeight}px !important`);
                listItem.id = (place.id) ? `id_${place.id}` : '';
                listItem.className = 'list-item';

                listItem.addEventListener('click', e => {
                    e.preventDefault();
                    window.app.state.selectedPlace.unshift(place);
                    window.router.navigate(window.app.settings.viewStates.detail);
                });

                //Add Image
                const listImage = place.image ? place.image : window.listView.defaultImage;
                const image = document.createElement('img');

                image.setAttribute('data-src', window.listView.imagePrefix + listImage);
                image.setAttribute('width', window.listView.imageWidth);
                image.setAttribute('height', window.listView.imageHeight);
                image.setAttribute('style', `${window.listView.imageHeight}px !important`);
                image.className = 'lazyload';

                const infoContainer = document.createElement('div');
                infoContainer.className = 'list-info-container';

                const title = document.createElement('div');
                title.className = 'list-title';
                title.innerHTML = place.title;
                infoContainer.appendChild(title);

                const subtitle = document.createElement('div');
                let subtitleText = (place.subtitle && place.subtitle.length)
                    ? place.subtitle : '';

                subtitle.className = 'list-description';
                subtitle.innerHTML = subtitleText;
                infoContainer.appendChild(subtitle);

                const viewBtn = document.createElement('img');
                viewBtn.className = 'list-view-btn';
                viewBtn.src = 'images/right-arrow.png';
                infoContainer.appendChild(viewBtn);

                const address = document.createElement('div');
                address.innerHTML = place.address;

                const distance = document.createElement('div');
                distance.setAttribute('id', `distance-${place.id}`);
                distance.innerHTML = (place.distance) ? place.distance : '...';
                distance.className = 'list-distance';
                infoContainer.appendChild(distance);

                listItem.appendChild(image);
                listItem.appendChild(infoContainer);
                if (typeof (window.listView.listScrollingContainer) != undefined && window.listView.listScrollingContainer != null) {
                    window.listView.listScrollingContainer.appendChild(listItem);
                }
            });
    },
    initList: (places) => {
        //Add filter control
        let filterDiv = document.getElementById('filter');
        new window.FilterControl(filterDiv);
        window.listView.addPlaces(places);
    },
    updateList: (newPlaces) => {
        console.log('called updateList()');
        window.listView.addPlaces(newPlaces);
    },
    filter(placesToHide, placesToShow) {
        //Hide filtered places
        placesToHide.forEach((place) => {
            let divToHide = document.getElementById(`id_${place.id}`);
            if(divToHide)
                divToHide.setAttribute('style', 'display:none !important');
        });

        //Show places that have been hidden
        placesToShow.forEach((place) => {
            let divToShow = document.getElementById(`id_${place.id}`);
            if(divToShow)
                divToShow.setAttribute('style', 'display:block !important');
        });
    },
    updateDistances: (places) => {
        places.forEach((place, index) => {
            let distanceElement = document.getElementById(`distance-${place.id}`);

            if(distanceElement)
                distanceElement.innerHTML = place.distance;
        });
    }
};