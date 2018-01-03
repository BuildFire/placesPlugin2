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
        <div className='row'>
          <form onSubmit={ (e) => this.onSubmit(e) }>
            <div className='col-xs-9'>
              <div className='control-group'>
                <input
                  onChange={ (e) => this.onChange(e) }
                  type='text'
                  value={ this.state.name }
                  className='form-control'
                  placeholder='Category Name' />
              </div>
            </div>
            <div className='col-xs-3'>
              <button href='#' className='btn btn-block btn-success' type='submit'>
                Add Category
              </button>
            </div>
          </form>
        </div>
        <br />
        { categories && categories.length ? (
          <table className='table table-striped'>
            <tbody>
              { categories.map((category, index) => (
                <tr key={ index }>
                  <td>{ category.name }</td>
                  <td className='action'>
                    <span>
                      <img
                        className='delete'
                        onClick={ () => this.props.handleDelete(index) }
                        src='assets/img/cross.png' />
                    </span>
                  </td>
                </tr>
              )) }
            </tbody>
          </table>
        ) : <img src='assets/img/empty-wireframe.jpg' className='empty-state'/> }
      </div>
    );
  }
}

export default CategoriesList;
