/**
 * Store that gets data from any set of web services that implement
 * the JBrowse REST API.
 *
 * Araport/Store/SeqFeature/REST: specifically leverages the ADAMA
 * microservices platform to map its '/search' endpoint to the 4 supported
 * JBrowse REST endpoints: globalStats, regionStats, regionFeatureDensities and features
 *
 * This module works with ADAMA generic/query endpoints
 */
define([
           'dojo/_base/declare',
           'dojo/_base/lang',
           'dojo/io-query',
           'dojo/request',
           'JBrowse/Store/LRUCache',
           'JBrowse/Store/SeqFeature/REST',
           'Araport/Store/SeqFeature/RESTAuth'
       ],
       function(
           declare,
           lang,
           ioquery,
           dojoRequest,
           LRUCache,
           REST,
           RESTAuth
       ) {

return declare( [ REST, RESTAuth ],
{

    getGlobalStats: function( callback, errorCallback ) {
        var url = this._makeURL( 'search?endpoint=globalStats' );
        this._get({ url: url, type: 'globalStats' }, callback, errorCallback );
    },

    getRegionStats: function( query, successCallback, errorCallback ) {

        if( ! this.config.region_stats ) {
            this._getRegionStats.apply( this, arguments );
            return;
        }

        query = this._assembleQuery( query );
        var url = this._makeURL( 'search?action=regionStats&chr=', query );
        this._get( { url: url, query: query, type: 'regionStats' }, successCallback, errorCallback );
    },

    getFeatures: function( query, featureCallback, endCallback, errorCallback ) {
        var thisB = this;
        query = this._assembleQuery( query );
        var url = this._makeURL( 'search?action=features&chr=', query );

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
        var url = this._makeURL( 'search?action=regionFeatureDensities&chr=', this._assembleQuery( query ) );
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
