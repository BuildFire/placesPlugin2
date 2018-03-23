import Buildfire, { components } from 'buildfire';
import React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import ReactQuill from 'react-quill';
import ImageResize from 'quill-image-resize-module';

ReactQuill.Quill.register('modules/imageResize', ImageResize);

class LocationForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    let model = {
      title: '',
      subtitle: '',
      description: '',
      address: {},
      image: '',
      actionItems: [],
      categories: [],
      carousel: []
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
    // Mount google map autocomplete
    const { maps } = window.google;
    this.autocomplete = new maps.places.Autocomplete(this.addressInput);
    this.autocomplete.addListener('place_changed', () => this.onPlaceChanged());
    setTimeout(() => {
      let container = document.querySelector('.pac-container');
      this.addressInput.parentNode.appendChild(container);
      container.style.top = '10px';
      container.style.left = '10px';
    }, 400);

    // Mount carousel
    this.editor = new components.carousel.editor('#carousel');
    this.editor.loadItems(this.state.carousel);
    this.editor.onAddItems = (items) => this.updateCarouselState();
    this.editor.onDeleteItem = (items, index) => this.updateCarouselState();
    this.editor.onItemChange = (item) => this.updateCarouselState();
    this.editor.onOrderChange = (item, prevIndex, newIndex) => this.updateCarouselState();

    // Action items
    let selector = '#actionItems';
    let items = this.state.actionItems;
    this.actions = new components.actionItems.sortableList(selector, items);
    this.actions.onAddItems = () => this.updateActions();
    this.actions.onDeleteItem = () => this.updateActions();
    this.actions.onItemChange = () => this.updateActions();
    this.actions.onOrderChange = () => this.updateActions();

    document.querySelector('#actionItems .labels').innerHTML = 'Contact Information';
    document.querySelector('#actionItems a').innerHTML = 'Add Contact Information';

    // Set initial map height
    this.map.style.height = 0;

    // Mount map if address exists
    if (this.state.address.lat && this.state.address.lng) {
      this.mountMap(this.state.address);
    }
  }

  mountMap(address) {
    const { maps } = window.google;
    let defaultLocation = new maps.LatLng(address.lat, address.lng);
    let mapOptions = {
      zoom: 16,
      center: defaultLocation
    };
    this.map.style.height = '230px';
    this.mapInstance = new maps.Map(this.map, mapOptions);

    // Place a draggable marker on the map
    this.markerInstance = new maps.Marker({
      position: defaultLocation,
      map: this.mapInstance,
      draggable: true,
      title: 'Drag to choose a location'
    });

    // Handle makre drag
    maps.event.addListener(this.markerInstance, 'dragend', e => {
      let address = this.state.address;
      address.lat = e.latLng.lat();
      address.lng = e.latLng.lng();
      this.setState({ address });
    });
  }

  componentWillUpdate(nextProps, nextState) {
    const { address } = nextState;

    if (address.lat && address.lng && !this.mapInstance) {
      this.mountMap(address);
    }
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
  }

  onCategoryChange(e) {
    let { name, checked } = e.target;

    // Category was selected
    if (checked) {
      let { categories } = this.state;
      categories.push(name);
      this.setState({ categories });

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
      multiSelection: false
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
      lng: place.geometry.location.lng()
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
    if (e.target.value === '') {
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
    if (typeof this.state.address !== 'object') return;
    this.props.onSubmit(this.state);
  }

  onAutoKeyUp(e) {
    let keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  imageHandler(image, callback) {
    const range = this.quillRef.getEditor().getSelection();
    Buildfire.notifications.prompt({
      message: 'What is the image URL'
    }, (value) => {
      if (value) {
        value = `https://czi3m2qn.cloudimg.io/cdn/n/n/${value}`;
        this.quillRef.getEditor().insertEmbed(range.index, 'image', value, 'user');
      }
    });
  }

  modules = {
    imageResize: {},
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        [{ color: [] }, { background: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        [{ align: [] }],
        [{'indent': '-1'}, {'indent': '+1'}],
        [{ color: [] }, { background: [] }],
        ['link', 'image', 'video']
      ],
      handlers: {
        image: this.imageHandler.bind(this)
      },
    },
  }

  render() {
    const { title, address, description, image, categories, subtitle } = this.state;

    return (
      <form onSubmit={ e => this.onSubmit(e) } onKeyPress={ e => this.onAutoKeyUp(e) }>

        <div className='form-group'>
          <label htmlFor='name'>Title</label>
          <input
            maxLength={ 60 }
            onChange={ e => this.onInputChange(e) }
            value={ title }
            name='title'
            type='text'
            className='form-control' />
        </div>

        <div className='form-group'>
          <label htmlFor='subtitle'>Subtitle</label>
          <input
            maxLength={ 90 }
            onChange={ e => this.onInputChange(e) }
            value={ subtitle }
            name='subtitle'
            className='form-control'
            placeholder='Optional'
            type='text'/>
        </div>

        <div className='form-group'>
          <label htmlFor='category'>Categories</label>
          <div className='row'>
            { this.props.categories ? this.props.categories.map((category, index) => (
              <div key={ index } className='col-xs-3'>
                <input
                  onChange={ e => this.onCategoryChange(e) }
                  type='checkbox'
                  name={ category.id }
                  checked={ categories.indexOf(category.id) > -1 } />
                &nbsp;
                <label>{ category.name }</label>
              </div>
            )) : null }
          </div>
        </div>

        <div className='form-group autocomplete-container'>
          <label htmlFor='address'>Address</label>
          <input
            key='address-input'
            onChange={ e => this.onAddressChange(e) }
            ref={ n => this.addressInput = n }
            value={ address.name
              ? address.name
              : address.lat && address.lng
                ? `${address.lat}, ${address.lng}`
                : address.name }
            type='text'
            className='form-control' />
        </div>

        <div
          className='form-group'>
          <div id='map' ref={n => this.map = n} />
        </div>

        <div className='form-group'>
          <label htmlFor='description'>Description</label>
          <div className='editor' style={{ height: '200px' }}>
            <ReactQuill
              ref={ n => this.quillRef = n }
              modules={ this.modules }
              onChange={ value => this.onDescriptionChange(value) }
              defaultValue={ description } />
          </div>
        </div>

        <br />

        <div className='form-group'>
          <div id='actionItems' />
        </div>

        <div className='form-group'>
          <div id='carousel' />
        </div>

        <div className='form-group'>
          <label>List Image</label>
          <div
            style={{ backgroundImage: image ? `url(${image})` : '' }}
            className='image-dialog'
            onClick={ () => this.showImageDialog() }>
            { this.state.image ? null : <a>Add Image +</a> }
          </div>
        </div>

        <div className='form-group'>
          <button
            disabled={ !title.length || !description.length || !address || !address.lat || !address.lng }
            type='submit'
            className='btn btn-primary'>
            { this.props.location ? 'Save Location' : 'Save Location' }
          </button>
        </div>

      </form>
    );
  }
}

export default LocationForm;
