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

  /**
   * Handle state saving to the datastore
   */
  handleSave() {
    buildfire.datastore.save(this.state, 'places', (err) => {
      if (err) console.error(err);
    });
  }

  /**
   * Handle a deletion of a location index
   *
   * @param   {Number} index Location index on places array
   */
  handleDelete(index) {
    const { places } = this.state;
    places.splice(index, 1);
    this.setState({ places });
    this.handleSave();
  }

  /**
   * Handle a location submission and save to datastore
   *
   * @param   {Object} location Location object
   */
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
