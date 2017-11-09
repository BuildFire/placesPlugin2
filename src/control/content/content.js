import buildfire from 'buildfire';
import React from 'react';
import PlacesInput from './components/PlacesInput';
import PlacesList from './components/PlacesList';
import CategoriesList from './components/CategoriesList';
import MapOptions from './components/MapOptions';

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
      this.setState({
        places: result.data.places || [],
        categories: result.data.categories || [],
        defaultView: result.data.defaultView || 'map',
        sortBy: result.data.sortBy || 'manual'
      });
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
  handleLocationDelete(index) {
    const { places } = this.state;
    places.splice(index, 1);
    this.setState({ places });
    this.handleSave();
  }

  /**
   * Handle a deletion of a category index
   *
   * @param   {Number} index Location index on places array
   */
  handleCategoryDelete(index) {
    const { categories } = this.state;
    categories.splice(index, 1);
    this.setState({ categories });
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

  /**
   * Handle multiple location submissions (such as csv imports)
   *
   * @param   {Object} locations Locations array
   */
  onMultipleLocationSubmit(locations) {
    const { places } = this.state;
    locations.forEach(location => places.push(location));
    this.setState({ places });
    this.handleSave();
  }

  /**
   * Handle category submission
   *
   * @param   {String} category Category name
   */
  onCategorySubmit(category) {
    const { categories } = this.state;
    categories.push(category);
    this.setState({ categories });
    this.handleSave();
  }

  /**
   * Handle map option changes
   *
   * @param   {Object} option Option object as { name, value }
   */
  handleOptionChange(option) {
    const update = {};
    update[option.name] = option.value;
    this.setState(update);
    this.handleSave();
  }

  render() {
    const { places, categories } = this.state;

    return (
      <div>
        <div className='row'>
          <CategoriesList
            categories={ categories }
            handleDelete={ (index) => this.handleCategoryDelete(index) }
            onSubmit={ (category) => this.onCategorySubmit(category) } />
          <MapOptions
            options={ this.state }
            onChange={ (option) => this.handleOptionChange(option) } />
        </div>
        <div className='row'>
          <div className='col-xs-12'>
            <PlacesInput
              onMultipleSubmit={ (locations) => this.onMultipleLocationSubmit(locations) }
              onSubmit={ (location) => this.onLocationSubmit(location) } />
            <PlacesList
              places={ places }
              handleDelete={ (index) => this.handleLocationDelete(index) }/>
          </div>
        </div>
      </div>
    );
  }
}

export default Content;
