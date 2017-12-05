import buildfire from 'buildfire';
import React from 'react';

class AddLocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      description: '',
      address: null,
      image: ''
    };
  }

  componentDidMount() {
    const { maps } = window.google;
    this.autocomplete = new maps.places.Autocomplete(this.addressInput);
    this.autocomplete.addListener('place_changed', () => this.onPlaceChanged());
  }

  onInputChange(e) {
    const changes = {};
    changes[e.target.name] = e.target.value;
    this.setState(changes);
  }

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
    const { title, description, address, image } = this.state;
    const data = { title, description, address, image };
    this.props.onSubmit(data);
    this.setState({ title: '', description: '', address: null, image: '' });
  }

  render() {
    const { title, description, address, image } = this.state;

    return (
      <form onSubmit={ e => this.onSubmit(e) }>

        <div className='form-group'>
          <label htmlFor='name'>Title</label>
          <input
            onChange={ e => this.onInputChange(e) }
            name='title'
            type='text'
            className='form-control' />
        </div>

        <div className='form-group'>
          <label htmlFor='address'>Address</label>
          <input
            ref={ node => this.addressInput = node }
            type='text'
            className='form-control' />
        </div>

        <div className='form-group'>
          <label htmlFor='descritpion'>Description</label>
          <textarea
            onChange={ e => this.onInputChange(e) }
            className='form-control'
            name='description' rows='3' />
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

export default AddLocation;
