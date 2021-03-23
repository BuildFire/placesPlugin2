import filter from 'lodash/filter';
import find from 'lodash/find';
import Handlebars from "./lib/handlebars";

import { stringsConfig } from "../js/shared/stringsConfig";
import "../js/shared/strings";

let strings = new buildfire.services.Strings("en-us", stringsConfig);

strings.init();

window.filterControl = {
  originalPlaces: null,
  updatedPlaces: null,
  toggleSelection: false,
  

  openFilter: () => {
    window.filterControl.originalPlaces = app.state.filteredPlaces;
    let sideNav = document.getElementById("sideNav");
    let categoriesDiv = sideNav.querySelector("#categories");
    let menuTitle = strings.get("Home.filterMenuTitle").length
      ? strings.get("Home.filterMenuTitle").length > 14
        ? strings.get("Home.filterMenuTitle").substring(0, 14).trim() + "..."
        : strings.get("Home.filterMenuTitle")
      : "Categories";
    let toggleBtnText = strings.get("Home.toggleCategoriesTitle").length
      ? strings.get("Home.toggleCategoriesTitle").length > 20
        ? strings.get("Home.toggleCategoriesTitle").substring(0, 20).trim() +
          "..."
        : strings.get("Home.toggleCategoriesTitle")
      : "All Categories";

    categoriesDiv.innerHTML = "";

    if (app.state.categories) {
      let context = {
        categories: app.state.categories,
        selection: filterControl.toggleSelection,
      };

      let req = new XMLHttpRequest();
      req.open("GET", "./templates/categories.hbs");
      req.send();
      req.onload = () => {
        let theTemplate = Handlebars.compile(req.responseText);

        // Pass our data to the template
        let theCompiledHtml = theTemplate(context);

        // Add the compiled html to the page
        document.getElementById("categories").innerHTML = theCompiledHtml;
        document.getElementById("title").innerHTML = menuTitle;
        document.getElementById("toggleBtn").innerHTML = toggleBtnText;
        sideNav.className += " showing";
        document.getElementById("selection").checked = context.selection;
        sideNav.style.display = " block";
      };
    }
  },
  filterCategories: () => {
    filterControl.toggleSelection = !filterControl.toggleSelection;
    let selection = filterControl.toggleSelection;
    app.state.categories.map((item) => {
      item.isActive = selection;
      document.getElementById("cat_" + item.name.name).checked = selection;
    });
    document.getElementById("selection").checked = selection;
    if (!selection) {
      app.state.filteredPlaces = [];
    } else {
      let activeCategories = app.state.categories
        .filter((category) => category.isActive)
        .map((c) => c.name.id);
      app.state.filteredPlaces = app.state.places.filter((place) => {
        //If a location has no categories, we always show it
        if (
          typeof place.categories === "undefined" ||
          place.categories.length === 0
        ) {
          return true;
        }

        //Does the place include any of the active categories. Also, if a location has category, but category is deleted, we will still show location when categories filter "All" is selected.
        let isMatch = place.categories.some((placeCategory) => {
          return (
            activeCategories.includes(placeCategory) ||
            app.state.categories.length === activeCategories.length
          );
        });

        return isMatch;
      });
    }
    filterControl.updatedPlaces = app.state.filteredPlaces;
  },
  filterCategory: (categoryId) => {
    let categoryIndex = app.state.categories.findIndex(
      (category) => category.name.id === categoryId
    );
    //Switch the category's state
    app.state.categories[categoryIndex].isActive = !app.state.categories[
      categoryIndex
    ].isActive;

    let activeCategories = app.state.categories
      .filter((category) => category.isActive)
      .map((c) => c.name.id);

    let allCategoriesSelected = document.getElementById("selection").checked;

    if (activeCategories.length === 0) {
      return filterControl.filterCategories();
    }

    app.state.filteredPlaces = app.state.places.filter((place) => {
      //Does the place include any of the active categories

      if (place.categories.length === 0 && allCategoriesSelected) return true;

      let isMatch = place.categories.some((placeCategory) => {
        return activeCategories.includes(placeCategory);
      });

      return isMatch;
    });

    filterControl.updatedPlaces = app.state.filteredPlaces;
  },
  closeNav: () => {
    let sideNav = document.getElementById("sideNav");
    sideNav.style.display = "none";

    if (
      filterControl.updatedPlaces !== null &&
      filterControl.originalPlaces != filterControl.updatedPlaces
    ) {
      let originalPlaces = filterControl.originalPlaces,
        updatedPlaces = filterControl.updatedPlaces;

      let placesToHide = filter(originalPlaces, (preFilteredPlace) => {
        return !find(updatedPlaces, preFilteredPlace);
      });
      let placesToShow = filter(updatedPlaces, (postFilteredPlace) => {
        return !find(originalPlaces, postFilteredPlace);
      });

      //Update view to reflect changes
      const wasMapInitiated =
        document.getElementById("mapView").innerHTML != "";

      if (wasMapInitiated) {
        window.mapView.filter(placesToHide, placesToShow);
      } else {
        window.app.state.pendingMapFilter = { placesToHide, placesToShow };
      }

      window.listView.filter(placesToHide, placesToShow);
    }
  },
  changeView: () => {
    if (app.state.mode === app.settings.viewStates.list) {
      app.state.mode = app.settings.viewStates.map;
    } else {
      app.state.mode = app.settings.viewStates.list;
    }
   

    let switchViewButton = document.getElementsByClassName("changeView");
    Array.prototype.map.call(switchViewButton, (image) => {
      image.src = image.src.includes("map")
        ? image.src.replace("map", "list")
        : image.src.replace("list", "map");
    });

    if (app.state.mode === app.settings.viewStates.map) {
      const pageSize = window.app.state.pageSize;
      let page = window.app.state.page;
      let places = [];
      const loadPage = () => {
        console.log("Places - Loading Page", page);
        buildfire.datastore.search(
          {
            page,
            pageSize,
            sort: window.app.state.sortBy
              ? {
                  title: window.app.state.sortBy === "alphaDesc" ? -1 : 1,
                }
              : null,
          },
          window.app.settings.placesListTag,
          (err, result) => {
            places.push(
              ...result
                .map((place) => {
                  place.data.id = place.id;
                  place.data.sort = window.app.state.itemsOrder
                    ? window.app.state.itemsOrder.indexOf(place.id)
                    : 0;
                  return place.data;
                })
                .filter((place) => place.title)
            );
            if (!window.app.state.isCategoryDeeplink) {
              window.app.state.places = places;
              window.app.state.filteredPlaces = places;
            } else {
              window.app.state.places = places;
              window.app.state.categories.map((category) => {
                category.isActive
                  ? places.map((place) => {
                      if (place.categories.includes(category.name.id)) {
                        window.app.state.filteredPlaces.push(place);
                      }
                    })
                  : null;
              });
            }
            if (result.length === pageSize) {
              page++;
              loadPage();
            } else {
              console.log("Places - Done loading places - Got", places.length);
              window.initMap(places);
            }
          }
        );
      };
      loadPage();
    }

    router.navigate(`/${app.state.mode}`);
    console.log(app.state.mode);
  },
  createControl: (controlDiv, buttons) => {
    let container = document.createElement("div");
    container.className = "buttonContainer";

    controlDiv.appendChild(container);

    buttons.forEach((button) => {
      let controlButton = document.createElement("div");
      let imageName = button.name ? button.name : app.state.mode;
      let changeViewClass =
        imageName === "changeView" ? 'class="changeView"' : "";

      if (imageName === "changeView") {
        imageName =
          app.state.mode === app.settings.viewStates.list
            ? app.settings.viewStates.map
            : app.settings.viewStates.list;
      }

      controlButton.style.display = "inline-block";
      controlButton.innerHTML = `<img ${changeViewClass} src="./images/${imageName}.png"></img>`;
      if (button.action) controlButton.onclick = button.action;
      container.appendChild(controlButton);
    });

    return container;
  },
};

window.CenterControl = function(controlDiv) {
    filterControl.createControl(controlDiv, [
        { name:'center', action: mapView.centerMap }
    ]);
};

window.FilterControl = function (controlDiv){
    filterControl.createControl(controlDiv, [
        { name:'changeView', action: filterControl.changeView },
        { name:'filter', action: filterControl.openFilter }
    ]);
};
