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
        },

        colorArray: function() {
            var colorObject = new Object();

            colorObject['All_Major_Types'] = {'color': '#ffffff', 'num': '35', 'group': 'Major'};
            colorObject['missense_variant'] = {'color': '#ffd700', 'num': '34', 'group': 'Major'};
            colorObject['transcript_ablation'] = {'color': '#ff0000', 'num': '33', 'group': 'Major'};
            colorObject['frameshift_variant'] = {'color': '#ff69b4', 'num': '32', 'group': 'Major'};
            colorObject['stop_gained'] = {'color': '#ff0000', 'num': '31', 'group': 'Major'};
            colorObject['stop_lost'] = {'color': '#ff0000', 'num': '30', 'group': 'Major'};
            colorObject['NMD_transcript_variant'] = {'color': '#ff4500', 'num': '29', 'group': 'Major'};
            colorObject['inframe_insertion'] = {'color': '#ff69b4', 'num': '28', 'group': 'Major'};
            colorObject['inframe_deletion'] = {'color': '#ff69b4', 'num': '27', 'group': 'Major'};
            colorObject['initiator_codon_variant'] = {'color': '#ffd700', 'num': '26', 'group': 'Major'};
            colorObject['All_Splice_Types'] = {'color': '#ffffff', 'num': '35', 'group': 'Splice'};
            colorObject['splice_donor_variant'] = {'color': '#ff7f50', 'num': '25', 'group': 'Splice'};
            colorObject['splice_acceptor_variant'] = {'color': '#ff7f50', 'num': '24', 'group': 'Splice'};
            colorObject['splice_region_variant'] = {'color': '#ff7f50', 'num': '23', 'group': 'Splice'};
            colorObject['All_UTR_Types'] = {'color': '#ffffff', 'num': '35', 'group': 'UTR'};
            colorObject['5_prime_UTR_variant'] = {'color': '#7ac5cd', 'num': '22', 'group': 'UTR'};
            colorObject['3_prime_UTR_variant'] = {'color': '#7ac5cd', 'num': '21', 'group': 'UTR'};
            colorObject['All_Regulatory_Types'] = {'color': '#ffffff', 'num': '35', 'group': 'Regulatory'};
            colorObject['TFBS_ablation'] = {'color': '#a52a2a', 'num': '20', 'group': 'Regulatory'};
            colorObject['TFBS_amplification'] = {'color': '#a52a2a', 'num': '19', 'group': 'Regulatory'};
            colorObject['TF_binding_site_variant'] = {'color': '#a52a2a', 'num': '18', 'group': 'Regulatory'};
            colorObject['regulatory_region_variant'] = {'color': '#a52a2a', 'num': '17', 'group': 'Regulatory'};
            colorObject['regulatory_region_ablation'] = {'color': '#a52a2a', 'num': '16', 'group': 'Regulatory'};
            colorObject['regulatory_region_amplification'] = {'color': '#a52a2a', 'num': '15', 'group': 'Regulatory'};
            colorObject['All_Other_Types'] = {'color': '#ffffff', 'num': '35', 'group': 'Other'};
            colorObject['synonymous_variant'] = {'color': '#76ee00', 'num': '14', 'group': 'Others'};
            colorObject['transcript_amplification'] = {'color': '#ff69b4', 'num': '13', 'group': ''};
            colorObject['incomplete_terminal_codon_variant'] = {'color': '#ff00ff', 'num': '12', 'group': 'Others'};
            colorObject['stop_retained_variant'] = {'color': '#76ee00', 'num': '11', 'group': 'Others'};
            colorObject['coding_sequence_variant'] = {'color': '#458b00', 'num': '10', 'group': 'Others'};
            colorObject['upstream_gene_variant'] = {'color': '#a2b5cd', 'num': '9', 'group': 'Others'};
            colorObject['downstream_gene_variant'] = {'color': '#a2b5cd', 'num': '8', 'group': 'Others'};
            colorObject['mature_miRNA_variant'] = {'color': '#458b00', 'num': '7', 'group': 'Others'};
            colorObject['non_coding_exon_variant'] = {'color': '#32cd32', 'num': '6', 'group': 'Others'};
            colorObject['non_coding_transcript_variant'] = {'color': '#32cd32', 'num': '5', 'group': 'Others'};
            colorObject['intron_variant'] = {'color': '#02599c', 'num': '4', 'group': 'Others'};
            colorObject['feature_elongation'] = {'color': '#7f7f7f', 'num': '3', 'group': 'Others'};
            colorObject['feature_truncation'] = {'color': '#7f7f7f', 'num': '2', 'group': 'Others'};
            colorObject['intergenic_variant'] = {'color': '#636363', 'num': '1', 'group': 'Others'};

            return colorObject;
        },

        variantColor: function(feature) {
            var color = "#000000";
            var colorArray = this.colorArray();
            var value = feature.get('EFF').values;
            if(typeof value != 'undefined' && value instanceof Array) {
                var snpEffData = this.parseEFFString(value);
                var msc = [snpEffData[0].Effect];
                var variantType = msc.toString();
                if (colorArray[variantType] !== null) {
                    color = colorArray[variantType].color;
                }
            }
            return color;
        },

        variantTrackLegend: function() {
            var colorArray = this.colorArray();

            var legend = "<div class='variantColorLegend'><table>";
            for(var type in colorArray){
                color = colorArray[type].color;
                colordiv = "<tr><td><div style='background-color:" + color + "; width: 20px;'>&nbsp</div></td><td>"+type+"</td></tr>";
                legend += colordiv;
            }
            legend += "</table></div>";

            return legend;
        },

        _variantsFilterTrackMenuOptions: function() {
            // add toggles for feature filters
            var track = this;
            return this._getNamedFeatureFilters()
                .then( function( filters ) {

                    // merge our builtin filters with additional ones
                    // that might have been generated in
                    // _getNamedFeatureFilters() based on e.g. the VCF
                    // header
                    var menuItems = [
                        'hideFilterPass',
                        'hideNotFilterPass',
                        'SEPARATOR',
                        'variantTrackLegend'
                    ];
                    var withAdditional = Util.uniq( menuItems.concat( Util.dojof.keys( filters ) ) );
                    if( withAdditional.length > menuItems.length )
                        menuItems = withAdditional;
                    else
                        menuItems.pop(); //< pop off the separator since we have no additional ones

                    return track._makeFeatureFilterTrackMenuItems( menuItems, filters );
                });
        },

        _makeFeatureFilterTrackMenuItem: function( filtername, filterspec ) {
            var thisB = this;
            if( filtername == 'SEPARATOR' ) {
                return { type: 'dijit/MenuSeparator' };
            }
            else if ( filtername == 'variantTrackLegend' ) {
                return {
                    label: 'Display Color Legend',
                    title: 'Variant Consequences',
                    iconClass: 'dijitIconChart',
                    action: 'contentDialog',
                    content: this.variantTrackLegend()
                };
            } else {
                return { label: filterspec.desc,
                    title: filterspec.title,
                    type: 'dijit/CheckedMenuItem',
                    checked: !! thisB.config[filtername],
                    onClick: function(event) {
                        thisB._toggleFeatureFilter( filtername, this.checked );
                    }
                };
            }
        }

    });
});


