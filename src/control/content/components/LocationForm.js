import Buildfire, { components } from 'buildfire';
import React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import ReactQuill from 'react-quill';
// import ImageResize from 'quill-image-resize-module';
import { Editor } from "@tinymce/tinymce-react";

// ReactQuill.Quill.register('modules/imageResize', ImageResize);

class LocationForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    let model = {
      id: "",
      title: "",
      subtitle: "",
      description: "",
      address: {},
      image: "",
      actionItems: [],
      contactPerson: {},
      categories: [],
      carousel: [],
      deeplinkUrl: "",
    };
    let state = Object.assign(model, cloneDeep(this.props.location) || {});
    this.setState(state);
  }

  componentWillUnmount() {
    window.google.maps.event.clearInstanceListeners(this.autocomplete);
    delete this.autocomplete;
  }

  /**
   * Handles mounting of dom dependant components
   * - Google Maps
   * - Carousel
   */
  componentDidMount() {
    tinymce.init({
      selector: "textarea",
      init_instance_callback: (editor) => {
        editor.on("Change", (e) => {
          this.setState({
            description: editor.getContent(),
          });
        });
      },
      setup:  (editor) => {
        editor.on("init",  (e) => {
          console.log("Editor was initialized.", this.state.description);
          editor.setContent(this.state.description);
        });
      },
    });

    // Mount google map autocomplete
    const { maps } = window.google;
    this.autocomplete = new maps.places.Autocomplete(this.addressInput);
    this.autocomplete.addListener("place_changed", () => this.onPlaceChanged());
    setTimeout(() => {
      let container = document.querySelector(".pac-container");
      this.addressInput.parentNode.appendChild(container);
      container.style.top = "10px";
      container.style.left = "10px";
    }, 400);


    // Mount carousel
    this.editor = new components.carousel.editor("#carousel");
    this.editor.loadItems(this.state.carousel);
    this.editor.onAddItems = (items) => this.updateCarouselState();
    this.editor.onDeleteItem = (items, index) => this.updateCarouselState();
    this.editor.onItemChange = (item) => this.updateCarouselState();
    this.editor.onOrderChange = (item, prevIndex, newIndex) =>
      this.updateCarouselState();

    // Action items
    let selector = "#actionItems";
    let items = this.state.actionItems;
    this.actions = new components.actionItems.sortableList(selector, items);
    this.actions.dialogOptions = { showIcon: false };
    this.actions.onAddItems = (item) => {
      if (!("title" in item)) item.title = "Contact";
      const titles = document.getElementsByClassName("title");
      for (let titleElement of titles) {
        if (titleElement.innerHTML === "undefined")
          titleElement.innerHTML = "Contact";
      }

      this.updateActions();
    };
    this.actions.onDeleteItem = () => this.updateActions();
    this.actions.onItemChange = () => this.updateActions();
    this.actions.onOrderChange = () => this.updateActions();

    document.querySelector("#actionItems .labels").innerHTML =
      "Contact Information";
    document.querySelector("#actionItems a").innerHTML =
      "Add Contact Information";

    // Set initial map height
    this.map.style.height = 0;

    // Mount map if address exists
    if (this.state.address.lat && this.state.address.lng) {
      this.mountMap(this.state.address);
    }

    //Load deep link url
    if (this.state) {
      let id = this.state.id;
      let link = Buildfire.deeplink.createLink({ id });
      this.setState({ deeplinkUrl: link });
      let queryString = `?dld={"id":"${id}"}`;
      this.setState({ querystringUrl: queryString });
    }
  }

  mountMap(address) {
    const { maps } = window.google;
    const { pointsOfInterest } = this.props;
    let defaultLocation = new maps.LatLng(address.lat, address.lng);
    let mapOptions = {
      zoom: 16,
      center: defaultLocation,
      styles: [
        {
          featureType: "poi.business",
          elementType: "labels",
          stylers: [
            {
              visibility: pointsOfInterest,
            },
          ],
        },
      ],
    };
    this.map.style.height = "230px";
    this.mapInstance = new maps.Map(this.map, mapOptions);

    // Place a draggable marker on the map
    this.markerInstance = new maps.Marker({
      position: defaultLocation,
      map: this.mapInstance,
      draggable: true,
      title: "Drag to choose a location",
    });

    // Handle marker drag if marker is created
    if (this.markerInstance) {
      maps.event.addListener(this.markerInstance, "dragend", (e) => {
        let address = this.state.address;
        address.lat = e.latLng.lat();
        address.lng = e.latLng.lng();
        this.setState({ address });
      });
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const { address, description } = nextState;

    if (address.lat && address.lng && !this.mapInstance) {
      this.mountMap(address);
    }
  }

  componentWillUnmount() {
    console.log("REMOVE");
    tinymce.activeEditor.remove();
  }

  updateActions() {
    this.setState({ actionItems: this.actions.items });
  }

  onInputChange(e) {
    const changes = {};
    changes[e.target.name] = e.target.value;
    this.setState(changes);
  }

  onDescriptionChange(description) {
    this.setState({ description });
    tinymce.activeEditor.setContent(description);
  }

  onCategoryChange(e) {
    let { name, checked } = e.target;

    // Category was selected
    if (checked) {
      this.setState((prevState) => ({
        categories: [...prevState.categories, name],
      }));

      // Category was unselected
    } else {
      let index = this.state.categories.indexOf(name);
      let { categories } = this.state;
      categories.splice(index, 1);
      this.setState({ categories });
    }
  }

  /**
   * Handles updating the carousel state data
   */
  updateCarouselState() {
    const { items } = this.editor;
    this.setState({ carousel: items });
  }

  /**
   * Handle showing the image dialog
   */
  showImageDialog() {
    const dialogOptions = {
      showIcons: false,
      multiSelection: false,
    };

    // Request user to select image
    Buildfire.imageLib.showDialog(dialogOptions, (err, result) => {
      if (err) return console.error(err);

      // Stop if we don't have any images
      if (!result || !result.selectedFiles || !result.selectedFiles.length) {
        return;
      }

      this.setState({ image: result.selectedFiles[0] });
    });
  }

  /**
   * Handle the google maps autocomplete place change
   */
  onPlaceChanged() {
    const place = this.autocomplete.getPlace();
    if (!place.geometry) {
      return this.setState({ address: {} });
    }

    const address = {
      name: this.addressInput.value,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    if (this.mapInstance && this.markerInstance) {
      const { maps } = window.google;
      const point = new maps.LatLng(address.lat, address.lng);
      this.mapInstance.panTo(point);
      this.markerInstance.setPosition(point);
    }

    this.setState({ address });
  }

  onAddressChange(e) {
    if (e.target.value === "") {
      this.setState({ address: {} });
    }
  }

  /**
   * Pass submissions to parent component
   *
   * @param   {Event} e Form submission event
   */
  onSubmit(e) {
    e.preventDefault();
    if (typeof this.state.address !== "object") return;
    this.props.onSubmit(this.state);
  }

  onAutoKeyUp(e) {
    let keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  imageHandler = () => {
    const range = this.quillRef.getEditor().getSelection();
    buildfire.imageLib.showDialog(
      { showIcons: false, multiSelection: false },
      (err, result) => {
        if (err) throw err;
        if (result.selectedFiles.length > 0) {
          const value = buildfire.imageLib.resizeImage(
            result.selectedFiles[0],
            { width: "full" }
          );
          this.quillRef
            .getEditor()
            .insertEmbed(range.index, "image", value, "user");
        }
      }
    );
  };

  removeImage(e) {
    this.setState({ image: "" });
    e.preventDefault();
    return false;
  }

  addLocationOwner() {
    window.buildfire.auth.showUsersSearchDialog({}, (error, response) => {
      if (error) console.error(error);
      if (response && response.users && response.users.length > 0) {
        const contactPerson = response.users[0];
        contactPerson.id = response.userIds[0];
        this.setState({ contactPerson });
      }
    });
  }

  removeLocationOwner() {
    this.setState({ contactPerson: {} });
  }
  handleEditorChange = (content, editor) => {
    console.log("Content was updated:", content);
  };

  modules = {
    // imageResize: {},
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        [{ color: [] }, { background: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ color: [] }, { background: [] }],
        ["link", "image", "video"],
      ],
      handlers: {
        image: () => this.imageHandler(),
      },
    },
  };

  render() {
    const {
      title,
      address,
      description,
      image,
      categories,
      subtitle,
      deeplinkUrl,
      querystringUrl,
      contactPerson,
    } = this.state;
    return (
      <form
        onSubmit={(e) => this.onSubmit(e)}
        onKeyPress={(e) => this.onAutoKeyUp(e)}
      >
        <div className="form-group">
          <label htmlFor="name">Title*</label>
          <input
            onChange={(e) => this.onInputChange(e)}
            value={title}
            name="title"
            type="text"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="queryString">Query String</label>
          <input
            disabled
            maxLength={90}
            value={querystringUrl}
            name="deeplink"
            className="form-control"
            type="text"
          />
        </div>

        <div className="form-group">
          <label htmlFor="deeplink">Deep link</label>
          <input
            disabled
            maxLength={90}
            value={deeplinkUrl}
            name="deeplink"
            className="form-control"
            type="text"
          />
        </div>

        <div className="form-group">
          <label htmlFor="subtitle">Subtitle</label>
          <input
            maxLength={90}
            onChange={(e) => this.onInputChange(e)}
            value={subtitle}
            name="subtitle"
            className="form-control"
            placeholder="Optional"
            type="text"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Categories</label>
          <div className="row">
            {this.props.categories
              ? this.props.categories.map((category, index) => (
                  <div key={index} className="col-xs-3 __cpSelectCategoryBox">
                    <input
                      onChange={(e) => this.onCategoryChange(e)}
                      type="checkbox"
                      name={category.id}
                      checked={categories.indexOf(category.id) > -1}
                    />
                    &nbsp;
                    <label>{category.name}</label>
                  </div>
                ))
              : null}
          </div>
        </div>

        <div className="form-group autocomplete-container">
          <label htmlFor="address">Address*</label>
          <input
            key="address-input"
            onChange={(e) => this.onAddressChange(e)}
            ref={(n) => (this.addressInput = n)}
            value={
              address.name
                ? address.name
                : address.lat && address.lng
                ? `${address.lat}, ${address.lng}`
                : address.name
            }
            type="text"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <div id="map" ref={(n) => (this.map = n)} />
        </div>
        <div
          className="formContainer"
          style={{ display: "flex", flexDirection: "column", overflow: "auto" }}
        >
          <div className="form-group">
            <label htmlFor="description">Description*</label>
            <div className="editor" style={{ position: "relative" }}>
              <textarea name="content"></textarea>
            </div>
          </div>

          <br />

          <div className="form-group">
            <div id="actionItems" />
          </div>

          {this.props.chatWithLocationOwner &&
            this.props.socialWall &&
            this.props.socialWall.instanceId && (
              <div className="form-group">
                <div className="item clearfix row">
                  <div className="labels col-md-3 padding-right-zero pull-left">
                    Location Owner
                    <div className="settingsTooltip location-owner">
                      <span className="tip btn-info-icon btn-primary transition-third" />
                      <span className="settingsTooltiptext location-owner">
                        You can set a maximum of one location owner per
                        location.
                      </span>
                    </div>
                  </div>
                  <div className="main col-md-9 pull-right">
                    <div className="clearfix owner-info-container">
                      <div
                        onClick={() => this.addLocationOwner()}
                        className="btn btn-success"
                      >
                        {contactPerson && contactPerson.id ? "Select" : "Add"}{" "}
                        Location Owner
                      </div>
                      {contactPerson && contactPerson.id && (
                        <div className="owner-info">
                          <label>
                            {contactPerson.displayName &&
                            contactPerson.displayName.length > 0
                              ? contactPerson.displayName
                              : contactPerson.username}
                          </label>
                          <span
                            onClick={() => this.removeLocationOwner()}
                            className="delete btn-icon btn-delete-icon btn-danger transition-third"
                          ></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          <div className="form-group">
            <div id="carousel" />
          </div>

          <div className="item clearfix row">
            <span className="labels col-md-3 padding-right-zero pull-left">
              List Image
            </span>
            <div className="main col-md-9 pull-right">
              <div className="clearfix">
                <div className="list-image-holder">
                  <div
                    style={{ backgroundImage: image ? `url(${image})` : "" }}
                    className="image-dialog"
                    onClick={() => this.showImageDialog()}
                  >
                    {this.state.image ? null : <a>Add Image +</a>}
                  </div>
                  <span
                    className="delete btn-icon btn-delete-icon btn-danger transition-third"
                    onClick={(e) => this.removeImage(e)}
                  />
                </div>
                <span
                  className="delete btn-icon btn-delete-icon btn-danger transition-third"
                  onClick={(e) => this.removeImage(e)}
                />
              </div>
            </div>
          </div>
        </div>

          <div className="form-group">
            <button
              disabled={
                !title.length ||
                description.replace(/(&nbsp;|<(?!img|\/img).*?>)/gi, "")
                  .length === 0 ||
                !address ||
                !address.lat ||
                !address.lng
              }
              type="submit"
              className="btn btn-success"
            >
              {this.props.location ? "Save Location" : "Save Location"}
            </button>
          </div>
       </form>
    );
  }
}

export default LocationForm;
