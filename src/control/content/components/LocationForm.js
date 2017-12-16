import Buildfire, { components } from 'buildfire';
import React from 'react';

class LocationForm extends React.Component {
  constructor(props) {
    super(props);
    let model = {
      title: '',
      description: '',
      address: null,
      image: '',
      carousel: []
    };
    this.state = Object.assign(model, props.location);
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

    // Mount carousel
    this.editor = new components.carousel.editor('#carousel');
    this.editor.onAddItems = (items) => this.updateCarouselState();
    this.editor.onDeleteItems = (items, index) => this.updateCarouselState();
    this.editor.onItemChange = (item) => this.updateCarouselState();
    this.editor.onOrderChange = (item, prevIndex, newIndex) => this.updateCarouselState();
  }

  onInputChange(e) {
    const changes = {};
    changes[e.target.name] = e.target.value;
    this.setState(changes);
  }

  /**
   * Handles updating the carousel state data
   */
  updateCarouselState() {
    const {items } = this.editor;
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
    if (!place.geometry) return;

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
    this.props.onSubmit(this.state);
  }

  render() {
    const { categories } = this.props;
    const { title, address, description, image } = this.state;

    return (
      <form onSubmit={ e => this.onSubmit(e) }>

        <div className='form-group'>
          <label htmlFor='name'>Title</label>
          <input
            onChange={ e => this.onInputChange(e) }
            value={ title }
            name='title'
            type='text'
            className='form-control' />
        </div>

        <div className='form-group'>
          <label htmlFor='category'>Category</label>
          <select name='category' className='form-control'>
            <option selected={ true } disabled={ true }>Select...</option>
            { categories ? categories.map((category, index) =>
              <option key={ index } value={ category }>
                { category }
              </option>
            ) : null }
          </select>
        </div>

        <div className='form-group'>
          <label htmlFor='address'>Address</label>
          <input
            ref={ node => this.addressInput = node }
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
            name='description' rows='3' />
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
            Add Location
          </button>
        </div>

      </form>
    );
  }
}

export default LocationForm;
