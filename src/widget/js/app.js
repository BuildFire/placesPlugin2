import buildfire from "buildfire";
import filter from "lodash/filter";
import find from "lodash/find";
import "./lib/markercluster.js";

import "../css/general.css";
import "../css/slider.css";
import "../css/quill.css";
import "./filterControl.js";
import "./map.js";
import "./list.js";
import "./detail.js";
import "./router.js";
import PlacesSort from "./PlacesSort.js";

import { stringsConfig } from "../js/shared/stringsConfig";
import "../js/shared/strings";

window.strings = new buildfire.services.Strings("en-us", stringsConfig);

window.app = {
  goBack: null,
  settings: {
    viewStates: { map: "map", list: "list", detail: "detail" },
    sortOptions: {
      alpha: "alpha",
      alphaDesc: "alphaDesc",
      manual: "manual",
      distance: "distance",
    },
    placesTag: "places",
    placesListTag: "places-list",
    cloudImg: {
      domain: "https://czi3m2qn.cloudimg.io",
      operations: {
        cdn: "/cdn/n/n",
        width: "/s/width",
        crop: "/s/crop",
      },
    },
  },
  views: {
    listView: document.getElementById("listView"),
    mapView: document.getElementById("mapView"),
    detailView: document.getElementById("detailView"),
    sideNav: document.getElementById("sideNav"),
  },
  state: {
    mapInitiated: false,
    mode: null,
    activeView: null,
    actionItems: [],
    places: [],
    markers: [],
    bounds: null,
    filteredPlaces: [],
    selectedPlace: [],
    sortBy: null,
    categories: [],
    navHistory: [],
    isBackNav: false,
    bookmarked: false,
    isBookmarkingAllowed: true,
    distanceUnit: false,
    pointsOfInterest: "on",
    isCategoryDeeplink: false,
    page: 0,
    pageSize: 50,
    paginationRequestBusy: false,
    mapViewFetchIntervalActive: false,
    location: buildfire.geo.getCurrentPosition(
      { enableHighAccuracy: true },
      (err, position) => {
        if (err) return console.error(err);
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      }
    ),
  },
  backButtonInit: () => {
    window.app.goBack = window.buildfire.navigation.onBackButtonClick;

    buildfire.navigation.onBackButtonClick = function () {
      const isLauncher = window.location.href.includes("launcherPlugin");

      if (window.app.state.navHistory.length > 1) {
        //Remove the current state
        if (
          window.app.state.mode ===
          window.app.state.navHistory[window.app.state.navHistory.length - 1]
        ) {
          //Don't remove last state, if launcher plugin
          if (!isLauncher || window.app.state.navHistory.length != 1) {
            window.app.state.navHistory.pop();
            window.buildfire.history.pop();
          }
        }

        //Navigate to the previous state
        let lastNavState =
          window.app.state.navHistory[window.app.state.navHistory.length - 1];

        window.app.state.isBackNav = true;

        window.router.navigate(lastNavState);
      } else {
        window.app.goBack();
      }
    };
  },
  loadPage: (page, pageSize, callback) => {
    let places = [];
    console.log("Places - Loading Page", window.app.state.page);
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
      (err, result = []) => {
        if (!err && result && !result.length) {
          if (window.mapViewFetchTimeout)
            clearTimeout(window.mapViewFetchTimeout);
          return;
        }
        console.log("RESULT", result);
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
          window.app.state.places = window.app.state.places.concat(places);
          window.app.state.filteredPlaces =
            window.app.state.places.concat(places);
        } else {
          window.app.state.places = window.app.state.places.concat(places);
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
        console.log("Places - Done loading places - Got", places.length);
        callback(err, places);
      }
    );
  },
  init: (placesCallback, positionCallback) => {
    window.buildfire.appearance.titlebar.show();
    window.app.backButtonInit();
    let places = [];

    function getPlacesList() {
      const pageSize = window.app.state.pageSize;
      let page = window.app.state.page;
      console.log(page, pageSize);
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
            console.log("Places - Done loading places - Got", places.length);
            placesCallback(null, places);
          }
        );
      };
      loadPage();
    }
    buildfire.datastore.get(
      window.app.settings.placesTag,
      function (err, results) {
        if (err) {
          console.error("datastore.get error", err);
          return;
        }

        let data = results.data;

        if (data) {
          places = data.places || [];
          window.app.state.sortBy = data.sortBy;
          window.app.state.itemsOrder = data.itemsOrder;
          window.app.state.actionItems = data.actionItems || [];
          if (!window.app.state.isCategoryDeeplink) {
            window.app.state.defaultView = data.defaultView;
            window.app.state.mode = data.defaultView;
          }
          window.app.state.isBookmarkingAllowed = data.isBookmarkingAllowed;
          window.app.state.isCarouselSwitched = data.isCarouselSwitched;
          window.app.state.configCategories = data.configCategories;
          window.app.state.chatWithLocationOwner = data.chatWithLocationOwner;
          window.app.state.socialWall = data.socialWall;
          window.app.state.distanceUnit = data.distanceUnit;
          if (data.categories && !window.app.state.isCategoryDeeplink) {
            window.app.state.categories = data.categories.map((category) => {
              return { name: category, isActive: true };
            });
          }
          if (data.pointsOfInterest) {
            window.app.state.pointsOfInterest = data.pointsOfInterest;
          }
        }

        getPlacesList();
      }
    );

    buildfire.geo.getCurrentPosition(
      { enableHighAccuracy: true },
      (err, position) => {
        if (err) return;
        console.warn("getCurrentPosition", err);
        if (position && position.coords)
          positionCallback(null, position.coords);
      }
    );

    buildfire.datastore.onUpdate(function (event) {
      if (app.state.mode === "detail") {
        window.router.navigate(window.app.settings.viewStates.map);
      }
      setTimeout(() => {
        location.reload(); // TEMPORARY SOLUTION FOR THE DEMO
      }, 100);
      let currentPlaces = window.app.state.places;
      let newPlaces =
        event.data && event.data.places ? event.data.places : currentPlaces;

      let currentSortOrder = window.app.state.sortBy;
      let newSortOrder =
        event.data && event.data.sortBy ? event.data.sortBy : currentSortOrder;

      let currentDefaultView = window.app.state.defaultView;
      let newViewState =
        event.data && event.data.defaultView
          ? event.data.defaultView
          : currentDefaultView;
      let newDefaultView =
        event.data && event.data.defaultView
          ? event.data.defaultView
          : currentDefaultView;

      /**
       * SORT ORDER
       */
      if (currentSortOrder != newSortOrder) {
        window.app.state.sortBy = newSortOrder;
        let sortBy = PlacesSort[window.app.state.sortBy];
        window.app.state.places.sort(sortBy);

        if (window.app.state.mode === window.app.settings.viewStates.list)
          window.loadList(window.app.state.places);

        return;
      }

      let defaultViewChanged = currentDefaultView !== newDefaultView;
      let notInDefaultView = newDefaultView !== window.app.state.mode;

      // We want to update the widget to reflect the new default view if the setting
      // was changed and the user is not in that view already
      if (defaultViewChanged && notInDefaultView) {
        window.router.navigate(newViewState);
        window.app.state.mode = newViewState;
        return;
      }

      //Do comparison to see what's changed
      let updatedPlaces = filter(newPlaces, (newPlace) => {
        return !find(currentPlaces, newPlace);
      });

      if (window.app.state.mode === window.app.settings.viewStates.map) {
        window.mapView.updateMap(updatedPlaces);
      } else {
        //Load new items
        window.listView.updateList(updatedPlaces);
      }
    });
  },
  gotPieceOfData() {
    if (window.app.state.places && window.app.state.location) {
      let { location } = window.app.state;
      let destinations = [];
      window.app.state.places.forEach((place) => {
        destinations.push(
          new window.google.maps.LatLng(place.address.lat, place.address.lng)
        );
      });

      let origin = {
        latitude: location.latitude,
        longitude: location.longitude,
      };

      destinations.forEach((item, index) => {
        var destination = { latitude: item.lat(), longitude: item.lng() };
        var distance = buildfire.geo.calculateDistance(origin, destination, {
          decimalPlaces: 5,
        });
        if (distance < 0.5) {
          window.app.state.places[index].distance =
            Math.round(distance * 5280).toLocaleString() + " ft";
        } else {
          if (window.app.state.distanceUnit) {
            window.app.state.places[index].distance =
              Math.round(distance * 1.60934).toLocaleString() + " km";
          } else {
            window.app.state.places[index].distance =
              Math.round(distance).toLocaleString() + " mi";
          }
        }
      });
      window.listView.updateDistances(window.app.state.filteredPlaces);

      let currentSortOrder = window.app.state.sortBy;

      if (currentSortOrder === "distance") {
        window.app.state.places = window.app.state.places.sort(
          window.PlacesSort.distance
        );
        window.listView.sorting(window.app.state.places);
        window.lazyload(null, null, {
          root: document.querySelector(".list-scrolling-container"),
          rootMargin: "0px",
          threshold: [0],
        });
      }
    }
  },
  gotPlaces(err, places) {
    if (window.app.state.mode === window.app.settings.viewStates.list) {
      window.app.state.isCategoryDeeplink
        ? window.initList(window.app.state.places, true)
        : window.initList(places, true);
      //We can not pre-init the map, as it needs to be visible
    } else {
      window.app.state.isCategoryDeeplink
        ? window.initMap(window.app.state.places, true)
        : window.initMap(places, true);
      window.app.state.isCategoryDeeplink
        ? window.initList(window.app.state.places)
        : window.initList(places);

      window.app.gotPieceOfData();
    }
  },

  gotLocation(err, location) {
    window.app.state.location = location;
    window.app.gotPieceOfData();
  },

  initDetailView: (placeId) => {
    window.buildfire.appearance.titlebar.show();
    buildfire.datastore.getById(
      placeId,
      window.app.settings.placesListTag,
      (error, result) => {
        if (
          error ||
          !result ||
          (result && !result.id) ||
          (result && result.data && !result.data.title)
        ) {
          const text = strings.get("deeplink.deeplinkLocationNotFound")
            ? strings.get("deeplink.deeplinkLocationNotFound")
            : "Location does not exist";
          window.app.initCategoryView();
          return buildfire.components.toast.showToastMessage(
            { text },
            () => {}
          );
        }
        window.app.backButtonInit();
        result.data.id = result.id;
        window.app.state.selectedPlace[0] = result.data;

        //Check is bookmark allowed when page is open with deeplink
        buildfire.datastore.get(
          window.app.settings.placesTag,
          function (err, results) {
            if (err) {
              console.log(err);
              return false;
            }

            let data = results.data;

            if (data) {
              window.app.state.sortBy = data.sortBy;
              window.app.state.itemsOrder = data.itemsOrder;
              window.app.state.actionItems = data.actionItems || [];
              if (!window.app.state.isCategoryDeeplink) {
                window.app.state.defaultView = data.defaultView;
                window.app.state.mode = data.defaultView;
              }
              window.app.state.isBookmarkingAllowed = data.isBookmarkingAllowed;
              window.app.state.isCarouselSwitched = data.isCarouselSwitched;
              window.app.state.configCategories = data.configCategories;
              window.app.state.chatWithLocationOwner =
                data.chatWithLocationOwner;
              window.app.state.socialWall = data.socialWall;
              window.app.state.distanceUnit = data.distanceUnit;
              if (data.categories && !window.app.state.isCategoryDeeplink) {
                window.app.state.categories = data.categories.map(
                  (category) => {
                    return { name: category, isActive: true };
                  }
                );
              }
              if (data.pointsOfInterest) {
                window.app.state.pointsOfInterest = data.pointsOfInterest;
              }
            }
            window.router.navigate(window.app.settings.viewStates.detail);
            window.app.checkBookmarked(result.id);
          }
        );
      }
    );
  },

  checkBookmarked(id) {
    window.buildfire.bookmarks.getAll(function (err, bookmarks) {
      if (err) {
        console.log(err);
        return false;
      }
      let bookmark = bookmarks.filter((bookmark) => bookmark.id === id);
      window.app.state.bookmarked = bookmark.length > 0;
    });
  },

  initCategoryView: (categoryId) => {
    window.app.state.categories = window.app.state.categories.map(
      (category) => {
        if (category.id === categoryId) {
          return { name: category, isActive: true };
        } else {
          return { name: category, isActive: false };
        }
      }
    );
    window.app.init(window.app.gotPlaces, window.app.gotLocation);
  },
};

