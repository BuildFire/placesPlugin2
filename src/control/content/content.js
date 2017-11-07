import buildfire from 'buildfire';
import React from 'react';
import PlacesInput from './components/PlacesInput';
import PlacesList from './components/PlacesList';

class Content extends React.Component {
  constructor(props) {
    super(props);
    this.PLACES_TAG = 'places';
    this.state = {
      places: [],
      categories: [],
      sortBy: 'manual',
      defaultView: 'map',
    }
  }

  componentWillMount() {
    buildfire.datastore.get(this.PLACES_TAG, (err, result) => {
      if (err) return console.error(err);
      this.setState({ places: result.data.places || [] });
    });
  }

  handleSave() {
    buildfire.datastore.save(this.state, 'places', (err) => {
      if (err) console.error(err);
    });
  }

  handleDelete(index) {
    const { places } = this.state;
    places.splice(index, 1);
    this.setState({ places });
    this.handleSave();
  }

  onLocationSubmit(location) {
    const { places } = this.state;
    places.push(location);
    this.setState({ places });

    this.handleSave();
  }

  render() {
    const { places } = this.state;

    return (
      <div>
        <PlacesInput
          onSubmit={ (location) => this.onLocationSubmit(location) } />
        <PlacesList
          places={ places }
          handleDelete={ (index) => this.handleDelete(index) }/>
      </div>
    );
  }
}

export default Content;
