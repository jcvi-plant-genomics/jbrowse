/**
 * Store that gets data from any set of web services that implement
 * the JBrowse REST API.
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

    getGlobalStats: function( callback, errorCallback ) {
        var url = this._makeURL( 'list?stats=global' );
        this._get({ url: url, type: 'globalStats' }, callback, errorCallback );
    },

    getRegionStats: function( query, successCallback, errorCallback ) {

        if( ! this.config.region_stats ) {
            this._getRegionStats.apply( this, arguments );
            return;
        }

        query = this._assembleQuery( query );
        var url = this._makeURL( 'list?stats=region&chr=', query );
        this._get( { url: url, query: query, type: 'regionStats' }, successCallback, errorCallback );
    },

    getFeatures: function( query, featureCallback, endCallback, errorCallback ) {
        var thisB = this;
        query = this._assembleQuery( query );
        var url = this._makeURL( 'search?chr=', query );

        // look for cached feature regions if configured to do so
        var cachedFeatureRegions;
        if( this.config.feature_range_cache
            && ! this.config.noCache
            && ( cachedFeatureRegions = this._getCachedFeatureRegions( query ) )
          ) {
            this.region_cache_hits++;
            this._makeFeaturesFromCachedRegions( cachedFeatureRegions, query, featureCallback, endCallback, errorCallback );
        }
        // otherwise just fetch and cache like all the other requests
        else {
            this._get( { url: url, query: query, type: 'features' },
                       dojo.hitch( this, '_makeFeatures',
                                   featureCallback, endCallback, errorCallback
                                 ),
                       errorCallback
                     );
        }
    },

    // this method is copied to getRegionFeatureDensities in the
    // constructor if config.region_feature_densities is true
    _getRegionFeatureDensities: function( query, histDataCallback, errorCallback ) {
        var url = this._makeURL( 'list?stats=regionFeatureDensities&chr=', this._assembleQuery( query ) );
        this._get( { url: url}, histDataCallback, errorCallback );

        // query like:
        //    { ref: 'ctgA, start: 123, end: 456, basesPerBin: 200 }

        // callback like:
        //   histDataCallback({
        //     "bins":  [ 51,50,58,63,57,57,65,66,63,61,56,49,50,47,39,38,54,41,50,71,61,44,64,60,42 ],
        //     "stats": { "basesPerBin":"200","max":88,"mean":57.772 } //< `max` used to set the Y scale
        //   });

        // or error like:
        //   errorCallback( 'aieeee i died' );
    },

    // HELPER METHODS
    _get: function( request, callback, errorCallback ) {
        var thisB = this;
        if( this.config.noCache )
            dojoRequest( request.url, {
                         method: 'GET',
                         handleAs: 'json',
                         headers : { 'Authorization': 'Bearer 7216bcb47ff9243dac2224d12b39664' }
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
        return this._cache || (
            this._cache = new LRUCache(
                {
                    name: 'REST data cache '+this.name,
                    maxSize: 25000, // cache up to about 5MB of data (assuming about 200B per feature)
                    sizeFunction: function( data ) { return data.length || 1; },
                    fillCallback: function( request, callback ) {
                        var get = dojoRequest( request.url, { method: 'GET', handleAs: 'json',
                                                              headers : { 'Authorization': 'Bearer 7216bcb47ff9243dac2224d12b39664' } },
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
    },

    _makeURL: function( subpath, query ) {
        var url = this.baseUrl + subpath

        if( query ) {
            urlsep = '&';
            if( query.ref ) {
                url += query.ref
                query = lang.mixin({}, query );
                delete query.ref;
            }

            query = ioquery.objectToQuery( query );
            if( query )
                url += urlsep + query;
        }
        return url;
    }

});
});
