import React from 'react';
import LocationForm from './LocationForm';

class AddLocation extends React.Component {

  onSubmit(data) {
    // Set a unique ID for filering and DOM manipulation
    data.id = Math.floor((1 + Math.random()) * 0x10000000);
    this.props.onSubmit(data);
  }

  render() {
    return <LocationForm
      categories={ this.props.categories }
      onSubmit={ data => this.onSubmit(data) } />;
  }
}

export default AddLocation;
