import React from 'react';

class PlacesInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: ''
    }
  }

  /**
   * Mount the google places autocomplete when the node is ready
   */
  componentDidMount() {
    this.autocomplete = new window.google.maps.places.Autocomplete(this.input);
    this.autocomplete.addListener('place_changed', () => this.onPlaceChanged());
  }

  /**
   * Handle changes in the location autocomplete input.
   *
   * @desc This function calls the 'onSubmit' property function to update
   * its parent and handle saving
   */
  onPlaceChanged() {
    const place = this.autocomplete.getPlace();

    if (place.geometry) {

      const location = {
        title: this.state.title,
        address: {
          name: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }
      };

      this.props.onSubmit(location);
      this.input.value = '';
      this.setState({ title: '' });
    }
  }

  render() {
    return (
      <div className='row'>
        <div className='col-xs-12'>
          <h3>Add Location</h3>
        </div>
        <form>
          <div className='col-xs-6'>
            <div className='form-group'>
              <input
                type='text'
                placeholder='Location Title'
                value={ this.state.title }
                onChange={ e => this.setState({ title: e.target.value }) }
                className='form-control' />
            </div>
          </div>
          <div className='col-xs-6'>
            <div className='form-group'>
              <input
                type='text'
                placeholder='Location Address'
                ref={ n => this.input = n }
                className='form-control' />
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default PlacesInput;
