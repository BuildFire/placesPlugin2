
let filterControl = {
    filter: () => document.getElementById("mySidenav").style.height = "100%",
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
        {name:'filter', action: filterControl.filter, padding: '12px'}
    ]);
}