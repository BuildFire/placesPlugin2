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
    console.log(this.props.places);
    this.props.places.forEach((place, index) => {
      if (!place.address || !place.address.lat || !place.address.lng) {
        this.props.places.splice(index, 1);
      }
    });

    const DragHandle = SortableHandle(() =>
      <img
        className='handle'
        src='assets/img/handle.png'
        alt='Drag & Drop'/>);

    const SortableItem = SortableElement(({ value }) => (
      <div className="sortable-item">
        <DragHandle />
        <span className="titles">
          {value.place.title.length > 18
            ? value.place.title.substring(0, 18).trim() + "..."
            : value.place.title}
        </span>
        <span className="titles secondary">
          {value.place.address.name
            ? value.place.address.name.length > 35
              ? value.place.address.name.substring(0, 35).trim() + "..."
              : value.place.address.name
            : value.place.address.lat !== null &&
              value.place.address.lng !== null
            ? parseFloat(value.place.address.lat.toFixed(10)) +
              ", " +
              parseFloat(value.place.address.lng.toFixed(10))
            : ""}
        </span>
        <span className="edit">
          <a onClick={() => this.onEditDidClick(value.index)}>Edit</a>
        </span>
        <span
          className="copy btn-icon btn-link-icon btn-primary"
          onClick={() => this.props.copyToClipboard(value.place.id)}
          onMouseOut={() => this.props.onHoverOut(value.place.id)}
        >
          <span className="tooltiptext" id={`tool-tip-text--${value.place.id}`}>
            Copy Query String
          </span>
        </span>
        <span
          className="delete btn-icon btn-delete-icon btn-danger transition-third"
          onClick={() => this.props.handleDelete(value.index)}
        />
      </div>
    ));

    const SortableList = SortableContainer(({items}) => {
      var manualSort = function(a, b) {
          if (a.sort < 0 || b.sort < 0) return 1;
          if(a.sort < b.sort)
              return -1;
          if(a.sort > b.sort)
              return 1;

          return 0;
      };

      let list = items.sort(manualSort).map((value, index) => (
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
