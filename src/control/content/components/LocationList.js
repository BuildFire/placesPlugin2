import React from 'react';

const PlacesList = (props) => {
  if (!props.places) return null;

  return props.places.length ? (
    <table className='table table-striped'>
      <tbody>
        { props.places.map((place, index) => (
          <tr key={ index }>
            <td>{ place.title }</td>
            <td>{ place.address.name }</td>
            <td className='action'>
              <span>
                <img
                  className='delete'
                  onClick={ () => props.handleDelete(index) }
                  src='assets/svg/icon.svg' />
              </span>
            </td>
          </tr>
        )) }
      </tbody>
    </table>
  ) : (
    <img className='empty-state' src='assets/svg/empty.svg'/>
  );
};

export default PlacesList;
