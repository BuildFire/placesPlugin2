import React from 'react';
import buildfire from 'buildfire';

import CategoryListItem from './CategoryListItem';
import { SearchTableHelper } from '../buildfire/searchTable/searchTableHelper';

const searchTableConfig = {
  options: {
    showEditButton: true,
    showDeleteButton: true
  },
  columns: [
    {
      header: "Name",
      data: "${data.name}",
      type: "string",
      width: "70%"
    }
  ]

};
class CategoriesList extends React.Component {
  constructor(props) {
    super(props);
    this.searchTableConfig = searchTableConfig;
    this.state = {
      name: '',
      searchText: '',
      isEditing: true
    };

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleAddItem = this.handleAddItem.bind(this);
  }

  componentDidMount() {
    this.searchTable = new SearchTableHelper("searchResults", "places", this.searchTableConfig);
    
    this.searchTable.onEditRow = (obj, tr) => { 
      this.setState({ isEditing: true });
      
      this.showModal();
      this.setState({ name: obj.name });

      const submitBtn = document.getElementById("submitBtn");
      submitBtn.innerHTML = "Save changes";

    };

    this.searchTable.onSearchResult = (results) => {
      if (results && results[0].data && results[0].data.categories) {
        let categories = [];
        categories.push(...results[0].data.categories.map(res => {
          res.data = {};
          res.data.id = res.id;
          res.data.name = res.name;
          return res;
          })
        );

        return categories;
      }
    };

    this.searchTable.search();
    // this.search();
  }

  // search() {
  //   const searchQuery = {
  //     $and: [],
  //   };

  //   if(this.state.searchText && this.state.searchText.length > 2){
  //     searchQuery.$and.unshift({
  //       '$json.name': {
  //         $regex: this.state.searchText,
  //         $options: 'i',
  //       },
  //     });
  //   }
  //   this.searchTable.search(searchQuery);
  //   console.log(searchQuery);
  // }
  
  showModal() {
    const dialog = document.getElementById("dialog");
    dialog.classList.add("activeDialog");
    dialog.classList.remove("hide");

    const tableOptions = document.getElementById("searchCriteria");
    tableOptions.classList.add("tableHidden");

    const table = document.getElementById("searchResults");
    table.classList.add("tableHidden");
  }

  onChange(e) {
    this.setState({ name: e.target.value });
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.name);
    this.setState({ name: '' });
    
    this.hideModal();
    this.searchTable.search();
  }

  handleAddItem() {
    this.setState({ isEditing: false });

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.innerHTML = "Add Category";
    this.showModal();
  }

  handleRenameCategory() {
    const { categories } = this.props;
    console.log(">>>>>>>>>>>>", categories);
    // this.props.handleRename();
  }

  hideModal() {
    this.setState({ name: '' });

    const dialog = document.getElementById("dialog");
    dialog.classList.remove("activeDialog");
    dialog.classList.add("hide");

    const tableOptions = document.getElementById("searchCriteria");
    tableOptions.classList.remove("tableHidden");

    const table = document.getElementById("searchResults");
    table.classList.remove("tableHidden");
  }

  render() {
    const { isEditing } = this.state;
    return (
      <div className="col-xs-12">
        <div id="searchCriteria">
          <div className="form-group form-buttons-input">
            <button type="button" id="btnAdd" className="btn btn-success" onClick={this.handleAddItem}>
              <span className="icon icon-plus"/>Add
              </button>
            <div className="input-group">
              <input onChange={event=> this.setState({searchText:event.currentTarget.value})} type="text" className="form-control" placeholder="Search by category name" />
              <span className="input-group-btn">
                <button onClick={this.search}  className="btn btn-info"><span className="icon icon-magnifier"/></button>
              </span>
            </div>
          </div>
        </div>
        
        <table id="searchResults" className="table table-striped " /> 
        <div id="dialog" className="hide page">
          <div className='row'>
            <div className="col-xs-12">
              <form id="submitForm" onSubmit={isEditing? () => this.handleRenameCategory : (e) => this.onSubmit(e)}>
                <div className='col-xs-6'>
                  <div className='control-group'>
                    <input
                      onChange={(e) => this.onChange(e)}
                      type='text'
                      value={this.state.name}
                      className='form-control'
                      placeholder='Category Name' />
                  </div>
                </div>
                <div className='col-xs-3'>
                  <button id="submitBtn" href='#' className='btn btn-block btn-success' type='submit'>
                    Add Category
              </button>
                </div>
                <div className='col-xs-3'>
                  <button href='#' className='btn btn-block btn-danger' type='button' onClick={this.hideModal}>
                    Cancel
              </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* <div className='row'>
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
          <div className='__strippedTable'>
            { categories.map((category, index) => (
              <CategoryListItem
                handleRename={ (newValue) => this.props.handleRename(index, newValue) }
                handleDelete={ () => this.props.handleDelete(index) }
                category={ category }
                key={ index } />
            )) }
          </div>
        ) : <img src='assets/img/empty-wireframe.jpg' className='empty-state'/> } */}
      </div>
    );
  }
}

export default CategoriesList;
