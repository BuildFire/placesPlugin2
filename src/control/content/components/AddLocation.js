import React from 'react';
import LocationForm from './LocationForm';

class AddLocation extends React.Component {

  onSubmit(data) {
    this.props.onSubmit(data);
  }

  render() {
    return <LocationForm
      chatWithLocationOwner={this.props.chatWithLocationOwner}
      socialWall={this.props.socialWall}
      pointsOfInterest = { this.props.pointsOfInterest }
      categories={ this.props.categories }
      onSubmit={ data => this.onSubmit(data) } />;
  }
}

export default AddLocation;
