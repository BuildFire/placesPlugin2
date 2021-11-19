import React from 'react';
import csv from 'csv-js';
import CSVjs from 'comma-separated-values';
import uuidv4 from '../lib/uuidv4';
import ProgressBar from "./ProgressBar";
import buildfire from 'buildfire';


let percent;

class LocationsActionBar extends React.Component {
  onAddLocation() {
    this.props.onAddLocation();
  }

  onAddLocationCancel() {
    this.props.onAddLocationCancel();
  }

  onFileChange() {
    const file = this.fileInput.files[0];
    const reader = new FileReader();
    console.log(file);
    reader.onload = (e) => {
      const rows = csv.parse(e.target.result).slice(1);
      const { places } = this.props;
      const allCategories = Array.isArray(this.props.categories)
        ? this.props.categories
        : [];
      const promises = [];
      const categoriesToAdd = [];
      // loop through the csv rows
      const locations = rows.map((row, i) => {
        const [
          id,
          title,
          subtitle,
          categories,
          name,
          address_lat,
          address_lng,
          description,
          image,
        ] = row;
        console.log(locations);
        const selectedCategory = [];

        const cat = Number.isInteger(categories)
          ? categories.toString().replace(/, /g, ",")
          : categories.replace(/, /g, ",");
        const categoryArr = cat.split(",");
        categoryArr.some((catName) => {
          const foundCategory = allCategories.find(
            (cat) => cat.name === catName
          );
          const categoryExists = categoriesToAdd.find(
            (cat) => cat.name === catName
          );
          catName = catName.trim();
          if (!catName.length) return;
          if (!foundCategory && !categoryExists) {
            let category = {
              id: uuidv4(),
              name: catName,
            };
            selectedCategory.push(category.id);
            categoriesToAdd.push(category);
          } else {
            if (foundCategory) selectedCategory.push(foundCategory.id);
          }
        });
        // if a row is missing latitude or longitude
        // use google maps api to fetch them async
        // otherwise just return the location
        if (!address_lat || !address_lng) {
          promises.push(
            new Promise((resolve, reject) => {
              const formattedAddress = name
                .replace(/,/g, "")
                .replace(/ /g, "+");
              const url = `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBOp1GltsWARlkHhF1H_cb6xtdR1pvNDAk&address=${formattedAddress}`;
              // get geodata from google api
              fetch(url)
                .then((response) => response.json())
                .then((data) => {
                  const match = data.results[0];
                  if (!match) return reject("invalid CSV row!", { name });
                  const { lat, lng } = match.geometry.location;
                  resolve({
                    id,
                    title:
                      typeof title === "number"
                        ? title.toString()
                        : title || "Untitled Location",
                    subtitle,
                    categories: selectedCategory,
                    address: {
                      name,
                      lat,
                      lng,
                    },
                    description,
                    image,
                    index: i + places.length,
                  });
                });
            }).catch(() => undefined)
          );
        } else {
          return {
            id,
            title:
              typeof title === "number"
                ? title.toString()
                : title || "Untitled Location",
            subtitle,
            categories: selectedCategory,
            address: {
              name,
              lat: parseFloat(address_lat),
              lng: parseFloat(address_lng),
            },
            description,
            image,
            index: i + places.length,
          };
        }
      });
      // if no places were fetched async, submit
      // otherwise, wait for complete and merge
      // the results
      if (categoriesToAdd.length) {
        this.props.onAddCategories(categoriesToAdd);
      }
      if (!promises.length) {
        while (locations.length) {
          let paginatedLocations = locations.splice(0, 500);
          console.log("paginated locations");
          console.log(paginatedLocations[0]);
          this.props.onMultipleSubmit(paginatedLocations);
        }
      } else {
        Promise.all(promises).then((locs) => {
          // merge locations with async locations
          locs = [...locs, ...locations.filter((location) => location)];
          window.locs = locs;
          while (locs.length) {
            let paginatedLocations = locs.splice(0, 500);
            console.log("paginated locations");
            console.log(paginatedLocations);
            this.props.onMultipleSubmit(paginatedLocations);
          }
        });
      }
    };
    reader.onerror = (e) => console.error("Error reading csv");
    reader.readAsText(file, "UTF-8");

    reader.addEventListener("progress", (event) => {
      if (event.loaded && event.total) {
        percent = (event.loaded / event.total) * 100;
        if (percent === 100) {
          setTimeout(() => {
            buildfire.notifications.showDialog(
              {
                title: "CSV Import Report",
                message: `
              <div style='display:flex; flex-direction: column; align-items: center; height: height: 110px;'>
                <p>Number Of Total Locations From The CSV: ${
                  this.props.totalLocations
                }</p>
                <p></p>
                <p>Number Of New Locations Added: ${
                  this.props.totalInserted
                }<p/>
                <p>Number Of Existing Locations Updated: ${
                  this.props.totalUpdated
                }<p/>
                <p>Number Of Errors:${
                  this.props.totalLocations -
                  (this.props.totalUpdated + this.props.totalInserted)
                }</p>
              </div>`,
                size: "md",
                buttons: [{ text: "OK", key: "small", type: "default" }],
              },
              (e, res) => {
                if (e) return console.error(e);
                if (!res || res.selectedButton.key == "small") {
                  document.getElementById("progressbar").style.display = "none";
                  window.location.reload();
                }
              }
            );
          }, 5000);
        }
      }
    });
  }

