import "./lib/lazyload";

window.listView = {
  initialized: false,
  imagePrefix: null,
  defaultImage: null,
  listScrollingContainer: null,
  imageHeight: null,
  imageWidth: null,
  addPlaces: (places) => {
    if (!places) {
      return;
    }

    function init() {
       if (window.listView.initialized === true) {
         document.getElementById("mapView").style.display = "none";
       }
      console.log("Initializing list view !!!");
      // Crop image to 16:9 aspect ratio
      window.listView.imageWidth = Math.floor(window.innerWidth);
      window.listView.imageHeight = Math.floor((window.innerWidth / 16) * 9);

      const cloudImg = window.app.settings.cloudImg;
      window.listView.imagePrefix = `${cloudImg.domain}${cloudImg.operations.crop}/${window.listView.imageWidth}x${window.listView.imageHeight}/`;
      window.listView.defaultImage = `${cloudImg.domain}${cloudImg.operations.cdn}/https://pluginserver.buildfire.com/styles/media/holder-16x9.png`;

      const listContainer = document.getElementById("listView");

      window.listView.listScrollingContainer = document.createElement("div");
      window.listView.listScrollingContainer.className =
        "list-scrolling-container list-scrolling-container-pagination-trigger-element";
      window.listView.listScrollingContainer.id = "list--container";
      //window.listView.listScrollingContainer.addEventListener('scroll', window.listView.handleScroll());
      listContainer.appendChild(window.listView.listScrollingContainer);
      const triggerElement = document.querySelector(".list-scrolling-container-pagination-trigger-element");
      if (triggerElement) {
        triggerElement.addEventListener('scroll', ({ target }) => {
          if (window.app.state.mode === window.app.settings.viewStates.list &&  ((target.scrollHeight - target.scrollTop - 50) <= document.body.clientHeight) && !window.app.state.paginationRequestBusy) {
            window.app.state.paginationRequestBusy = true;
            window.app.state.page++;
            window.app.loadPage(
              window.app.state.page,
              window.app.state.pageSize,
              (err, places) => {
                window.app.state.paginationRequestBusy = false;
                window.listView.addPlaces(places);
                window.mapView.updateMap(places);
              }
            );
          }
        });
      }

      window.listView.initialized = true;
    }
    if (!window.listView.initialized) {
      init();
    }

    let sortPlaces = [];
    sortPlaces = places.sort(window.PlacesSort[window.app.state.sortBy]);
    window.listView.sorting(sortPlaces);
    if (window.app.state.places.length === 0)
      document
        .getElementById("emptyItem")
        .setAttribute("style", "display: block; text-align: center;");
    window.lazyload(null, null, {
      root: document.querySelector(".list-scrolling-container"),
      rootMargin: "0px",
      threshold: [0],
    });
  },
  handleScroll: (e) => {
    console.log(e);
  },
  sorting: (places) => {
    if (
      typeof window.listView.listScrollingContainer != undefined &&
      window.listView.listScrollingContainer != null
    ) {
      window.listView.listScrollingContainer
        .querySelectorAll("*")
        .forEach((node) => node.remove());
    }
    const emptyItem = document.createElement("div");
    emptyItem.id = "emptyItem";
    emptyItem.setAttribute("style", `display: none !important;`);

    const emptyItemImage = document.createElement("img");
    emptyItemImage.setAttribute("src", "images/emptyItem.svg");
    emptyItemImage.setAttribute("style", `height: auto; padding-top: 10vh;`);
    emptyItem.appendChild(emptyItemImage);

    const emptyItemText = document.createElement("span");
    if (places.length === 0)
      emptyItemText.innerHTML =
        "Oops! This page is empty!<br>Refine your search or change your filters to see locations";
    else emptyItemText.innerText = "There are no places in this category";

    emptyItemText.setAttribute(
      "style",
      `display: block; font-size: 16px; 
        padding-left: 3vh; padding-right: 3vh; padding-top: 2vh; font-weight: bold;`
    );
    emptyItem.appendChild(emptyItemText);

    places.forEach((place, index) => {
      if (!place.address || !place.address.lat || !place.address.lng) {
        return;
      }

      document.getElementsByClassName(
        "list-scrolling-container"
      )[0].style.height = `${window.listView.imageHeight + 20}px;`;

      const listItem = document.createElement("div");
      listItem.setAttribute(
        "style",
        `${window.listView.imageHeight}px !important`
      );
      listItem.id = place.id ? `id_${place.id}` : "";
      listItem.className = "list-item";

      listItem.addEventListener("click", (e) => {
        e.preventDefault();
        window.app.state.selectedPlace.unshift(place);
        window.router.navigate(window.app.settings.viewStates.detail);
      });

      //Add Image
      const listImage = place.image
        ? place.image
        : window.listView.defaultImage;
      const image = document.createElement("img");

      image.setAttribute("data-src", window.listView.imagePrefix + listImage);
      image.setAttribute("width", window.listView.imageWidth);
      image.setAttribute("height", window.listView.imageHeight);
      image.setAttribute(
        "style",
        `${window.listView.imageHeight}px !important`
      );
      image.className = "lazyload";

      const infoContainer = document.createElement("div");
      infoContainer.className = "list-info-container";

      const title = document.createElement("div");
      title.className = "list-title";
      let placeTitle = place.title;
      title.innerHTML = placeTitle;
      infoContainer.appendChild(title);

      const subtitle = document.createElement("div");
      let subtitleText = place.subtitle.length
        ? place.subtitle.length > 25
          ? place.subtitle.substring(0, 25).trim() + "..."
          : place.subtitle
        : "";

      subtitle.className = "list-description";
      subtitle.innerHTML = subtitleText;
      infoContainer.appendChild(subtitle);

      const viewBtn = document.createElement("img");
      viewBtn.className = "list-view-btn";
      viewBtn.src = "images/right-arrow.png";
      infoContainer.appendChild(viewBtn);

      const address = document.createElement("div");
      address.innerHTML = place.address;

      const distance = document.createElement("div");
      distance.setAttribute("id", `distance-${place.id}`);
      distance.innerHTML = place.distance ? place.distance : "";
      distance.className = "list-distance";
      infoContainer.appendChild(distance);

      listItem.appendChild(image);
      listItem.appendChild(infoContainer);
      if (
        typeof window.listView.listScrollingContainer != undefined &&
        window.listView.listScrollingContainer != null
      ) {
        window.listView.listScrollingContainer.appendChild(listItem);
      }
    });
    window.listView.listScrollingContainer.appendChild(emptyItem);
  },
  initList: (places) => {
    //Add filter control
    let filterDiv = document.getElementById("filter");
    new window.FilterControl(filterDiv);
    window.listView.addPlaces(places);
    if (window.app.state.isCategoryDeeplink)
      window.listView.filter(places, window.app.state.filteredPlaces);
  },
  updateList: (newPlaces) => {
    console.log("called updateList()");
    window.listView.addPlaces(newPlaces);
  },
  filter(placesToHide, placesToShow) {
    //Hide filtered places
    placesToHide.forEach((place) => {
      let divToHide = document.getElementById(`id_${place.id}`);
      if (divToHide) divToHide.setAttribute("style", "display:none !important");
    });

    //Show places that have been hidden
    placesToShow.forEach((place) => {
      let divToShow = document.getElementById(`id_${place.id}`);
      if (divToShow)
        divToShow.setAttribute("style", "display:block !important");
    });

    if (!window.app.state.filteredPlaces.length)
      document
        .getElementById("emptyItem")
        .setAttribute("style", "display: block; text-align: center;");
    else
      document
        .getElementById("emptyItem")
        .setAttribute("style", "display: none !important;");
  },
  updateDistances: (places) => {
    places.forEach((place, index) => {
      let distanceElement = document.getElementById(`distance-${place.id}`);

      if (distanceElement) distanceElement.innerHTML = place.distance;
    });
  },
};
