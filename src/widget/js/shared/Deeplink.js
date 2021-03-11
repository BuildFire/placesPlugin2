export default class Deeplink {
  
  constructor(data = { deeplinkId: null, name: null, deeplinkData: {}, imageUrl: null }) {

    this.id = data.deeplinkId;
    this.name = data.name;
    this.deeplinkData = data.deeplinkData;
    this.imageUrl = data.imageUrl;
    
  }

  save(callback = () => {}) {

    const options = {
      id: this.id,
      name: this.name,
      deeplinkData: this.deeplinkData,
      imageUrl: this.imageUrl
    };

    buildfire.deeplink.registerDeeplink(options, (err, result) => {
      
      if (err || !result) {
        console.error(err, '<<< ERROR WHILE REGISTERING DEEP LINK.');
        return callback(err);
      }

      callback(null, { 
        deeplinkId: result && result.data && result.data.deeplinkId ? result.data.deeplinkId : null,
        deeplinkData: new Deeplink(result && result.data ? result.data : null)
      });
      
    })

  }

  static getById(deeplinkId, callback = () => {}) {

    if (!deeplinkId) return callback(new Error('Required param "deeplinkId" not passed.'));

    buildfire.deeplink.getDeeplink(deeplinkId, (err, result) => {

      if (err || !result) {
        console.error(err, '<<< ERROR WHILE GETTING DEEP LINK.');
        return callback(err);
      }

      callback(null, new Deeplink(result && result.data ? result.data : null));
      
    });

  }
  
  static deleteById(deeplinkId, callback = () => {}) {

    if (!deeplinkId) return callback(new Error('Required param "deeplinkId" not passed.'));

    buildfire.deeplink.unregisterDeeplink(deeplinkId, err => {

      if (err) {
        console.error(err, '<<< ERROR WHILE DELETING DEEP LINK.');
        return callback(err);
      }

      callback(null);
      
    });

  }

}
