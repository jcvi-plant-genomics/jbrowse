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

            var accessToken = '3e26d3b2d343ddbdbfb41afd331d7e9';
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
                    }), f
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
                        "name" : "Gene Name",
                        "field" : "Gene_Name",
                        "width" : "10%"
                    },  {
                        "name" : "Transcript ID",
                        "field" : "Transcript_ID",
                        "width" : "10%"
                    }, {
                        "name" : "SO Term",
                        "field" : "Effect",
                        "width" : "30%"
                    }, {
                        "name" : "Biotype",
                        "field" : "Transcript_BioType",
                        "width" : "20%"
                    }, {
                        "name" : "Codon Change",
                        "field" : "Codon_Change",
                        "width" : "10%"
                    }, {
                        "name" : "AA Change",
                        "field" : "Amino_Acid_Change",
                        "width" : "10%"
                    }, {
                        "name" : "AA Length",
                        "field" : "Amino Acid length",
                        "width" : "10%"
                    }],
                    plugins: {
                        filter: {
                            closeFilterbarButton: true
                        }
                    }
                }, value_container);
                grid.startup();
            }
        },

        parseEFFString: function(value) {
            var snpEffData = [];
            var headers = ["Effect_Impact", "Functional_Class", "Codon_Change", "Amino_Acid_Change", "Amino_Acid_length",
                           "Gene_Name", "Transcript_BioType", "Gene_Coding", "Transcript_ID", "Exon_Rank", "Genotype_Number"];

            for(var i = 0; i < value.length; i++) {
                var pat = /^(\w+)\((.*)\)$/;
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
        }
    });
});
