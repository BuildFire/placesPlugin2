import React from 'react';
import csv from 'csv-js';

class LocationsActionBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addingLocation: false
    }
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

  onAddLocation() {
    this.props.onAddLocation();
    this.setState({ addingLocation: true })
  }

  onAddLocationCancel() {
    this.props.onAddLocationCancel();
    this.setState({ addingLocation: false });
  }

  onFileChange() {
    const file = this.fileInput.files[0]
    const reader = new FileReader();
    reader.onload = e => {
      const rows = csv.parse(e.target.result);
      const locations = rows.map(row => ({
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

  handleTemplateDownload() {
    const rows = [['name','address_name','address_lat','address_lng']]
    let csvContent  = 'data:text/csv;charset=utf-8,';
    rows.forEach(row => csvContent += row.join(',') + '\r\n');

    const encodedURI = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedURI);
    link.setAttribute('download', 'places_template.csv');
    document.body.appendChild(link);
    link.click();
  }

  render() {
    return (
      <div>
        <div className='row'>
          <div className='col-xs-6'>
            <div className='button-group'>
              { this.state.addingLocation ? (
                <button
                  className='btn btn-danger'
                  onClick={ () => this.onAddLocationCancel() }>
                  Cancel
                </button>
              ) : (
                <button
                  className='btn btn-success'
                  onClick={ () => this.onAddLocation() }>
                  Add Location
                </button>
              ) }
            </div>
          </div>
          <div className='col-xs-6'>
            <input
              onChange={ () => this.onFileChange() }
              ref={ n => this.fileInput = n }
              type='file'
              id='csv'
              accept='.csv' />
            <div className='button-group right'>
              <label
                className='btn btn-success'
                htmlFor='csv'>
                Import CSV
              </label>
              <button
                onClick={ this.handleTemplateDownload }
                className='btn btn-primary template'>
                CSV Template
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LocationsActionBar;
