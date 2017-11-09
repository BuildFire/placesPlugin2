import React from 'react';
import csv from 'csv-js';

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

  onFileChange() {
    let file = this.fileInput.files[0]
    let reader = new FileReader();
    reader.onload = e => {
      let rows = csv.parse(e.target.result);
      let locations = rows.map(row => ({
        title: row[0],
        address: {
          name: row[1],
          lat: parseFloat(row[2]),
          lng: parseFloat(row[3])
        }
      }));
      this.props.onMultipleSubmit(locations);
    }
    reader.onerror = e => console.error('Error reading csv');
    reader.readAsText(file, 'UTF-8');
  }

  render() {
    return (
      <div>
        <div className='row'>
          <div className='col-xs-6'>
            <h3>Add Location</h3>
          </div>
          <div className='col-xs-6'>
            <input
              onChange={ () => this.onFileChange() }
              ref={ n => this.fileInput = n }
              type='file'
              id='csv'
              accept='.csv' />
            <div className='button-group'>
              <label
                className='btn btn-success'
                htmlFor='csv'>
                Import CSV
              </label>
              <button
                className='btn btn-primary template'>
                CSV Template
              </button>
            </div>
          </div>
        </div>
        <div className='row'>
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
      </div>
    );
  }
}

export default PlacesInput;
