function initList() {
    var defaultImage = 'https://czi3m2qn.cloudimg.io/s/crop/342x193/https://pluginserver.buildfire.com/styles/media/holder-16x9.png';

    let filterDiv = document.getElementById('filter');
    new FilterControl(filterDiv);

    if (places && places.length) {
        let listContainer = document.getElementById("listView");

        places.forEach((element) => {
            let listItem = document.createElement('div');

            //Add Image
            let image = document.createElement('img');
            image.src = (element.src)? element.src : defaultImage;

            let title = document.createElement('div');
            title.innerHTML = element.title;

            let address = document.createElement('div');
            address.innerHTML = element.address;

            listItem.appendChild(image);
            listItem.appendChild(title);
            //listItem.appendChild(address);

            listContainer.appendChild(listItem);
        });
    }
}
