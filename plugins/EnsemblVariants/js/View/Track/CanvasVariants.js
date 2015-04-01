/**
 * Just an HTMLFeatures track that uses the VariantDetailsMixin to
 * provide a variant-specific feature detail dialog.
 */

define( [
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/promise/all',
        'dojo/_base/array',
        'dojo/when',
        'JBrowse/Util',
        'JBrowse/View/Track/_FeatureDetailMixin',
        'JBrowse/View/Track/CanvasVariants',
        'EnsemblVariants/View/Dialog/VariantInfo'
        ],

        function(
            declare,
            lang,
            all,
            array,
            when,
            Util,
            FeatureDetailMixin,
            CanvasVariants,
            VariantInfo
            ) {
    return declare( [ FeatureDetailMixin, CanvasVariants, VariantInfo ], {
        _makeVCFFilters: function( vcfHeader, inheritedFilters ) {
            // wraps the callback to return true if there
            // is no filter attr
            function makeFilterFilter( condition ) {
                return function(f) {
                    f = f.get('filter');
                    return !f || condition(f);
                };
            }

            var filters = lang.mixin(
                {},
                inheritedFilters,
                {
                    hideFilterPass: {
                        desc: 'Hide sites passing all filters',
            func: makeFilterFilter(
                function( filter ) {
                    try {
                        return filter.values.join('').toUpperCase() != 'PASS';
                    } catch(e) {
                        return filter.toUpperCase() != 'PASS';
                    }
                })
                    },
            hideNotFilterPass: {
                desc: 'Hide sites not passing all filters',
                func: makeFilterFilter(
                    function( f ) {
                        try {
                            return f.values.join('').toUpperCase() == 'PASS';
                        } catch(e) {
                            return f.toUpperCase() != 'PASS';
                        }
                    })
            },
                });

            var filterVariantTypeList = ["deletion","insertion", "SNV", "substitution","sequence_alteration"];
            var variantTypeFilters = lang.mixin();

            for( var id in filterVariantTypeList){
                fname = filterVariantTypeList[id];
                variantTypeFilters[fname] = function ( fname ) {
                    return {
                        desc: "Show " + fname + "s",
                            title: fname,
                            func:  function(f) {
                                var type = f.get('type');
                                if( type == fname ) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                    }
                }.call(this, fname, fname);
            }



            var colorArray = new Array();
            colorArray = [{'type': 'transcript_ablation', 'color': '#ff0000', 'num': '34'},{'type': 'splice_donor_variant', 'color': '#ff7f50', 'num': '33'},{'type': 'splice_acceptor_variant', 'color': '#ff7f50', 'num': '32'},{'type': 'stop_gained', 'color': '#ff0000', 'num': '31'},{'type': 'frameshift_variant', 'color': '#ff69b4', 'num': '30'},{'type': 'stop_lost', 'color': '#ff0000', 'num': '29'},{'type': 'initiator_codon_variant', 'color': '#ffd700', 'num': '28'},{'type': 'inframe_insertion', 'color': '#ff69b4', 'num': '27'},{'type': 'inframe_deletion', 'color': '#ff69b4', 'num': '26'},{'type': 'missense_variant', 'color': '#ffd700', 'num': '25'},{'type': 'transcript_amplification', 'color': '#ff69b4', 'num': '24'},{'type': 'splice_region_variant', 'color': '#ff7f50', 'num': '23'},{'type': 'incomplete_terminal_codon_variant', 'color': '#ff00ff', 'num': '22'},{'type': 'synonymous_variant', 'color': '#76ee00', 'num': '21'},{'type': 'stop_retained_variant', 'color': '#76ee00', 'num': '20'},{'type': 'coding_sequence_variant', 'color': '#458b00', 'num': '19'},{'type': 'mature_miRNA_variant', 'color': '#458b00', 'num': '18'},{'type': '5_prime_UTR_variant', 'color': '#7ac5cd', 'num': '17'},{'type': '3_prime_UTR_variant', 'color': '#7ac5cd', 'num': '16'},{'type': 'non_coding_exon_variant', 'color': '#32cd32', 'num': '15'},{'type': 'non_coding_transcript_variant', 'color': '#32cd32', 'num': '14'},{'type': 'intron_variant', 'color': '#02599c', 'num': '13'},{'type': 'NMD_transcript_variant', 'color': '#ff4500', 'num': '12'},{'type': 'upstream_gene_variant', 'color': '#a2b5cd', 'num': '11'},{'type': 'downstream_gene_variant', 'color': '#a2b5cd', 'num': '10'},{'type': 'TFBS_ablation', 'color': '#a52a2a', 'num': '9'},{'type': 'TFBS_amplification', 'color': '#a52a2a', 'num': '8'},{'type': 'TF_binding_site_variant', 'color': '#a52a2a', 'num': '7'},{'type': 'regulatory_region_variant', 'color': '#a52a2a', 'num': '6'},{'type': 'regulatory_region_ablation', 'color': '#a52a2a', 'num': '5'},{'type': 'regulatory_region_amplification', 'color': '#a52a2a', 'num': '4'},{'type': 'feature_elongation', 'color': '#7f7f7f', 'num': '3'},{'type': 'feature_truncation', 'color': '#7f7f7f', 'num': '2'},{'type': 'intergenic_variant', 'color': '#636363', 'num': '1'}];

            var variantConsequenceFilters = lang.mixin();
            for(var cid in colorArray){
                type = colorArray[cid].type;
                color = colorArray[cid].color;
                variantConsequenceFilters[type] = function ( type ) {
                    return {
                        desc: "<table><tr><td>Show " + type + "s</td><td><div style='background-color:" + color + "; width: 10px;'>&nbsp</div></td></tr></table>",
                            title: type,
                            func:  function(f) {
                                var consequence = f.get('MSC');
                                if( consequence == type ) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                    }
                }.call(this, type, type);

            }

            if( vcfHeader.filter ) {
                for( var filterName in vcfHeader.filter ) {
                    filters[filterName] = function( filterName, filterSpec ) {
                        return {
                            desc: 'Hide sites not passing filter "'+filterName+'"',
                            title: filterName+': '+filterSpec.description,
                            func: makeFilterFilter(
                                    function( f ) {
                                        var fs = f.values || f;
                                        if( ! fs[0] ) return true;

                                        return ! array.some(
                                            fs,
                                            function(fname) {
                                                return fname == filterName;
                                            });
                                    })
                        };
                    }.call(this, filterName, vcfHeader.filter[filterName]);
                }
            }

            return [variantConsequenceFilters,variantTypeFilters];
        },
        // filters for VCF sites
        _getNamedFeatureFilters: function() {
            var thisB = this;

            return all([ this.store.getVCFHeader && this.store.getVCFHeader(), this.inherited(arguments) ])
                .then( function() {

                    if( arguments[0][0] ) {
                        return thisB._makeVCFFilters.apply( thisB, arguments[0] );
                    } else {
                        return arguments[0][1];
                    }
                });
        },
        _variantsFilterTrackMenuOptions: function() {
            // add toggles for feature filters
            var track = this;

            return this._getNamedFeatureFilters()
                .then( function( filters) {

                    // merge our builtin filters with additional ones
                    // that might have been generated in
                    // _getNamedFeatureFilters() based on e.g. the VCF
                    // header

                    var filterVariantTypeList = ["deletion","insertion", "SNV", "substitution", "sequence_alteration"];

                    var filterConsequenceList = ['transcript_ablation','splice_donor_variant','splice_acceptor_variant','stop_gained','frameshift_variant','stop_lost','initiator_codon_variant','inframe_insertion','inframe_deletion','missense_variant','transcript_amplification','splice_region_variant','incomplete_terminal_codon_variant','synonymous_variant','stop_retained_variant','coding_sequence_variant','mature_miRNA_variant','5_prime_UTR_variant','3_prime_UTR_variant','non_coding_exon_variant','non_coding_transcript_variant','intron_variant','NMD_transcript_variant','upstream_gene_variant','downstream_gene_variant','TFBS_ablation','TFBS_amplification','TF_binding_site_variant','regulatory_region_variant','regulatory_region_ablation','regulatory_region_amplification','feature_elongation','feature_truncation','intergenic_variant'];

                    var menuItems = [
                    'hideFilterPass',
                    'hideNotFilterPass',
                    'SEPARATOR'
                    ];

                var withAdditional = Util.uniq( menuItems.concat( Util.dojof.keys( filters ) ) );

                if( withAdditional.length > menuItems.length )
                    menuItems = withAdditional;
                else
                    menuItems.pop(); //< pop off the separator since we have no additional ones

                var new_filters = track._makeFeatureFilterTrackMenuItems( filterVariantTypeList, filterConsequenceList, filters);

                return new_filters;
                });
        },
        _makeFeatureFilterTrackMenuItems: function( typeList, consequenceList, filters ) {
            var thisB = this;
            var browser = this.browser;


            function variantFilter ( name ) {
                return function( f ) {
                    var msc = f.get('MSC');
                    var type = f.get('type');
                    var msccurrstatus = browser.cookie(msc);
                    var typecurrstatus = browser.cookie(type);
                    if(typeof msccurrstatus == 'undefined'){
                        msccurrstatus = 1;
                    }
                    if(typeof typecurrstatus == 'undefined'){
                        typecurrstatus = 1;
                    }
                    if(msccurrstatus == "1" && typecurrstatus == "1"){
                        return true;
                    }else{
                        return false;
                    }
                }

            }

            var legend = "<div class='variantColorLegend'><table>";
            var colorArray = new Array();
            colorArray = [{'type': 'transcript_ablation', 'color': '#ff0000', 'num': '34'},{'type': 'splice_donor_variant', 'color': '#ff7f50', 'num': '33'},{'type': 'splice_acceptor_variant', 'color': '#ff7f50', 'num': '32'},{'type': 'stop_gained', 'color': '#ff0000', 'num': '31'},{'type': 'frameshift_variant', 'color': '#ff69b4', 'num': '30'},{'type': 'stop_lost', 'color': '#ff0000', 'num': '29'},{'type': 'initiator_codon_variant', 'color': '#ffd700', 'num': '28'},{'type': 'inframe_insertion', 'color': '#ff69b4', 'num': '27'},{'type': 'inframe_deletion', 'color': '#ff69b4', 'num': '26'},{'type': 'missense_variant', 'color': '#ffd700', 'num': '25'},{'type': 'transcript_amplification', 'color': '#ff69b4', 'num': '24'},{'type': 'splice_region_variant', 'color': '#ff7f50', 'num': '23'},{'type': 'incomplete_terminal_codon_variant', 'color': '#ff00ff', 'num': '22'},{'type': 'synonymous_variant', 'color': '#76ee00', 'num': '21'},{'type': 'stop_retained_variant', 'color': '#76ee00', 'num': '20'},{'type': 'coding_sequence_variant', 'color': '#458b00', 'num': '19'},{'type': 'mature_miRNA_variant', 'color': '#458b00', 'num': '18'},{'type': '5_prime_UTR_variant', 'color': '#7ac5cd', 'num': '17'},{'type': '3_prime_UTR_variant', 'color': '#7ac5cd', 'num': '16'},{'type': 'non_coding_exon_variant', 'color': '#32cd32', 'num': '15'},{'type': 'non_coding_transcript_variant', 'color': '#32cd32', 'num': '14'},{'type': 'intron_variant', 'color': '#02599c', 'num': '13'},{'type': 'NMD_transcript_variant', 'color': '#ff4500', 'num': '12'},{'type': 'upstream_gene_variant', 'color': '#a2b5cd', 'num': '11'},{'type': 'downstream_gene_variant', 'color': '#a2b5cd', 'num': '10'},{'type': 'TFBS_ablation', 'color': '#a52a2a', 'num': '9'},{'type': 'TFBS_amplification', 'color': '#a52a2a', 'num': '8'},{'type': 'TF_binding_site_variant', 'color': '#a52a2a', 'num': '7'},{'type': 'regulatory_region_variant', 'color': '#a52a2a', 'num': '6'},{'type': 'regulatory_region_ablation', 'color': '#a52a2a', 'num': '5'},{'type': 'regulatory_region_amplification', 'color': '#a52a2a', 'num': '4'},{'type': 'feature_elongation', 'color': '#7f7f7f', 'num': '3'},{'type': 'feature_truncation', 'color': '#7f7f7f', 'num': '2'},{'type': 'intergenic_variant', 'color': '#636363', 'num': '1'}];

            for(var cid in colorArray){
                color = colorArray[cid].color;
                type = colorArray[cid].type;
                colordiv = "<tr><td><div style='background-color:" + color + "; width: 20px;'>&nbsp</div></td><td>"+type+"</td></tr>";
                legend += colordiv;
            }
            legend += "</table></div>";


            return when( filters || this._getNamedFeatureFilters() )
                .then( function( filters ) {

                    var consequenceArray = array.map(
                        consequenceList,
                        function( name ) {
                            browser.cookie(name, "1");
                            if( name == 'SEPARATOR' )
                        return { type: 'dijit/MenuSeparator' };
                    return { label: filters[0][name].desc,
                        title: filters[0][name].title,
                        type: 'dijit/CheckedMenuItem',
                        checked: "true",
                        onClick: function(event) {
                            browser.cookie(name, this.get("checked") ? "1" : "0");
                            browser.addFeatureFilter(variantFilter(name), name);
                            browser.view.redrawTracks();
                        }
                    };
                        }
                        );

                    var typeArray = array.map(
                            typeList,
                            function( name ) {
                                browser.cookie(name, "1");
                                if( name == 'SEPARATOR' )
                        return { type: 'dijit/MenuSeparator' };
                    return { label: filters[1][name].desc,
                        title: filters[1][name].title,
                        type: 'dijit/CheckedMenuItem',
                        checked: "true",
                        onClick: function(event) {
                            browser.cookie(name, this.get("checked") ? "1" : "0");
                            browser.addFeatureFilter(variantFilter(name), name);
                            browser.view.redrawTracks();
                        }
                    };
                            }
                            );

                    var new_options =  [
                    {
                        label: 'Filter features by consequence type',
                            title: "Choose variant consequence filter.",
                            children: consequenceArray
                    },
                    {
                        label: 'Filter features by variant type',
                        title: "Choose variant typefilter.",
                        children: typeArray
                    },
                    {
                        label: 'Display Color Legend',
                        title: 'Ensembl Variant Consequences ',
                        iconClass: 'dijitIconChart',
                        action: 'contentDialog',
                        content: legend
                    }
                    ];
                    var mergedArray =  consequenceArray.concat.apply( consequenceArray, new_options );

                    return new_options;
                });
        }

    });
});
