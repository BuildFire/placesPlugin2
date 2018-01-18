import React from 'react';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';

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

    const DragHandle = SortableHandle(() =>
      <img
        className='handle'
        src='assets/img/handle.png'
        alt='Drag & Drop'/>);

    const SortableItem = SortableElement(({ value }) => (
      <div className='sortable-item'>
        <DragHandle />
        <span className='titles'>{ value.place.title }</span>
        <span className='titles secondary'>{ value.place.address.name }</span>
        <span className='edit'>
          <a onClick={ () => this.onEditDidClick(value.index) }>
            Edit ({ value.index })
          </a>
        </span>
        <img
          className='delete'
          onClick={ () => this.props.handleDelete(value.index) }
          src='assets/img/cross.png' />
      </div>
    ));

    const SortableList = SortableContainer(({items}) => {
      let list = items.map((value, index) => (
        <SortableItem
          key={ index }
          index={ index }
          value={{ place: value, index }} />
      ));
      return <div className='unstyled'>{ list }</div>;
    });

    return this.props.places.length ? (
      <SortableList
        lockAxis='y'
        useDragHandle={ true }
        onSortEnd={ this.onSortEnd }
        items={ this.props.places }/>
    ) : (
      <img className='empty-state' src='assets/svg/empty.svg'/>
    );
  }
}

export default PlacesList;
