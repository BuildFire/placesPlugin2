import React from 'react';

class CategoryListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false
    };
  }

  toggleEditing() {
    if (this.state.editing) {
      this.handleSave();
    } else {
      this.setState({
        newValue: this.props.category.name,
        editing: true
      });
      setTimeout(() => {
        this.editNode.focus();
      }, 30);
    }
  }

  onNameChange(e) {
    this.setState({ newValue: e.target.value });
  }

  cancelEditing() {
    this.setState({ editing: false });
  }

  handleSave() {
    this.props.handleRename(this.state.newValue);
    this.setState({ editing: false });
  }

  handleKeyPress(e) {
    if (e.keyCode === 13) {
      this.handleSave();
    }
  }

  render() {
    const { category } = this.props;
    const { editing, newValue } = this.state;

    return (
      <div className='__categoryListItem'>
        <div>
        { editing
          ? <input
            onChange={ e => this.onNameChange(e) }
            onKeyPress={ e => this.handleKeyPress(e) }
            ref={ n => this.editNode = n }
            className='edit-box'
            value={ newValue }
            type='text'/>
            : category.name}
        </div>
        <div>
          <div className='action-large __categoryEditBox'>
            { editing ? (
              <span>
                <a onClick={ () => this.toggleEditing() }>
                  Save
                </a>
                <a onClick={ () => this.cancelEditing() }>
                  Cancel
                </a>
              </span>
            )
            : (
              <a onClick={ () => this.toggleEditing() }>
                Edit
              </a>
            ) }
          </div>
          <div className="copyLinkCategory">
            <span className=" btn-icon btn-link-icon btn-success"
              onClick={() => this.props.copyToClipboard(category.id, "list")}
              onMouseOut={() => this.props.onHoverOut(category.id)}>
              <span className="tooltiptext" id={`tool-tip-text--${category.id, "list"}`}>Copy category list view Query String</span>
            </span>
          </div>
          <div className="copyLinkCategory">
            <span className=" btn-icon btn-link-icon btn-primary"
              onClick={() => this.props.copyToClipboard(category.id, "map")}
              onMouseOut={() => this.props.onHoverOut(category.id, "map")}>
              <span className="tooltiptext" id={`tool-tip-text--${category.id}`}>Copy category map view Query String</span>
            </span>
          </div>
          <div className='action'>
            <span>
              <img
                className='delete'
                onClick={ () => this.props.handleDelete() }
                src='assets/img/cross.png' 
              />
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default CategoryListItem;
