import buildfire from 'buildfire';
import React from 'react';
import PlacesInput from './PlacesInput';

class Content extends React.Component {
  constructor(props) {
    super(props);
    this.PLACES_TAG = 'places';
    this.state = {
      list: [],
      categories: [],
      sortBy: 'manual',
      defaultView: 'map',
    }
  }

  componentWillMount() {
    buildfire.datastore.get(this.PLACES_TAG, (err, result) => {
      if (err) return console.error(err);
      this.setState({ list: result.data.places || [] });
    });
  }

  handleSave() {
    buildfire.datastore.save(this.state, 'places', (err) => {
      if (err) console.error(err);
    });
  }

  onLocationSubmit(location) {
    const { list } = this.state;
    list.push(location);
    this.setState({ list });

    this.handleSave();
  }

  render() {
    return (
      <div>
        <PlacesInput
          onSubmit={ (location) => this.onLocationSubmit(location) } />

      </div>
    );
  }
}

export default Content;
