window.listView = {
    addPlaces: (places) => {
        if(!places){
            return;
        }

        // Crop image to 16:9 aspect ratio
        const imageWidth = Math.floor(window.innerWidth);
        const imageHeight = Math.floor(window.innerWidth / 16 * 9);

        const imagePrefix = `https://czi3m2qn.cloudimg.io/s/crop/${imageWidth}x${imageHeight}/`;
        const defaultImage = `https://pluginserver.buildfire.com/styles/media/holder-16x9.png`;

        const listContainer = document.getElementById("listView");

        places.forEach((place, index) => {
            const listItem = document.createElement('div');
            listItem.id = (place.id) ? `id_${place.id}` : '';
            listItem.className = 'list-item';

            listItem.addEventListener('click', e => {
                e.preventDefault();
                window.app.state.selectedPlace.unshift(place);
                window.router.navigate(window.app.settings.viewStates.detail);
            });

            //Add Image
            const listImage = place.image ? place.image : defaultImage;
            const image = document.createElement('img');
            image.setAttribute('data-src', imagePrefix + listImage);
            image.className = 'list-image lazyyload';

            const infoContainer = document.createElement('div');
            infoContainer.className = 'list-info-container';

            const title = document.createElement('div');
            title.className = 'list-title';
            title.innerHTML = place.title;
            infoContainer.appendChild(title);

            const description = document.createElement('div');
            let descriptionText = (place.description && place.description.length > 100)
                ? place.description.substring(0, 100)
                : (place.description) ? place.description : '';

                description.className = 'list-description';
            description.innerHTML = descriptionText;
            infoContainer.appendChild(description);

            const viewBtn = document.createElement('img');
            viewBtn.className = 'list-view-btn';
            viewBtn.src = 'images/right-arrow.svg';
            infoContainer.appendChild(viewBtn);

            const address = document.createElement('div');
            address.innerHTML = place.address;
            // infoContainer.appendChild(address);

            const distance = document.createElement('div');
            distance.setAttribute('id', `distance${index}`);
            distance.innerHTML = (place.distance) ? place.distance : '...';
            distance.className = 'list-distance';
            infoContainer.appendChild(distance);

            listItem.appendChild(image);
            listItem.appendChild(infoContainer);
            //listItem.appendChild(address);

            listContainer.appendChild(listItem);
        });
    },
    initList: (places) => {
        //Add filter control
        let filterDiv = document.getElementById('filter');
        new window.FilterControl(filterDiv);
        window.listView.addPlaces(places);
    },
    updateList: (newPlaces) => {
        console.log('called updateList()', newPlaces);
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
            if(place.distance)
                document.getElementById(`distance${index}`).innerHTML = place.distance;
        });
    }
};
