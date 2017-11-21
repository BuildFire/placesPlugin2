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

  render() {
    return (
      <div className='col-xs-6'>
        <h3>Map Options</h3>
        <form>

          <div className='control-group'>
            <label>Sort Order</label>
            <select
              name='sortBy'
              className='form-control'
              value={ this.props.options.sortBy }
              onChange={ e => this.onChange(e) }>
              <option value='alpha'>Alphabetical</option>
              <option value='alphaDesc'>Reverse Alphabetical</option>
              <option value='manual'>Manual</option>
            </select>
          </div>

          <br />

          <div className='control-group'>
            <label>Default View</label>
            <select
              name='defaultView'
              value={ this.props.options.defaultView }
              className='form-control'
              onChange={ e => this.onChange(e) }>
              <option value='map'>Map</option>
              <option value='list'>List</option>
            </select>
          </div>

        </form>
      </div>
    );
  }
}

export default MapOptions;
