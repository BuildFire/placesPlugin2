import React from 'react';
import LocationForm from './LocationForm';

class EditLocation extends React.Component {
  constructor(props) {
    super(props);
  }

  onSubmit(data) {
    this.props.onSubmit(data);
  }

  render() {
    return <LocationForm
      pointsOfInterest = { this.props.pointsOfInterest }
      categories={ this.props.categories }
      location={ this.props.location }
      onSubmit={ data => this.onSubmit(data) } />;
  }
}

export default EditLocation;
