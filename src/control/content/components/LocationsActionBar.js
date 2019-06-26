import React from 'react';
import csv from 'csv-js';
import CSVjs from 'comma-separated-values';

class LocationsActionBar extends React.Component {

  onAddLocation() {
    this.props.onAddLocation();
  }

  onAddLocationCancel() {
    this.props.onAddLocationCancel();
  }

  onFileChange() {
    const file = this.fileInput.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      const rows = csv.parse(e.target.result).slice(1);

      const promises = [];
      const locations = rows.map((row, index) => {
        if (!row[2] || !row[3]) {
          promises.push(
            new Promise((resolve, reject) => {
              const formattedAddress = row[1].replace(/,/g, '').replace(/ /g, '+');
              const url = `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBOp1GltsWARlkHhF1H_cb6xtdR1pvNDAk&address=${formattedAddress}`;

              fetch(url).then(response => response.json()).then(data => {
                const match = data.results[0];
                if (!match) return reject('invalid CSV row!', { address: row[1] });

                const { lat, lng } = match.geometry.location;
                resolve({
                  title: row[0],
                  address: {
                    name: row[1],
                    lat,
                    lng
                  },
                  description: row[4],
                  subtitle: row[5],
                  image: row[6],
                  index
                });
              });
            }).catch(() => undefined)
          );
        } else {
          return {
            title: row[0],
            address: {
              name: row[1],
              lat: parseFloat(row[2]),
              lng: parseFloat(row[3])
            },
            description: row[4],
            subtitle: row[5],
            image: row[6],
            index
          };
        }
      });
      if (!promises.length) {
        this.props.onMultipleSubmit(locations);
      } else {
        Promise.all(promises)
          .then(locs => {
            locs = [...locs, ...locations.filter(location => location)];
            const sortedLocs = locs.sort((a, b) => a.index > b.index ? 1 : -1);
            window.locs = locs;
            console.warn(locs, sortedLocs);
            this.props.onMultipleSubmit(locs);
          });
      }
    };
    reader.onerror = e => console.error('Error reading csv');
    reader.readAsText(file, 'UTF-8');
  }

  handleDataExport() {
    const rows = [];
    this.props.places.forEach(place => {
      rows.push({
        title: place.title,
        address: place.address.name,
        lat: place.address.lat,
        lng: place.address.lng,
        description: place.description || '',
        subtitle: place.subtitle || '',
        image: place.image || ''
      });
    });

    let csvContent = 'data:text/csv;charset=utf-8,';
    let encoded = new CSVjs(rows, { header: true }).encode();
    csvContent += encoded;


    const encodedURI = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedURI);
    link.setAttribute('download', 'places_export.csv');
    document.body.appendChild(link);
    link.click();
  }

  handleTemplateDownload() {
    const rows = [['name','address_name','address_lat','address_lng','description', 'subtitle', 'image']];
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
    const { addingLocation } = this.props;

    return (
      <div>
        <div className='row'>
          <div className='col-xs-4'>
            <div className='button-group'>
              { addingLocation ? (
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
          <div className='col-xs-8'>
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
                onClick={ () => this.handleDataExport() }
                className='btn btn-primary template'>
                Export CSV
              </button>
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
