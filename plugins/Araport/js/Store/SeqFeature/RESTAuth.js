/**
 * Store that gets data from any set of web services that implement
 * the JBrowse REST API.
 *
 * Araport/Store/SeqFeature/RESTAuth specifically overrides the _get()
 * and _getCache() methods, in order to pass along an Authorization header
 * containing an Agave acccessToken associated with an `anonymous` user.
 *
 * This module enables JBrowse to work with ADAMA passthroughs created to
 * wrap around publicly accessible JBrowse REST API endpoints
 */
define([
           'dojo/_base/declare',
           'dojo/_base/lang',
           'dojo/io-query',
           'dojo/request',
           'JBrowse/Store/LRUCache',
           'JBrowse/Store/SeqFeature/REST'
       ],
       function(
           declare,
           lang,
           ioquery,
           dojoRequest,
           LRUCache,
           REST
       ) {

return declare( [ REST ],
{

    _setToken: function() {
        this.config.accessToken = '3e26d3b2d343ddbdbfb41afd331d7e9';
    },

    // HELPER METHODS
    _get: function( request, callback, errorCallback ) {
        var thisB = this;
        thisB._setToken();
        if( this.config.noCache )
            dojoRequest( request.url, {
                         method: 'GET',
                         handleAs: 'json',
                         headers : { 'Authorization': 'Bearer ' + thisB.config.accessToken }
                     }).then(
                         callback,
                         this._errorHandler( errorCallback )
                     );
        else
            this._getCache().get( request, function( record, error ) {
                                      if( error )
                                          thisB._errorHandler(errorCallback)(error);
                                      else
                                          callback( record.response );
                                  });

    },

    _getCache: function() {
        var thisB = this;
        thisB._setToken();
        return this._cache || (
            this._cache = new LRUCache(
                {
                    name: 'REST data cache '+this.name,
                    maxSize: 25000, // cache up to about 5MB of data (assuming about 200B per feature)
                    sizeFunction: function( data ) { return data.length || 1; },
                    fillCallback: function( request, callback ) {
                        var get = dojoRequest( request.url, { method: 'GET', handleAs: 'json',
                                                              headers : { 'Authorization': 'Bearer ' + thisB.config.accessToken } },
                                               true // work around dojo/request bug
                                             );
                        get.then(
                            function(data) {
                                var nocacheResponse = /no-cache/.test(get.response.getHeader('Cache-Control'))
                                    || /no-cache/.test(get.response.getHeader('Pragma'));
                                callback({ response: data, request: request }, null, {nocache: nocacheResponse});
                            },
                            thisB._errorHandler( lang.partial( callback, null ) )
                        );
                    }
                }));
    }

});
});
