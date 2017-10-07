let detailView = {
    init: (place) => {
        //Add filter control
        let view = document.getElementById('detailView');
        view.innerHTML = place.title;

        //TODO: Remove once back button has been implemented
        view.onclick = e => {
            e.preventDefault();

            router.navigate(app.settings.viewStates.map);
        };
        view.style.cursor = 'pointer';
    },

};