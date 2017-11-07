import React from 'react';

const PlacesList = (props) => {
  return (
    <table className='table table-striped'>
      <tbody>
        { props.places.map((place, index) => (
          <tr key={ index }>
            <td>{ place.title }</td>
            <td>{ place.address.name }</td>
            <td>
              <img
                className='delete'
                onClick={ () => props.handleDelete(index) }
                src='assets/svg/icon.svg' />
            </td>
          </tr>
        )) }
      </tbody>
    </table>
  );
};

export default PlacesList;
