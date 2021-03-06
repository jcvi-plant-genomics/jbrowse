define( [
            'dojo/_base/declare',
            'dojo/_base/array',
            'dojo/_base/Color',
            'JBrowse/View/Track/WiggleBase',
            'JBrowse/Util'
        ],
        function( declare, array, Color, WiggleBase, Util ) {

return declare( WiggleBase,

/**
 * Wiggle track that shows data with variations in color.
 * Customized for CoGe, based on JBrowse/View/Track/Wiggle/Density.js.
 *
 * @lends JBrowse.View.Track.Wiggle.Density
 * @extends JBrowse.View.Track.WiggleBase
 */

{

    _defaultConfig: function() {
        return Util.deepUpdate(
            dojo.clone( this.inherited(arguments) ),
            {
                maxExportSpan: 500000,
                style: {
                    height: 31,
                    pos_color: '#00f',
                    neg_color: '#f00',
                    bg_color: 'rgba(230,230,230,0.6)'
                }
            }
        );
    },

    _draw: function(scale, leftBase, rightBase, block, canvas, features, featureRects, dataScale, pixels, spans) {
        this._preDraw(      scale, leftBase, rightBase, block, canvas, features, featureRects, dataScale );

        this._drawFeatures( scale, leftBase, rightBase, block, canvas, features, featureRects, dataScale );

        if ( spans ) {
            this._maskBySpans( scale, leftBase, rightBase, block, canvas, pixels, dataScale, spans );
        }
        this._postDraw(     scale, leftBase, rightBase, block, canvas, features, featureRects, dataScale );
    },

    _drawFeatures: function( scale, leftBase, rightBase, block, canvas, features, featureRects, dataScale ) {
        var thisB = this;
        var context = canvas.getContext('2d');
        var canvasHeight = canvas.height;

        var featureColor = typeof this.config.style.color == 'function' ? this.config.style.color :
            (function() { // default color function uses conf variables
                var white = new Color('white');
                var black = new Color('black');
                var disableClipMarkers = thisB.config.disable_clip_markers;
                var normOrigin = dataScale.normalize( dataScale.origin );
                return function( feature ) {
                    var score = feature.get('score');
                    var nucleotide = feature.get('nucleotide');
                    var n = dataScale.normalize( score );
                    if ( disableClipMarkers || n <= 1 && n >= 0 ) {
                        if (nucleotide != 'n' && nucleotide != 'x' ) {
                            return Color.blendColors(
                                new Color( thisB.getConfForFeature('style.bg_color', feature ) ),
                                new Color( thisB.getConfForFeature( n >= normOrigin ? 'style.pos_color' : 'style.neg_color', feature ) ),
                                Math.abs(n-normOrigin));
                        } else if (nucleotide == 'n') {
                            return Color.blendColors(
                                new Color({ r:255, g:163, b:0, a:0.7 }),
                                new Color( thisB.getConfForFeature( n >= normOrigin ? 'style.pos_color' : 'style.neg_color', feature ) ),
                                Math.abs(n-normOrigin));
                        } else if (nucleotide == 'x') {
                            return Color.blendColors(
                                new Color({ r:145, g:114, b:243, a:0.7 }),
                                new Color( thisB.getConfForFeature( n >= normOrigin ? 'style.pos_color' : 'style.neg_color', feature ) ),
                                Math.abs(n-normOrigin));
                        }
                    } else {
                        return new Color( thisB.getConfForFeature('style.clip_marker_color', feature ) ) || ( n > 1 ? white : black );
                    }
                };
            })();

        dojo.forEach( features, function(f,i) {
            var fRect = featureRects[i];
            context.fillStyle = ''+featureColor( f );
            context.fillRect( fRect.l, 0, fRect.w, canvasHeight );
        });
    },

   _postDraw: function() {}

});
});
