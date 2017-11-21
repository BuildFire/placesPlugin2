import buildfire from 'buildfire';
import React from 'react';

class AddLocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      location: null,
      image: ''
    };
  }

  componentDidMount() {
    const { maps } = window.google;
    this.autocomplete = new maps.places.Autocomplete(this.addressInput);
    this.autocomplete.addListener('place_changed', () => this.onPlaceChanged());
  }

  onNameChange(e) {
    this.setState({ name: e.target.value });
  }

  onPlaceChanged() {
    const place = this.autocomplete.getPlace();
    if (!place.geometry) return;

    const location = {
      title: this.state.title,
      address: {
        name: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      }
    };

    this.setState({ location });
  }

  showImageDialog() {
    const dialogOptions = {
      showIcons: false,
      multiSelection: false
    };

    // Request user to select image
    buildfire.imageLib.showDialog(dialogOptions, (err, result) => {
      if (err) return console.error(err);

      // Stop if we don't have any images
      if (!result || !result.selectedFiles || !result.selectedFiles.length > 0) {
        return;
      }

      this.setState({ image: result.selectedFiles[0] });
    });
  }

  onSubmit(e) {
    e.preventDefault();
    const data = Object.assign({}, this.state.location);
    data.title = this.state.name;
    data.image = this.state.image;
    this.props.onSubmit(data);
  }

  render() {
    const { name, location, image } = this.state;

    return (
      <form onSubmit={ e => this.onSubmit(e) }>

        <div className='form-group'>
          <label htmlFor='name'>Name</label>
          <input
            onChange={ e => this.onNameChange(e) }
            type='text'
            id='name'
            className='form-control' />
        </div>

        <div className='form-group'>
          <label htmlFor='address'>Address</label>
          <input
            ref={ node => this.addressInput = node }
            type='text'
            id='address'
            className='form-control' />
        </div>

        <div className='form-group'>
          <label>Image</label>
          <div
            style={{ backgroundImage: image ? `url(${image})` : '' }}
            className='image-dialog'
            onClick={ () => this.showImageDialog() }>
            { this.state.image ? null : <a>Add Image +</a> }
          </div>
        </div>

        <div className='form-group'>
          <button
            disabled={ !name.length || !location }
            type='submit'
            className='btn btn-primary'>
            Add Location
          </button>
        </div>

      </form>
    );
  }
}

export default AddLocation;
