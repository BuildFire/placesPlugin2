import React from 'react';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';

class PlacesList extends React.Component {
  constructor(props) {
    super(props);
  }

  onEditDidClick(index) {
    this.props.handleEdit(index);
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    const places = arrayMove(this.props.places, oldIndex, newIndex);
    places.forEach((place, index) => place.sort = index);
    this.props.updateSort(places);
  }

  render() {
    if (!this.props.places) return null;

    const SortableItem = SortableElement(({ value }) => (
      <tr>
        <td>{ value.place.title }</td>
        <td>{ value.place.address.name }</td>
        <td>
          <a onClick={ () => this.onEditDidClick(value.index) }>
            Edit
          </a>
        </td>
        <td className='action'>
          <span>
            <img
              className='delete'
              onClick={ () => this.props.handleDelete(value.index) }
              src='assets/img/cross.png' />
          </span>
        </td>
      </tr>
    ));

    const SortableList = SortableContainer(({items}) => {
      let list = items.map((value, index) => (
        <SortableItem
          key={ index }
          index={ index }
          value={{ place: value, index }} />
      ));
      return <ul>{ list }</ul>;
    });

    return this.props.places.length ? (
      <SortableList
        onSortEnd={ this.onSortEnd }
        items={ this.props.places }/>
    ) : (
      <img className='empty-state' src='assets/svg/empty.svg'/>
    );
  }
}

export default PlacesList;
