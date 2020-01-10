import { Component } from 'react';
import buildfire from 'buildfire';


class SearchEngine extends Component {

    static insert = (data, callback) => {
        buildfire.services.searchEngine.insert(data, (err, response) => {
            if (err) return callback(err);
            console.log("Data insert", response);
            buildfire.deeplink.setData({id: response.id}, null, (err, res) => {
                if (err) return console.log(err);
                console.log(res);
            });
            return callback(response);
        });
    }

    static save = (data, callback) => {
        buildfire.services.searchEngine.save(data, (err, response) => {
            if (err) return callback(err);
            console.log("Data save", response);
            return callback(response);
        });    
    }

    static update = (data) => {
        buildfire.services.searchEngine.update(data, (err, response) => {
            if (err) return console.log(err);
            console.log("Data update", response);
        });
    }

    static delete = (data) => {
        buildfire.services.searchEngine.delete(data, (err, response) => {
            if (err) return console.log(err);
            console.log("Data delete", response);
        });
    }
}

export default SearchEngine;