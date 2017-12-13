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
            image.className = 'list-image';

            const title = document.createElement('div');
            title.className = 'list-title';
            title.innerHTML = place.title;

            const address = document.createElement('div');
            address.innerHTML = place.address;

            const distance = document.createElement('div');
            distance.setAttribute('id', `distance${index}`);
            distance.innerHTML = (place.distance) ? place.distance : '...';
            distance.className = 'list-distance';

            listItem.appendChild(image);
            listItem.appendChild(title);
            listItem.appendChild(distance);
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
        window.listView.addPlaces(newPlaces);
    },
    updateDistances: (places) => {
        places.forEach((place, index) => {
            if(place.distance)
                document.getElementById(`distance${index}`).innerHTML = place.distance;
        });
    }
};
