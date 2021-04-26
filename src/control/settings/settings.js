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
      chatWithLocationOwner: false,
      distanceUnit: true
    };
  }

  componentWillMount() {
    buildfire.datastore.get('places', (err, result) => {
      if (err) return console.error(err);
      this.setState({ 
        data: result.data,
        configBookmark: result.data.isBookmarkingAllowed, 
        configCarousel: result.data.isCarouselSwitched,
        configCategories: result.data.configCategories,
        chatWithLocationOwner: result.data.chatWithLocationOwner,
        distanceUnit: result.data.distanceUnit ? result.data.distanceUnit : false
      });
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

  handleDistanceChange = () => {
    const { data } = this.state;
    this.setState({ distanceUnit: !this.state.distanceUnit }, () => {
      data.distanceUnit = this.state.distanceUnit;
      this.setState(data);
      this.handleSave();
    });
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

      this.setState(data);
      this.handleSave();
    });
  }

  onChatWithLocationOwnerChange = () => {
    const { data } = this.state;
    this.setState({ chatWithLocationOwner: !this.state.chatWithLocationOwner }, () => {
      data.chatWithLocationOwner = this.state.chatWithLocationOwner;

      this.setState(data);
      this.handleSave();
    });
  }


  setSocialWall = (socialWall) => {
    const { data } = this.state;
    data.socialWall = socialWall;
    this.setState(data);
    this.handleSave();
  }

  removePlugin = () => {
    const { data } = this.state;
    data.socialWall = {};
    this.setState(data);
    this.handleSave();
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
          onDistanceChange={this.handleDistanceChange}
          onChatWithLocationOwnerChange={this.onChatWithLocationOwnerChange}
          configBookmark={this.state.configBookmark} 
          configCarousel={this.state.configCarousel} 
          configCategories={this.state.configCategories}
          distanceUnit={this.state.distanceUnit}
          chatWithLocationOwner={this.state.chatWithLocationOwner}
          setSocialWall={this.setSocialWall}
          removePlugin={this.removePlugin} />
      </div>
    );
  }
}

export default Settings;
