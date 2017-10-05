
let filterControl = {
    filter: () => document.getElementById("mySidenav").style.height = "100%",
    closeNav: () => document.getElementById("mySidenav").style.height = "0",
    changeView: () => {
        app.settings.mode = (app.settings.mode == app.settings.state.list) ? app.settings.state.map : app.settings.state.list;

        router.navigate(`/${app.settings.mode}`);
    },
    createControl: (controlDiv, buttons) => {
        let container = document.createElement('div');
        container.className = 'buttonContainer';

        controlDiv.appendChild(container);

        buttons.forEach((button) =>{
            let controlButton = document.createElement('div');
            let imageName = (button.name) ? button.name : app.settings.mode;
            if(imageName === 'changeView'){
                imageName = (app.settings.mode === app.settings.state.list) ? app.settings.state.map : app.settings.state.list;
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