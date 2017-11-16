import buildfire from 'buildfire';
import React from 'react';
import debounce from './lib/debounce';
import LocationsActionBar from './components/LocationsActionBar';
import LocationList from './components/LocationList';
import CategoriesList from './components/CategoriesList';
import AddLocation from './components/AddLocation';

class Content extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      addingLocation: false
    };
  }

  componentWillMount() {
    buildfire.datastore.get('places', (err, result) => {
      if (err) return console.error(err);
      this.setState({ data: result.data });
    });
  }

  /**
   * Handle state saving to the datastore
   */
  handleSave = debounce(() => {
    buildfire.datastore.save(this.state.data, 'places', (err) => {
      if (err) console.error(err);
    });
  }, 600)

  /**
   * Handle a deletion of a location index
   *
   * @param   {Number} index Location index on places array
   */
  handleLocationDelete(index) {
    const { places } = this.state.data;
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
    let { categories } = this.state.data;
    categories = categories || [];
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
    const {data } = this.state;
    data.places.push(location);
    this.setState({ data });
    this.handleSave();
  }

  /**
   * Handle multiple location submissions (such as csv imports)
   *
   * @param   {Object} locations Locations array
   */
  onMultipleLocationSubmit(locations) {
    const { data} = this.state;
    locations.forEach(location => data.places.push(location));
    this.setState({ data });
    this.handleSave();
  }

  /**
   * Handle category submission
   *
   * @param   {String} category Category name
   */
  onCategorySubmit(category) {
    const { data } = this.state;
    data.categories = data.categories || [];
    data.categories.push(category);
    this.setState({ data });
    this.handleSave();
  }

  onAddLocation() {
    this.setState({ addingLocation: true });
  }

  onAddLocationCancel() {
    this.setState({ addingLocation: false });
  }

  render() {
    const { data, addingLocation } = this.state;

    return (
      <div>
        <div className='row'>
          <CategoriesList
            categories={ data.categories }
            handleDelete={ (index) => this.handleCategoryDelete(index) }
            onSubmit={ (category) => this.onCategorySubmit(category) } />
        </div>
        <div className='row'>
          <div className='col-xs-12'>
            <LocationsActionBar
              onAddLocation={ () => this.onAddLocation() }
              onAddLocationCancel={ () => this.onAddLocationCancel() }
              onMultipleSubmit={ (locations) => this.onMultipleLocationSubmit(locations) } />

            { addingLocation
                ? <AddLocation />
                : <LocationList
                    places={ data.places }
                    handleDelete={ (index) => this.handleLocationDelete(index) }/> }
          </div>
        </div>
      </div>
    );
  }
}

export default Content;
