import React from 'react';

class PlacesList extends React.Component {
  constructor(props) {
    super(props);
  }

  onEditDidClick(index) {
    this.props.handleEdit(index);
  }

  render() {
    if (!this.props.places) return null;

      return this.props.places.length ? (
        <table className='table table-striped'>
          <tbody>
            { this.props.places.map((place, index) => (
              <tr key={ index }>
                <td>{ place.title }</td>
                <td>{ place.address.name }</td>
                <td>
                  <a onClick={ () => this.onEditDidClick(index) }>
                    Edit
                  </a>
                </td>
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
      ) : (
        <img className='empty-state' src='assets/svg/empty.svg'/>
      );
  }
}

export default PlacesList;
