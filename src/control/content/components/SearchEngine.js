import { Component } from 'react';
import buildfire from 'buildfire';


class SearchEngine extends Component {

    static insert = (data, callback) => {
        buildfire.services.searchEngine.insert(data, (err, response) => {
            if (err) return callback(err);
            return callback(response);
        });
    }

    static save = (data, callback) => {
        buildfire.services.searchEngine.save(data, (err, response) => {
            if (err) return callback(err);
            return callback(response);
        });    
    }

    static update = (data) => {
        buildfire.services.searchEngine.update(data, (err, response) => {
            if (err) return console.log(err);
        });
    }

    static delete = (data) => {
        buildfire.services.searchEngine.delete(data, (err, response) => {
            if (err) return console.log(err);
        });
    }
}

export default SearchEngine;