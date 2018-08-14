window.PlacesSort = {
    alpha(a, b) {
        if (!a.title || !b.title) return 1;
        if(a.title.toUpperCase() < b.title.toUpperCase())
            return -1;
        if(a.title.toUpperCase() > b.title.toUpperCase())
            return 1;

        return 0;
    },
    alphaDesc(a, b) {
        if (!a.title || !b.title) return 1;
        if(a.title.toUpperCase() > b.title.toUpperCase())
            return -1;
        if(a.title.toUpperCase() < b.title.toUpperCase())
            return 1;

        return 0;
    },
    manual(a, b) {
        if (a.sort < 0 || b.sort < 0) return 1;
        if(a.sort < b.sort)
            return -1;
        if(a.sort > b.sort)
            return 1;

        return 0;
    },
    distance(a, b) {
        if (!a.distanceInMeters || !b.distanceInMeters) return 1;
        if(a.distanceInMeters < b.distanceInMeters)
            return -1;
        if(a.distanceInMeters > b.distanceInMeters)
            return 1;

        return 0;
    }
};
