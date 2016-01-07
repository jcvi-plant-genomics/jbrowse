/**
 * Just a CanvasFeatures track that uses the VariantDetailsMixin to
 * provide a variant-specific feature detail dialog.
 */

define( [
        'dojo/_base/declare',
        'dojo/promise/all',
        'JBrowse/Util',
        'JBrowse/View/Track/CanvasVariants',
        '1001GenomesVariants/View/Track/_VariantDetailMixin'
],

function(
    declare,
    all,
    Util,
    CanvasVariants,
    VariantDetailMixin
    ) {
    return declare( [ CanvasVariants, VariantDetailMixin ], {

        _defaultConfig: function() {
            return Util.deepUpdate(
                dojo.clone( this.inherited(arguments) ),
                {
                    style: { color: 'green' }
                });
        }

    });
});
