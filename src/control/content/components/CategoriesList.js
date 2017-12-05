import React from 'react';

class CategoriesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: ''
    };
  }

  onChange(e) {
    this.setState({ name: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.name);
    this.setState({ name: '' });
  }

  render() {
    const { categories } = this.props;

    return (
      <div className='col-xs-12'>
        <h3>Categories</h3>
        <form onSubmit={ (e) => this.onSubmit(e) }>
          <div className='control-group'>
            <input
              onChange={ (e) => this.onChange(e) }
              type='text'
              value={ this.state.name }
              className='form-control'
              placeholder='Category Name' />
          </div>
        </form>
        <br />
        { categories && categories.length ? (
          <table className='table table-striped'>
            <tbody>
              { categories.map((category, index) => (
                <tr key={ index }>
                  <td>{ category }</td>
                  <td className='action'>
                    <span>
                      <img
                        className='delete'
                        onClick={ () => this.props.handleDelete(index) }
                        src='assets/svg/icon.svg' />
                    </span>
                  </td>
                </tr>
              )) }
            </tbody>
          </table>
        ) : <img src='assets/svg/empty.svg' className='empty-state'/> }
      </div>
    );
  }
}

export default CategoriesList;
