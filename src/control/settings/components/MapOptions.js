import React from 'react';

class MapOptions extends React.Component {
  constructor(props) {
    super(props);
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

  render() {
    const active = { backgroundColor: '#00a1f1', color: '#ffffff', border: 'none' };
    return (
      <div className='col-xs-12'>
        <form>

          <div className='row'>
            <div className='col-xs-6'>
            <label>Sort Places by</label>
            </div>
            <div className='col-xs-6'>
              <div className='dropdown'>
                <img src='assets/img/down-chevron.png' className='chev' />
                <select
                  name='sortBy'
                  className='form-control'
                  value={this.props.options.sortBy}
                  onChange={e => this.onChange(e)}>
                  <option value='alpha'>Alphabetical</option>
                  <option value='alphaDesc'>Reverse Alphabetical</option>
                  <option value='manual'>Manual</option>
                  <option value='distance'>Nearest to current location</option>
                </select>
              </div>
            </div>
          </div>

          <br />

          <div className='row'>
            <div className='col-xs-6'>
            <label>Set Default View</label>
            </div>
            <div className='col-xs-6'>
              <div className='dropdown'>
                <img src='assets/img/down-chevron.png' className='chev' />
                <select
                  name='defaultView'
                  value={this.props.options.defaultView}
                  className='form-control'
                  onChange={e => this.onChange(e)}>
                  <option value='map'>Map</option>
                  <option value='list'>List</option>
                </select>
              </div>
            </div>
          </div>

          <br />

          <div className='row'>
            <div className='col-xs-6'>
              <label>Show Points of Interest on Map</label>
            </div>
            <div className='col-xs-6'>
              <div className='dropdown'>
                <img src='assets/img/down-chevron.png' className='chev' />
                <select
                  value={this.props.options.pointsOfInterest}
                  name='pointsOfInterest'
                  className='form-control'
                  onChange={e => this.onChange(e)}>
                  <option value='on'>On</option>
                  <option value='off'>Off</option>
                </select>
              </div>
            </div>
          </div>
          
          <br />

          <div className='row'>
            <div className='col-xs-6'>
              <label>Allow Users to Bookmark Places</label>
            </div>
            <div className='col-xs-6'>
              <div className="Toggler">
                <div className="Toggler__on" style={this.props.configBookmark ? active : null} onClick={() => this.onBookmarkChange()}>On</div>
                <div className="Toggler__off" style={!this.props.configBookmark ? active : null} onClick={() => this.onBookmarkChange()}>Off</div>
              </div>
            </div>
          </div>
        </form>
      </div>

    );
  }
}

export default MapOptions;
