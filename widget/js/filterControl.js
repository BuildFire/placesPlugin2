
let filterControl = {
    openFilter: () => {
        let sideNav = document.getElementById("mySidenav");
        let categoriesDiv = sideNav.querySelector('#categories');

        categoriesDiv.innerHTML = '';

        if(app.state.categories){
            let context = {
                categories: app.state.categories
            };

            axios.get('./templates/categories.hbs').then(response => {
                // Compile the template
                let theTemplate = Handlebars.compile(response.data);

                // Pass our data to the template
                let theCompiledHtml = theTemplate(context);

                // Add the compiled html to the page
                document.getElementById('categories').innerHTML = theCompiledHtml;
            });
        }

        sideNav.style.height = "100%";
    },
    filterCategory: (categoryName) => {
        let categoryIndex = app.state.categories.findIndex(category => {return category.name === categoryName});
        //Switch the category's state
        app.state.categories[categoryIndex].isActive = (!app.state.categories[categoryIndex].isActive);

        let categoryDiv = document.getElementById(categoryName);
        let backgroundColor = (app.state.categories[categoryIndex].isActive) ? 'white' : 'red';
        categoryDiv.setAttribute('style', `background-color:${backgroundColor};`);

        let activeCategories = app.state.categories.filter((category) => {return category.isActive}).map(c => c.name);


        app.state.filteredPlaces = app.state.places.filter(place => {
            //If a location has no categories, we always show it
            if(typeof place.categories === 'undefined' || place.categories.length === 0){
                console.error('No category');
                return true;
            }

            //Does the place include any of the active categories
            let isMatch = place.categories.some(placeCategory => {
                return activeCategories.includes(placeCategory);
            });

            return isMatch;
        });
    },
    closeNav: () => {
        gotPlaces(null, app.state.filteredPlaces);
        document.getElementById("mySidenav").style.height = "0";
    },
    changeView: () => {
        app.state.mode = (app.state.mode == app.settings.viewStates.list) ? app.settings.viewStates.map : app.settings.viewStates.list;

        router.navigate(`/${app.state.mode}`);
    },
    createControl: (controlDiv, buttons) => {
        let container = document.createElement('div');
        container.className = 'buttonContainer';

        controlDiv.appendChild(container);

        buttons.forEach((button) =>{
            let controlButton = document.createElement('div');
            let imageName = (button.name) ? button.name : app.state.mode;
            if(imageName === 'changeView'){
                imageName = (app.state.mode === app.settings.viewStates.list) ? app.settings.viewStates.map : app.settings.viewStates.list;
            }

            controlButton.style.display = 'inline-block';
            controlButton.style.padding = button.padding;
            controlButton.innerHTML = `<img src="./images/${imageName}.svg"></img>`;
            if(button.action)
                controlButton.onclick = button.action;
            container.appendChild(controlButton);
        });

        return container;
    }
};

function CenterControl(controlDiv) {
    filterControl.createControl(controlDiv, [
        {name:'center', action: mapView.centerMap, padding: '10px'}
    ]);
}

function FilterControl (controlDiv){
    filterControl.createControl(controlDiv, [
        {name:'changeView', action: filterControl.changeView, padding: '14px 16px 8px 8px'},
        {name:'filter', action: filterControl.openFilter, padding: '14px 8px 8px 16px'}
    ]);
}