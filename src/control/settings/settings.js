import buildfire from 'buildfire';
import React from 'react';
import orderBy from 'lodash/orderBy';
import debounce from './lib/debounce';
import MapOptions from './components/MapOptions';

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      configBookmark: false,
      configCarousel: false,
      configCategories: false,
    };
  }

  componentWillMount() {
    buildfire.datastore.get('places', (err, result) => {
      if (err) return console.error(err);
      this.setState({ data: result.data, configBookmark: result.data.isBookmarkingAllowed, 
        configCarousel: result.data.isCarouselSwitched, configCategories: result.data.configCategories });
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
    if (option.name === 'pointsOfInterest') {
      if (option.value === 'off') {
        data.pointsOfInterest = "off";
      } else {
        data.pointsOfInterest = "on";
      } 
    }

    this.setState(data);
    this.handleSave();
  }

  handleBookmarkChange = () => {
    const { data } = this.state;
    this.setState({ configBookmark: !this.state.configBookmark }, () => {
      data.isBookmarkingAllowed = this.state.configBookmark;
      this.setState(data);
      this.handleSave();
    });
  }

  handleCarouselChange = () => {
    const { data } = this.state;
    this.setState({ configCarousel: !this.state.configCarousel }, () => {
      data.isCarouselSwitched = this.state.configCarousel;
      this.setState(data);
      this.handleSave();
    });
  }

  handleCategoriesChange = () => {
    const { data } = this.state;
    this.setState({ configCategories: !this.state.configCategories }, () => {
      data.configCategories = this.state.configCategories;
      console.log("AAA", this.state.configCategories)

      this.setState(data);
      this.handleSave();
    });
  }

  render() {
    return (
      <div>
        <MapOptions
          options={this.state.data}
          onChange={this.handleOptionChange}
          onBookmarkChange={this.handleBookmarkChange}
          onCarouselChange={this.handleCarouselChange}
          onCategoriesChange={this.handleCategoriesChange}
          configBookmark={this.state.configBookmark} 
          configCarousel={this.state.configCarousel} 
          configCategories={this.state.configCategories} />
      </div>
    );
  }
}

export default Settings;
