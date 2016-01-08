define( "1001GenomesVariants/View/Dialog/VariantInfo", [
        'dojo/_base/declare',
        'dojo/_base/array',
        'dojo/dom-construct',
        'dojox/grid/EnhancedGrid',
        'dojox/grid/enhanced/plugins/Pagination',
        'dojox/grid/enhanced/plugins/Filter',
        'dojo/store/Memory',
        'dojo/data/ObjectStore',
        'dojo/request/xhr',
        'JBrowse/Util',
        'dojo/domReady!'
],

function(
    declare,
    array,
    domConstruct,
    EnhancedGrid,
    Pagination,
    Filter,
    Memory,
    ObjectStore,
    xhr,
    Util
    ) {
    return declare( null, {

        renderGenotypes: function(genotypes, alt, keys, track, f, gContainer, valueContainer) {
            var thisB = this;
            var allGenotypeInfo = {};

            var accessToken = '2c3602085267e1c935bbfb7da6dd2e';
            var apiBaseUrl = 'https://api.araport.org/community/v0.3';
            var master_accession_list_url = apiBaseUrl + '/gmi' + '/master_accession_list_v0.1.0' + '/list';

            xhr(master_accession_list_url, {
                handleAs: "json",
                query: {
                    alt_format: "true"
                },
                headers: {
                    "Authorization": "Bearer " + accessToken
                }
            }).then(function(data) {
                for(var i = 0; i < data.length; i++) {
                    var accession = data[i];
                    allGenotypeInfo[accession['id']] = accession['name'];
                }
                valueContainer.innerHTML = '';
                function render( underlyingRefSeq ) {
                    var summaryElement = thisB._renderGenotypeSummary( gContainer, genotypes, alt, underlyingRefSeq );
                    thisB.renderDetailValueGrid(
                            valueContainer,
                            'Genotypes',
                            f,
                            // iterator
                            function() {
                                if( ! keys.length )
                                    return null;
                                var k = keys.shift();
                                var genotypeName = allGenotypeInfo[k];
                                var value = genotypes[k];
                                var item = { id: genotypeName || k };
                                var fieldMap = { 'GT' : 'Genotype', 'GQ' : 'Genotype Quality', 'DP' : 'Read Depth' };
                                for( var field in value ) {
                                    item[ fieldMap[field] ] = thisB._mungeGenotypeVal( value[field], field, alt, underlyingRefSeq );
                                }
                                return item;
                            },
                            {
                                descriptions: (function() {
                                    if( ! keys.length )
                                        return {};

                                    var subValue = genotypes[keys[0]];
                                    var descriptions = {};
                                    for( var k in subValue ) {
                                        descriptions[k] = subValue[k].meta && subValue[k].meta.description || null;
                                    }
                                    return descriptions;
                                })()
                            }
                    );
                };

                track.browser.getStore('refseqs', function( refSeqStore ) {
                    if( refSeqStore ) {
                        refSeqStore.getReferenceSequence(
                                { ref: track.refSeq.name,
                                    start: f.get('start'),
                                    end: f.get('end')
                                },
                                render,
                                function() { render(); }
                                );
                    }
                    else {
                        render();
                    }
                });
            }, function(err) {
                console.log("Error while fetching genotype accession data:" + err);
            });

            return allGenotypeInfo;
        },

        renderVariantDetails: function( track, f, featDiv, container ) {
            var coreDetails = dojo.create('div', { className: 'core' }, container );
            var fmt = dojo.hitch( this, 'renderDetailField', coreDetails );
            coreDetails.innerHTML += '<h2 class="sectiontitle">Primary Data</h2>';

            fmt( 'Name', this.getFeatureLabel( f ),f );
            fmt( 'Position',
                    Util.assembleLocString({ start: f.get('start'),
                        end: f.get('end'),
                        ref: this.refSeq.name,
                        strand: f.get('strand')
                    }),f
               );
            fmt( 'Length', Util.addCommas(f.get('end')-f.get('start'))+' bp',f );
            fmt( 'Description', this.getFeatureDescription( f ),f );
            fmt( 'Type', f.get('type'),f );
            fmt( 'Total Depth', f.get('DP'), f);
            fmt( 'Reference Allele', f.get('reference_allele'), f);
            fmt( 'Alternative Allele(s)', f.get('alternative_alleles'), f);
        },

        renderVariantConsequences: function(track, f, featDiv, container) {
            var value = f.get('EFF').values;
            if(typeof value != 'undefined' && value instanceof Array) {
                var snpEffData = this.parseEFFString(value);

                var snpEffContainer = domConstruct.create('div', {
                    className: 'genotypes',
                    innerHTML: '<h2 class="sectiontitle">Variant Consequences ('
                            + snpEffData.length + ')</h2>' }, container );

                var value_container = domConstruct.create(
                        'div',
                        {
                            className: 'value_container genotypes',
                            style: { 'height' : '150px' }
                        }, container);

                var dataStore = new ObjectStore({
                    objectStore: new Memory({
                        data: snpEffData
                    })
                });
                var grid = new EnhancedGrid({
                    selectable: true,
                    store: dataStore,
                    structure: [{
                        "name" : "Effect",
                        "field" : "Effect"
                    }, {
                        "name" : "Effect Impact",
                        "field" : "Effect_Impact"
                    }, {
                        "name" : "Functional Class",
                        "field" : "Functional_Class"
                    }, {
                        "name" : "Codon Change",
                        "field" : "Codon_Change"
                    }, {
                        "name" : "Amino Acid Change",
                        "field" : "Amino_Acid_Change"
                    }, {
                        "name" : "Amino Acid Length",
                        "field" : "Amino Acid length"
                    }, {
                        "name" : "Gene Name",
                        "field" : "Gene_Name"
                    }, {
                        "name" : "Transcript BioType",
                        "field" : "Transcript_BioType"
                    }, {
                        "name" : "Gene Coding",
                        "field" : "Gene_Coding"
                    }, {
                        "name" : "Transcript ID",
                        "field" : "Transcript_ID"
                    }, {
                        "name" : "Exon Rank",
                        "field" : "Exon_Rank"
                    }, {
                        "name" : "Genotype Number",
                        "field" : "Genotype_Number"
                    }]
                }, value_container);
                grid.startup();
            }
        },

        parseEFFString: function(value) {
            var snpEffData = [];
            var headers = ["Effect_Impact", "Functional_Class", "Codon_Change", "Amino_Acid_Change","Amino_Acid_length", "Gene_Name", "Transcript_BioType", "Gene_Coding", "Transcript_ID", "Exon_Rank", "Genotype_Number"];

            for(var i = 0; i < value.length; i++) {
                var pat = /^(\D+)\((.*)\)$/;
                var match = pat.exec(value[i]);
                if (match != null) {
                    var effect = match[1];
                    var attrs = match[2];
                    var splitAttrs = attrs.split("|");
                    var _value = { "Effect" : effect };
                    for(var j = 0; j < splitAttrs.length; j++) {
                        _value[headers[j]] = splitAttrs[j];
                    }
                    snpEffData.push(_value);
                }
            }
            return snpEffData;
        },

        variantColor: function(feature) {
            var colorArray = new Array();
            colorArray = [{'type': 'All_Consequences', 'color': '#ffffff', 'num': '35'},{'type': 'transcript_ablation', 'color': '#ff0000', 'num': '34'},{'type': 'splice_donor_variant', 'color': '#ff7f50', 'num': '33'},{'type': 'splice_acceptor_variant', 'color': '#ff7f50', 'num': '32'},{'type': 'stop_gained', 'color': '#ff0000', 'num': '31'},{'type': 'frameshift_variant', 'color': '#ff69b4', 'num': '30'},{'type': 'stop_lost', 'color': '#ff0000', 'num': '29'},{'type': 'initiator_codon_variant', 'color': '#ffd700', 'num': '28'},{'type': 'inframe_insertion', 'color': '#ff69b4', 'num': '27'},{'type': 'inframe_deletion', 'color': '#ff69b4', 'num': '26'},{'type': 'missense_variant', 'color': '#ffd700', 'num': '25'},{'type': 'transcript_amplification', 'color': '#ff69b4', 'num': '24'},{'type': 'splice_region_variant', 'color': '#ff7f50', 'num': '23'},{'type': 'incomplete_terminal_codon_variant', 'color': '#ff00ff', 'num': '22'},{'type': 'synonymous_variant', 'color': '#76ee00', 'num': '21'},{'type': 'stop_retained_variant', 'color': '#76ee00', 'num': '20'},{'type': 'coding_sequence_variant', 'color': '#458b00', 'num': '19'},{'type': 'mature_miRNA_variant', 'color': '#458b00', 'num': '18'},{'type': '5_prime_UTR_variant', 'color': '#7ac5cd', 'num': '17'},{'type': '3_prime_UTR_variant', 'color': '#7ac5cd', 'num': '16'},{'type': 'non_coding_exon_variant', 'color': '#32cd32', 'num': '15'},{'type': 'non_coding_transcript_variant', 'color': '#32cd32', 'num': '14'},{'type': 'intron_variant', 'color': '#02599c', 'num': '13'},{'type': 'NMD_transcript_variant', 'color': '#ff4500', 'num': '12'},{'type': 'upstream_gene_variant', 'color': '#a2b5cd', 'num': '11'},{'type': 'downstream_gene_variant', 'color': '#a2b5cd', 'num': '10'},{'type': 'TFBS_ablation', 'color': '#a52a2a', 'num': '9'},{'type': 'TFBS_amplification', 'color': '#a52a2a', 'num': '8'},{'type': 'TF_binding_site_variant', 'color': '#a52a2a', 'num': '7'},{'type': 'regulatory_region_variant', 'color': '#a52a2a', 'num': '6'},{'type': 'regulatory_region_ablation', 'color': '#a52a2a', 'num': '5'},{'type': 'regulatory_region_amplification', 'color': '#a52a2a', 'num': '4'},{'type': 'feature_elongation', 'color': '#7f7f7f', 'num': '3'},{'type': 'feature_truncation', 'color': '#7f7f7f', 'num': '2'},{'type': 'intergenic_variant', 'color': '#636363', 'num': '1'}];
            var ve = feature.data.VE;
            var color = "#000000";
            var most_severe_num = 0;
            var msc = feature.data.MSC;
            variantType = "";
            variantType = msc.toString();
            for (var i = 0, len = colorArray.length; i < len; i++) {
                if (colorArray[i].type === variantType) {
                    color = colorArray[i].color;
                }
            }
            return color;
        }
    });
});
