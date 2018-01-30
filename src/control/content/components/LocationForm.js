import Buildfire, { components } from 'buildfire';
import React from 'react';
import cloneDeep from 'lodash/cloneDeep';

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
      address: null,
      image: '',
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
    // Mount google map
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
  }

  onInputChange(e) {
    const changes = {};
    changes[e.target.name] = e.target.value;
    this.setState(changes);
  }

  onCategoryChange(e) {
    let { name, checked } = e.target;
    console.log({ name, checked });

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
      return this.setState({ address: null });
    }

    const address = {
      name: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };

    this.setState({ address });
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
            ref={ n => this.addressInput = n }
            value={ address ? address.name : '' }
            type='text'
            className='form-control' />
        </div>

        <div className='form-group'>
          <label htmlFor='description'>Description</label>
          <textarea
            value={ description }
            onChange={ e => this.onInputChange(e) }
            className='form-control'
            name='description'
            rows='3' />
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
            disabled={ !title.length || !description.length || !address }
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
