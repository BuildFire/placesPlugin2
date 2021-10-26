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
            const aDist = a.distance.split(' ');
            const bDist = b.distance.split(' ');
            if (aDist[0].includes('.')) {
                aDistance = parseInt(aDist[0].replace('.', ''));
            } else {
                aDistance = parseInt(aDist[0].replace(',', ''));
            }
            aDistance = aDist[1] === 'ft' ? aDistance / 5280 : aDistance;
            aDistance = aDist[1] === 'm' ? aDistance / 1000 : aDistance;
            if (bDist[0].includes('.')) {
                bDistance = parseInt(bDist[0].replace('.', ''));
            } else {
                bDistance = parseInt(bDist[0].replace(',', ''));
            }
            bDistance = bDist[1] === 'ft' ? bDistance / 5280 : bDistance;
            bDistance = bDist[1] === 'm' ? bDistance / 1000 : bDistance;

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
