import buildfire from 'buildfire';
import React from 'react';
import orderBy from 'lodash/orderBy';
import debounce from './lib/debounce';
import MapOptions from './components/MapOptions';

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {}
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
   * Handle map option changes
   *
   * @param   {Object} option Option object as { name, value }
   */
  handleOptionChange = (option) => {
    const { data } = this.state;
    data[option.name] = option.value;

    if (option.name === 'sortBy') {
      if (option.value === 'alpha') {
          data.places = orderBy(data.places, [place => place.title.toLowerCase()], 'asc');
      } else if (option.value === 'alphaDesc') {
        data.places = orderBy(data.places, [place => place.title.toLowerCase()], 'desc');
      }
    }

    this.setState(data);
    this.handleSave();
  }

  render() {
    return (
      <div>
        <MapOptions
          options={ this.state.data }
          onChange={ this.handleOptionChange } />
      </div>
    );
  }
}

export default Settings;
