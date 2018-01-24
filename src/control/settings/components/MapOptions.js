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
      <div className='col-xs-12'>
        <h3>Options</h3>
        <form>

            <div className='row'>
              <div className='col-xs-6'>
                <label>Sort Order</label>
              </div>
              <div className='col-xs-6'>
                <div className='dropdown'>
                  <img src='assets/img/down-chevron.png' className='chev'/>
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
              </div>
            </div>

          <br />

            <div className='row'>
              <div className='col-xs-6'>
                <label>Default View</label>
              </div>
              <div className='col-xs-6'>
                <div className='dropdown'>
                  <img src='assets/img/down-chevron.png' className='chev'/>
                  <select
                    name='defaultView'
                    value={ this.props.options.defaultView }
                    className='form-control'
                    onChange={ e => this.onChange(e) }>
                    <option value='map'>Map</option>
                    <option value='list'>List</option>
                  </select>
                </div>
              </div>
            </div>

        </form>
      </div>
    );
  }
}

export default MapOptions;
