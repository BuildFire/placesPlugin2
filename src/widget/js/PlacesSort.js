window.PlacesSort = {
    alpha(a, b) {
        if ((!a.title || !a.title.toUpperCase) || (!b.title || !b.title.toUpperCase)) return 1;
        if(a.title.toUpperCase() < b.title.toUpperCase())
            return -1;
        if(a.title.toUpperCase() > b.title.toUpperCase())
            return 1;

        return 0;
    },
    alphaDesc(a, b) {
        if ((!a.title || !a.title.toUpperCase) || (!b.title || !b.title.toUpperCase)) return 1;
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
        var aDistance = parseInt(a.distance.split(' ')[0].replace(',', ''));
        var bDistance = parseInt(b.distance.split(' ')[0].replace(',', ''));
        if(aDistance < bDistance)
            return -1;
        if(aDistance > bDistance)
            return 1;
        return 0;
    }
};