  handleDataExport() {
    const rows = [];
    this.props.places.forEach((place) => {
      place.address.name = place.address.name.replace("#", "");
      let categories = [];
      if (this.props.categories && Array.isArray(this.props.categories)) {
        this.props.categories.forEach((category) => {
          if (!place.categories) place.categories = [];
          place.categories.forEach((cat) => {
            if (category.id === cat) {
              categories.push(category);
            }
          });
        });
      }
      let categoryNames = [];
      categories.forEach((cat) => categoryNames.push(cat.name));

      let names = categoryNames.toString();
      let catNames = names.replace(/,/g, ", ");

      rows.push({
        id: place.id,
        title: place.title,
        subtitle: place.subtitle || "",
        categories: catNames || "",
        address: place.address.name,
        lat: place.address.lat,
        lng: place.address.lng,
        description: place.description || "",
        image: place.image || "",
      });
    });

    let csvContent = "data:text/csv;charset=utf-8,";
    let encoded = new CSVjs(rows, { header: true }).encode();
    csvContent += encoded;

    const encodedURI = encodeURI(csvContent).replace(/#/g, "%23");
    const link = document.createElement("a");
    link.setAttribute("href", encodedURI);
    link.setAttribute("download", "places_export.csv");
    document.body.appendChild(link);
    link.click();
  }

  handleTemplateDownload() {
    const rows = [
      [
        "id",
        "title",
        "subtitle",
        "category",
        "address",
        "address_lat",
        "address_lng",
        "description",
        "image",
      ],
    ];
    let csvContent = "data:text/csv;charset=utf-8,";
    rows.forEach((row) => (csvContent += row.join(",") + "\r\n"));

    const encodedURI = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedURI);
    link.setAttribute("download", "places_template.csv");
    document.body.appendChild(link);
    link.click();
  }

  render() {
    const { addingLocation } = this.props;

    return (
      <div>
        <div className="row">
          <div className="col-xs-4">
            <div className="button-group">
              {addingLocation ? (
                <button
                  className="btn btn-danger"
                  onClick={() => this.onAddLocationCancel()}
                >
                  Cancel
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={() => this.onAddLocation()}
                >
                  Add Location
                </button>
              )}
            </div>
          </div>

          <div className="col-xs-8">
            <input
              onChange={() => this.onFileChange()}
              ref={(n) => (this.fileInput = n)}
              type="file"
              id="csv"
              accept=".csv"
            />
            <div className="button-group right">
              <label className="btn btn-success" htmlFor="csv">
                Import CSV
              </label>
              <button
                onClick={() => this.handleDataExport()}
                className="btn btn-primary template"
              >
                Export CSV
              </button>
              <button
                onClick={this.handleTemplateDownload}
                className="btn btn-primary template"
              >
                CSV Template
              </button>
            </div>
          </div>
          <div className="row" style={{ marginTop: "25px" }}>
            <ProgressBar bgcolor={"#14cb5d"} completed={percent} />
          </div>
        </div>
      </div>
    );
  }
}

export default LocationsActionBar;
