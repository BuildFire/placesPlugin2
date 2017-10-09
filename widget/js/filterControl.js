
let filterControl = {
    openFilter: () => {
        let sideNav = document.getElementById("mySidenav");
        let categoriesDiv = sideNav.querySelector('#categories');

        categoriesDiv.innerHTML = '';

        if(app.state.categories){
            app.state.categories.forEach(category => {
                let link = categoriesDiv.appendChild(document.createElement('a'));
                link.innerHTML = category;
                link.setAttribute('href', 'javascript:void(0)');
                link.setAttribute('id', category);
                link.setAttribute('onclick', `filterControl.filterCategory('${category}')`);
            });
        }

        sideNav.style.height = "100%";
    },
    filterCategory: (category) => {
        let index = app.state.categories.indexOf(category);

        //remove category
        app.state.categories.splice(index, 1);

        //Update UI to reflect selected categories
        app.state.places.filter(place => {
            //If a location has no categories, we always show it
            if(typeof place.category === 'undefined' || place.category.length === 0){
                console.error('No category');
                return true;
            }

            let matches = place.categories.some(r => app.state.categories.includes(r));

            return (matches && matches.length && matches.length > 0);
        });

        console.error('filter', category);
    },
    closeNav: () => document.getElementById("mySidenav").style.height = "0",
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
        {name:'center', action: mapView.centerMap, padding: '8px'}
    ]);
}

function FilterControl (controlDiv){
    filterControl.createControl(controlDiv, [
        {name:'changeView', action: filterControl.changeView, padding: '12px'},
        {name:'filter', action: filterControl.openFilter, padding: '12px'}
    ]);
}