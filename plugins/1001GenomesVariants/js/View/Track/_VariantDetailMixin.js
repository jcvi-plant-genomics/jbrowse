/**
 * Mixin to provide a `defaultFeatureDetail` method that is optimized
 * for displaying variant data from VCF files.
 */

define([
           'dojo/_base/declare',
           'dojo/_base/array',
           'dojo/_base/lang',
           'dojo/dom-construct',
           'dojo/dom-class',
           'dojo/promise/all',
           'dojo/when',
           'JBrowse/Util',
           'JBrowse/View/Track/_FeatureDetailMixin',
           'JBrowse/View/Track/_VariantDetailMixin',
           'JBrowse/View/Track/_NamedFeatureFiltersMixin',
           'JBrowse/Model/NestedFrequencyTable',
           '1001GenomesVariants/View/Dialog/VariantInfo'
       ],
       function(
           declare,
           array,
           lang,
           domConstruct,
           domClass,
           all,
           when,
           Util,
           FeatureDetailMixin,
           VariantDetailMixin,
           NamedFeatureFiltersMixin,
           NestedFrequencyTable,
           VariantInfo
       ) {

return declare( [ FeatureDetailMixin, VariantDetailMixin, VariantInfo, NamedFeatureFiltersMixin ], {

        defaultFeatureDetail: function( /** JBrowse.Track */ track, /** Object */ f, /** HTMLElement */ featDiv, /** HTMLElement */ container ) {
            container = container || domConstruct.create('div', { className: 'detail feature-detail feature-detail-'+track.name, innerHTML: '' } );

            this.renderVariantDetails( track, f, featDiv, container );

            this.renderVariantConsequences( track, f, featDiv, container );

            // genotypes in a separate section
            this._renderGenotypes( container, track, f, featDiv );

            return container;
        },

        _renderGenotypes: function( parentElement, track, f, featDiv  ) {
            var thisB = this;
            var genotypes = f.get('genotypes');
            if( ! genotypes )
                return;

            var keys = Util.dojof.keys( genotypes ).sort();
            var gCount = keys.length;
            if( ! gCount )
                return;

            // get variants and coerce to an array
            var alt = f.get('alternative_alleles');
            if( alt &&  typeof alt == 'object' && 'values' in alt )
                alt = alt.values;
            if( alt && ! lang.isArray( alt ) )
                alt = [alt];

            var gContainer = domConstruct.create(
                'div',
                { className: 'genotypes',
                  innerHTML: '<h2 class="sectiontitle">Genotypes ('
                             + gCount + ')</h2>'
                },
                parentElement );

            var valueContainer = domConstruct.create(
                'div',
                {
                    className: 'value_container genotypes',
                    innerHTML: 'Loading.....'
                }, gContainer );

            thisB.renderGenotypes(genotypes, alt, keys, track, f, gContainer, valueContainer);
        }
    });
});


