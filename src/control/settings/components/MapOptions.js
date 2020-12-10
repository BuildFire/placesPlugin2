import React from 'react';

class MapOptions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonPressed: false,
    };
  }

  onChange(e) {
    this.props.onChange({
      name: e.target.name,
      value: e.target.value
    });
  }
  onBookmarkChange() {
    this.props.onBookmarkChange();
  }

  onCarouselChange() {
    this.props.onCarouselChange();
  } 

  onCategoriesChange() {
    this.props.onCategoriesChange();
  }

  onAllowDirectionsChange() {
    this.props.onAllowDirectionsChange();
  }

  onAllowContactChange() {
    this.props.onAllowContactChange();
  }

  onChatWithLocationOwnerChange() {
    this.props.onChatWithLocationOwnerChange();
  }

  openPluginDialog = () => {
    this.setState({
      buttonPressed: true,
    });

    window.buildfire.pluginInstance.showDialog({}, (error, response) => {
      console.log(error, response);
      if (response && response.length > 0) {
        const socialWall = {
          folderName: response[0].folderName,
          pluginTypeId: response[0].pluginTypeId,
          title: response[0].title,
          instanceId: response[0].instanceId,
          pluginTypeName: response[0].pluginTypeName,
          iconUrl: response[0].iconUrl,
        };
        console.log(socialWall);
        this.props.setSocialWall(socialWall);
      }
      this.setState({
        buttonPressed: false,
      });
    });  }


  removePlugin() {
    this.props.removePlugin();
  }

  render() {
    const active = { backgroundColor: '#00a1f1', color: '#ffffff', border: 'none' };
    console.log('props map options',this.props.options)
    return (
      <div className="col-xs-12">
        <form>
          <div className="row">
            <div className="col-xs-6">
              <label>Sort Places By</label>
            </div>
            <div className="col-xs-6">
              <div className="dropdown">
                <img src="assets/img/down-chevron.png" className="chev" />
                <select
                  name="sortBy"
                  className="form-control"
                  value={this.props.options.sortBy}
                  onChange={(e) => this.onChange(e)}
                >
                  <option value="alpha">Alphabetical</option>
                  <option value="alphaDesc">Reverse Alphabetical</option>
                  <option value="manual">Manual</option>
                  <option value="distance">Nearest to current location</option>
                </select>
              </div>
            </div>
          </div>

          <br />

          <div className="row">
            <div className="col-xs-6">
              <label>Set Default View</label>
            </div>
            <div className="col-xs-6">
              <div className="dropdown">
                <img src="assets/img/down-chevron.png" className="chev" />
                <select
                  name="defaultView"
                  value={this.props.options.defaultView}
                  className="form-control"
                  onChange={(e) => this.onChange(e)}
                >
                  <option value="map">Map</option>
                  <option value="list">List</option>
                </select>
              </div>
            </div>
          </div>

          <br />

          <div className="row">
            <div className="col-xs-6">
              <label>Show Points Of Interest On Map</label>
            </div>
            <div className="col-xs-6">
              <div className="dropdown">
                <img src="assets/img/down-chevron.png" className="chev" />
                <select
                  value={this.props.options.pointsOfInterest}
                  name="pointsOfInterest"
                  className="form-control"
                  onChange={(e) => this.onChange(e)}
                >
                  <option value="on">On</option>
                  <option value="off">Off</option>
                </select>
              </div>
            </div>
          </div>

          <br />

          <div className="row">
            <div className="col-xs-6">
              <label>Allow Users To Bookmark Places</label>
            </div>
            <div className="col-xs-6">
              <div className="Toggler">
                <div
                  className="Toggler__on"
                  style={this.props.configBookmark ? active : null}
                  onClick={() => this.onBookmarkChange()}
                >
                  On
                </div>
                <div
                  className="Toggler__off"
                  style={!this.props.configBookmark ? active : null}
                  onClick={() => this.onBookmarkChange()}
                >
                  Off
                </div>
              </div>
            </div>
          </div>

          <br />

          <div className="row">
            <div className="col-xs-6">
              <label>
                Move Image Carousel To The Top Of The Location's Details Page
              </label>
            </div>
            <div className="col-xs-6">
              <div className="Toggler">
                <div
                  className="Toggler__on"
                  style={this.props.configCarousel ? active : null}
                  onClick={() => this.onCarouselChange()}
                >
                  On
                </div>
                <div
                  className="Toggler__off"
                  style={!this.props.configCarousel ? active : null}
                  onClick={() => this.onCarouselChange()}
                >
                  Off
                </div>
              </div>
            </div>
          </div>

          <br />

          <div className="row">
            <div className="col-xs-6">
              <label>Show Category On Places Details Page</label>
            </div>
            <div className="col-xs-6">
              <div className="Toggler">
                <div
                  className="Toggler__on"
                  style={this.props.configCategories ? active : null}
                  onClick={() => this.onCategoriesChange()}
                >
                  On
                </div>
                <div
                  className="Toggler__off"
                  style={!this.props.configCategories ? active : null}
                  onClick={() => this.onCategoriesChange()}
                >
                  Off
                </div>
              </div>
            </div>
          </div>

          <br />

          <div className="item clearfix row">
            <div className="col-xs-6">
              <div>
                Add Chat With Location Owner
                <div className="settingsTooltip social-wall">
                  <span className="tip btn-info-icon btn-primary transition-third" />
                  <span className="settingsTooltiptext socialWall">
                    To add a location owner to each location turn this toggle
                    "On", connect Premium Social Wall 2.0, and in the Location
                    Details page of each location, add a location owner's email
                    address
                  </span>
                </div>
              </div>
            </div>
            <div className="col-xs-6">
              <div className="Toggler">
                <div
                  className="Toggler__on"
                  style={this.props.chatWithLocationOwner ? active : null}
                  onClick={() => this.onChatWithLocationOwnerChange()}
                >
                  On
                </div>
                <div
                  className="Toggler__off"
                  style={!this.props.chatWithLocationOwner ? active : null}
                  onClick={() => this.onChatWithLocationOwnerChange()}
                >
                  Off
                </div>
              </div>
            </div>
          </div>

          <br />

          {this.props.chatWithLocationOwner && (
            <div className="row">
              <div className="col-xs-6">
                <label>Select Chat</label>
              </div>
              <div className="col-xs-6 socialwall-container">
                <button
                  disabled={this.state.buttonPressed}
                  onClick={this.openPluginDialog}
                  className="btn btn-success"
                >
                  Connect Social Wall
                </button>
                {this.props.options.socialWall &&
                  this.props.options.socialWall.instanceId && (
                    <div className="socialwall-info">
                      <div className="socialwall-info-title">
                        <img src={this.props.options.socialWall.iconUrl} />
                        <label>
                          {this.props.options.socialWall.pluginTypeName}
                        </label>
                      </div>
                      <span
                        onClick={() => this.removePlugin()}
                        className="socialwall-close delete btn-icon btn-delete-icon btn-danger transition-third"
                      ></span>
                    </div>
                  )}
              </div>
            </div>
          )}
        </form>
      </div>
    );
  }
}

export default MapOptions;