strings.init().then(() => {
  const queryStringObj = buildfire.parseQueryString();
  if (queryStringObj.dld) {
    buildfire.datastore.get(window.app.settings.placesTag, (err, results) => {
      if (err) return console.log(err);
      window.app.state.categories = results.data.categories;
      let deeplinkObj = JSON.parse(queryStringObj.dld);
      const deepLinkId = deeplinkObj.id
        ? deeplinkObj.id
        : deeplinkObj.placeId
        ? deeplinkObj.placeId
        : null;
      if (window.app.state.categories) {
        window.app.state.categories.map((category) => {
          if (category.id === deepLinkId) {
            window.app.state.isCategoryDeeplink = true;
          }
        });
      }
      if (window.app.state.isCategoryDeeplink) {
        window.app.state.defaultView = deeplinkObj.view;
        window.app.state.mode = deeplinkObj.view;
        window.app.initCategoryView(deepLinkId);
      } else {
        if (deeplinkObj.view) {
          const text = strings.get("deeplink.deeplinkCategoryNotFound")
            ? strings.get("deeplink.deeplinkCategoryNotFound")
            : "Category does not exist";
          buildfire.components.toast.showToastMessage({ text }, () => {});
          return window.app.initCategoryView();
        }
        window.app.initDetailView(deepLinkId);
      }
    });
  } else {
    window.app.init(window.app.gotPlaces, window.app.gotLocation);
  }
  window.initRouter();
});
