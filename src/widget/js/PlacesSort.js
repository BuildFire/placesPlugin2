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
        var aDistance = 0;
        var bDistance = 0;
        if (a.distance && b.distance) {
            const aDist = a.distance.split(' ')[0];
            const bDist = b.distance.split(' ')[0];
            if (aDist.includes('.')) {
                aDistance = parseInt(a.distance.split(' ')[0].replace('.', ''));
            } else {
                aDistance = parseInt(a.distance.split(' ')[0].replace(',', ''));
            }
            if (bDist.includes('.')) {
                bDistance = parseInt(b.distance.split(' ')[0].replace('.', ''));
            } else {
                bDistance = parseInt(b.distance.split(' ')[0].replace(',', ''));
            }

            if (aDistance < bDistance) {
                return -1;
            }
            if (aDistance > bDistance) {
                return 1;
            }
            return 0;
        } else {
            if ((!a.title || !a.title.toUpperCase) || (!b.title || !b.title.toUpperCase)) return 1;
            if(a.title.toUpperCase() < b.title.toUpperCase())
                return -1;
            if(a.title.toUpperCase() > b.title.toUpperCase())
                return 1;
    
            return 0;
        }
    }
};
