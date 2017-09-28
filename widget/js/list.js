function initList() {
    if (places && places.length) {
        let listContainer = document.getElementById("listView");
        places.forEach((element) => {
            let listItem = document.createElement('div');
            listItem.innerHTML = `${element.title} ${element.address}`;

            listContainer.appendChild(listItem);
        });
    }
}
