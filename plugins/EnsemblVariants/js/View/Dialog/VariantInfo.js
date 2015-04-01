define( [
        'dojo/_base/declare',
        'dojox/grid/EnhancedGrid',
        'dojox/grid/enhanced/plugins/Pagination',
        'dojox/grid/enhanced/plugins/Filter',
        'dojo/store/Memory',
        'dojo/data/ObjectStore',
        'dojo/request/xhr',
        'dojo/domReady!'
        ],

        function(
            declare,
            EnhancedGrid,
            Pagination,
            Filter,
            Memory,
            ObjectStore,
            xhr
            ) {
    return declare( null, {
        genotypeTable: function(track, feature, div) {
            var variant_id = feature.get('name');
            var genotypeElement = document.createElement('div');
            genotypeElement.id = 'genotype-div';
            var row_height = 3;
            var base_height = 7;
            var dataSource = "<p>Data Source: <a target='_blank' href='http://ensemblgenomes.org/'>Ensembl Genomes</a></p>";
            var transcript_consequences = "<p class='tableHeaders'>Variant Consequences</p><div id='tableElement5'></div>";
            var genotype_status = "<p class='tableHeaders'>Genotypes</p><div id='tableElement1'></div>";
            var population_status = "<p class='tableHeaders'>Populations</p><div id='tableElement2'></div>";
            var phenotype_status = "<p class='tableHeaders'>Phenotypes</p><div id='tableElement4'></div>";
            var url_base = 'http://rest.ensemblgenomes.org/variation/arabidopsis_thaliana/';
            var url_genotype = '?content-type=application/json&genotypes=1&pops=1&population_genotypes=1&phenotypes=1';
            var json_genotype_url = url_base + variant_id + url_genotype;
            var url_base2 = 'http://rest.ensemblgenomes.org/vep/Arabidopsis%20thaliana/id/';
            var url_variation = '?content-type=application/json;protein=1;numbers=1;canonical=1;ccds=1;domains=1';
            var json_variation_url = url_base2 + variant_id + url_variation;
            var standby = "<div id='standby1'><img src='plugins/EnsemblVariants/img/ajax-loader.gif'></div>";
            var standby2 = "<div id='standby2'><img src='plugins/EnsemblVariants/img/ajax-loader.gif'></div>";
            var standby3 = "<div id='standby3'><img src='plugins/EnsemblVariants/img/ajax-loader.gif'></div>";
            var standby4 = "<div id='standby4'><img src='plugins/EnsemblVariants/img/ajax-loader.gif'></div>";

            xhr(json_variation_url, {
                handleAs: "json",
                headers: {
                    "X-Requested-With": null
                }
            }).then(function(data2) {
                console.log(data2);
                dataStore5 = new ObjectStore({
                    objectStore: new Memory({
                        data: data2[0].transcript_consequences
                    })
                });
                if (data2[0].transcript_consequences.length > 0) {
                    grid5 = new EnhancedGrid({
                        selectable: true,
                        store: dataStore5,
                        query: {
                            id: "*"
                        },
                        queryOptions: {},
                        structure: [{
                            name: "Amino Acid",
                        field: "amino_acids",
                        width: '8%'
                        }, {
                            name: "Canonical",
                        field: "canonical",
                        width: '8%'
                        }, {
                            name: "Codons",
                        field: "codons",
                        width: '8%'
                        }, {
                            name: "Exon",
                            field: "exon",
                            width: '5%'
                        }, {
                            name: "Intron",
                            field: "intron",
                            width: '5%'
                        }, {
                            name: "Strand",
                            field: "strand",
                            width: '6%'
                        }, {
                            name: "Transcript Id",
                            field: "transcript_id",
                            width: '10%',
                            formatter: function(transcript_id) {
                                if(transcript_id != "") {
                                    linked_id = "<a title='Ensembl' target='_blank' href='http://plants.ensembl.org/Arabidopsis_thaliana/Transcript/Variation_Transcript/Table?db=core;source=Ensembl;v=" + variant_id + ";vdb=variation;t=" + transcript_id + "'>" + transcript_id + "</a>";
                                    return linked_id;
                                } else {
                                    return transcript_id;
                                }
                            }
                        }, {
                            name: "Biotype",
                            field: "biotype",
                            width: '10%'
                        }, {
                            name: "Consequence Term",
                            field: "consequence_terms",
                            width: '20%'
                        }, {
                            name: "Domains",
                            field: "domains",
                            width: '20%',
                            formatter: function(domains){
                                var all_domains="";
                                if( typeof domains != 'undefined' && domains instanceof Array) {
                                    for(var i=0, len=domains.length;i<len;i++) {
                                        var domain_merged  = "<a target='_blank' title='Go to EBI' href='https://www.ebi.ac.uk/interpro/signature/" + domains[i].name + "'>" + domains[i].name + "</a>";
                                        all_domains += domain_merged + ", ";
                                    }
                                }
                                return all_domains;
                            }
                        }],
                        plugins: {
                            filter: {
                                closeFilterbarButton: true
                            },
                            pagination: {
                                pageSizes: ["10", "25", "50", "All"],
                                description: true,
                                sizeSwitch: true,
                                pageStepper: true,
                                gotoButton: true,
                                maxPageStep: 4,
                                position: "top"
                            }
                        }
                    });
                    document.getElementById("standby1").style.display="none";
                    if (data2[0].transcript_consequences.length < 8) {
                        new_height = row_height * data2[0].transcript_consequences.length + base_height;
                        document.getElementById("tableElement5").style.height = new_height + "%";
                    }
                    grid5.placeAt("tableElement5");
                    grid5.startup();
                } else {
                    document.getElementById("standby1").style.display="none";
                    document.getElementById("tableElement5").style.height="3%";
                    document.getElementById("tableElement5").innerHTML = "<p class='nodata'>Genotype data is not available for " + variant_id + ".</p>";
                }
            }, function(err) {
                document.getElementById("standby1").style.display="none";
                console.log("Error while fetching variation data:" + err);
            });

            xhr(json_genotype_url, {
                handleAs: "json",
                headers: {
                    "X-Requested-With": null
                }
            }).then(function(data) {
                console.log(data);
                dataStore = new ObjectStore({
                    objectStore: new Memory({
                        data: data.genotypes
                    })
                });
                dataStore2 = new ObjectStore({
                    objectStore: new Memory({
                        data: data.populations
                    })
                });
                dataStore3 = new ObjectStore({
                    objectStore: new Memory({
                        data: data.population_genotypes
                    })
                });
                dataStore4 = new ObjectStore({
                    objectStore: new Memory({
                        data: data.phenotypes
                    })
                });
                if (data.genotypes.length > 0) {
                    grid = new EnhancedGrid({
                        selectable: true,
                        store: dataStore,
                        query: {
                            id: "*"
                        },
                        queryOptions: {},
                        structure: [{
                            name: "Genotype",
                        field: "genotype",
                        width: '20%'
                        }, {
                            name: "Individual",
                        field: "individual",
                        width: '60%'
                        }],
                        plugins: {
                            filter: {
                                closeFilterbarButton: true
                            },
                        pagination: {
                            pageSizes: ["10", "25", "50", "All"],
                            description: true,
                            sizeSwitch: true,
                            pageStepper: true,
                            gotoButton: true,
                            maxPageStep: 4,
                            position: "top"
                        }
                        }
                    });
                    document.getElementById("standby2").style.display="none";
                    if (data.genotypes.length < 8) {
                        new_height = row_height * data.genotypes.length + base_height;
                        document.getElementById("tableElement1").style.height = new_height + "%";
                    }
                    grid.placeAt("tableElement1");
                    grid.startup();
                } else {
                    document.getElementById("standby2").style.display="none";
                    document.getElementById("tableElement1").style.height="3%";
                    document.getElementById('tableElement1').innerHTML = "<p class='nodata'>Genotype data is not available for " + variant_id + ".</p>";
                }
                if (data.populations.length > 0) {
                    grid2 = new EnhancedGrid({
                        selectable: true,
                        store: dataStore2,
                        query: {
                            id: "*"
                        },
                        queryOptions: {},
                        structure: [{
                            name: "Allele",
                        field: "allele",
                        width: '40%'
                        }, {
                            name: "Population Size",
                        field: "allele_count",
                        width: '20%'
                        }, {
                            name: "Frequency",
                        field: "frequency",
                        width: '20%'
                        }, {
                            name: "Population",
                            field: "population",
                            width: '20%'
                        }],
                        plugins: {
                            filter: {
                                closeFilterbarButton: true
                            },
                            pagination: {
                                pageSizes: ["10", "25", "50", "All"],
                                description: true,
                                sizeSwitch: true,
                                pageStepper: true,
                                gotoButton: true,
                                maxPageStep: 4,
                                position: "top"
                            }
                        }
                    });
                    document.getElementById("standby3").style.display="none";
                    if (data.populations.length < 8) {
                        new_height = row_height * data.populations.length + base_height;
                        document.getElementById("tableElement2").style.height = new_height + "%";
                    }
                    grid2.placeAt("tableElement2");
                    grid2.startup();
                } else {
                    document.getElementById("standby3").style.display = "none";
                    document.getElementById("tableElement2").style.height = "3%";
                    document.getElementById("tableElement2").innerHTML = "<p class='nodata'>Genotype data is not available for " + variant_id + ".</p>";
                }
                if (data.phenotypes.length > 0) {
                    grid4 = new EnhancedGrid({
                        selectable: true,
                        store: dataStore4,
                        query: {
                            id: "*"
                        },
                        queryOptions: {},
                        structure: [{
                            name: "Variants",
                        field: "variants",
                        width: '10%'
                        }, {
                            name: "Source",
                        field: "source",
                        width: '10%'
                        }, {
                            name: "Risk Allele",
                        field: "risk_allele",
                        width: '10%'
                        }, {
                            name: "Trait",
                            field: "trait",
                            width: '40%'
                        }, {
                            name: "Genes",
                            field: "genes",
                            width: '10%'
                        },{
                            name: "PValue",
                            field: "pvalue",
                            width: '10%'
                        },{
                            name: "Study",
                            field: "study",
                            width: '10%'
                        }],
                        plugins: {
                            filter: {
                                closeFilterbarButton: true
                            },
                            pagination: {
                                pageSizes: ["10", "25", "50", "All"],
                                description: true,
                                sizeSwitch: true,
                                pageStepper: true,
                                gotoButton: true,
                                maxPageStep: 4,
                                position: "top"
                            }
                        }
                    });
                    document.getElementById("standby4").style.display = "none";
                    if (data.phenotypes.length < 8) {
                        new_height = row_height * data.phenotypes.length + base_height;
                        document.getElementById("tableElement4").style.height = new_height + "%";
                    }
                    grid4.placeAt("tableElement4");
                    grid4.startup();
                } else {
                    document.getElementById("standby4").style.display = "none";
                    document.getElementById("tableElement4").style.height = "3%";
                    document.getElementById("tableElement4").innerHTML = "<p class='nodata'>Phenotype data is not available for " + variant_id + ".</p>";
                }
            }, function(err) {
                document.getElementById("standby2").style.display = "none";
                document.getElementById("standby3").style.display = "none";
                document.getElementById("standby4").style.display = "none";
                console.log("Error retreiving genotype data:" + err);
            });

            var chr = feature.get('seq_id');
            var fstart = feature.get('start');
            var fend = feature.get('end');
            var ve = feature.data.VE;
            var new_ve="";
            var msc = feature.data.MSC;
            var mscType = msc.toString();
            var alternative_allele = feature.get('alternative_alleles');
            var reference_allele = feature.get('reference_allele');
            var primaryInfoDiv = "<div id='primaryInfo'>";
            var infoTable = "<table class='varTable'>";
            infoTable += "<tr class='even'><td class='varHeader'>Name</td><td class='varValue'><a title='Ensembl' target='_blank' href='http://plants.ensembl.org/Arabidopsis_thaliana/Variation/Population?db=core;vdb=variation;v=" + variant_id + "'>" + variant_id + "</a>" + "</td></tr>";
            infoTable += "<tr class='odd'><td class='varHeader'>Position</td><td class='varValue'>" + chr + ":" + fstart + "-" + fend + "</td></tr>";
            infoTable += "<tr class='even'><td class='varHeader' >Description</td><td class='varValue' >" + feature.get('description') + "</td></tr>";
            infoTable += "<tr class='odd'><td class='varHeader'>Type</td><td class='varValue'>" + feature.get('type') + "</td></tr>";
            infoTable += "<tr class='even'><td class='varHeader'>Most Severe Consequence</td><td class='varValue'>" + mscType + "</td></tr>";
            infoTable += "<tr class='odd'><td class='varHeader' >Reference Allele</td><td class='varValue' >" + reference_allele + "</td></tr>";
            infoTable += "<tr class='even'><td class='varHeader' >Alternative Allele</td><td class='varValue'>" + alternative_allele.values + "</td></tr>";
            if( ve ) {
                if( typeof ve != 'undefined' && ve.values instanceof Array) {
                    if ( ve.values.length < 8) {
                        new_height = row_height * ve.values.length;
                        primaryInfoDiv = "<div id='primaryInfo' height=" + new_height + "% />";
                    } else {
                        primaryInfoDiv = "<div id='primaryInfo' height='30%'>";
                    }
                    for(var i=0, len=ve.values.length;i<len;i++) {
                        var dataSplit  = ve.values[i].split("|");
                        new_ve += "<a title='Go to Thalemine report page' target='_blank' href='/thalemine/portal.do?externalids=" + dataSplit[3]+ "'>" +  dataSplit[3] + "</a> : "+dataSplit[0]+"<br />";
                    }
                }
                infoTable += "<tr class='odd'><td class='varHeader'>Variant Allele</td><td class='varValue'>" + new_ve  + "</td></tr>";
            }
            infoTable += "</table>";
            genotypeElement.innerHTML = primaryInfoDiv + infoTable + "</div>" + transcript_consequences + standby + genotype_status + standby2 + population_status + standby3 + phenotype_status + standby4 + dataSource;
            return genotypeElement;
        },

        variantColor: function(feature) {
            var colorArray = new Array();
            colorArray = [{'type': 'transcript_ablation', 'color': '#ff0000', 'num': '34'},{'type': 'splice_donor_variant', 'color': '#ff7f50', 'num': '33'},{'type': 'splice_acceptor_variant', 'color': '#ff7f50', 'num': '32'},{'type': 'stop_gained', 'color': '#ff0000', 'num': '31'},{'type': 'frameshift_variant', 'color': '#ff69b4', 'num': '30'},{'type': 'stop_lost', 'color': '#ff0000', 'num': '29'},{'type': 'initiator_codon_variant', 'color': '#ffd700', 'num': '28'},{'type': 'inframe_insertion', 'color': '#ff69b4', 'num': '27'},{'type': 'inframe_deletion', 'color': '#ff69b4', 'num': '26'},{'type': 'missense_variant', 'color': '#ffd700', 'num': '25'},{'type': 'transcript_amplification', 'color': '#ff69b4', 'num': '24'},{'type': 'splice_region_variant', 'color': '#ff7f50', 'num': '23'},{'type': 'incomplete_terminal_codon_variant', 'color': '#ff00ff', 'num': '22'},{'type': 'synonymous_variant', 'color': '#76ee00', 'num': '21'},{'type': 'stop_retained_variant', 'color': '#76ee00', 'num': '20'},{'type': 'coding_sequence_variant', 'color': '#458b00', 'num': '19'},{'type': 'mature_miRNA_variant', 'color': '#458b00', 'num': '18'},{'type': '5_prime_UTR_variant', 'color': '#7ac5cd', 'num': '17'},{'type': '3_prime_UTR_variant', 'color': '#7ac5cd', 'num': '16'},{'type': 'non_coding_exon_variant', 'color': '#32cd32', 'num': '15'},{'type': 'non_coding_transcript_variant', 'color': '#32cd32', 'num': '14'},{'type': 'intron_variant', 'color': '#02599c', 'num': '13'},{'type': 'NMD_transcript_variant', 'color': '#ff4500', 'num': '12'},{'type': 'upstream_gene_variant', 'color': '#a2b5cd', 'num': '11'},{'type': 'downstream_gene_variant', 'color': '#a2b5cd', 'num': '10'},{'type': 'TFBS_ablation', 'color': '#a52a2a', 'num': '9'},{'type': 'TFBS_amplification', 'color': '#a52a2a', 'num': '8'},{'type': 'TF_binding_site_variant', 'color': '#a52a2a', 'num': '7'},{'type': 'regulatory_region_variant', 'color': '#a52a2a', 'num': '6'},{'type': 'regulatory_region_ablation', 'color': '#a52a2a', 'num': '5'},{'type': 'regulatory_region_amplification', 'color': '#a52a2a', 'num': '4'},{'type': 'feature_elongation', 'color': '#7f7f7f', 'num': '3'},{'type': 'feature_truncation', 'color': '#7f7f7f', 'num': '2'},{'type': 'intergenic_variant', 'color': '#636363', 'num': '1'}];
            var ve = feature.data.VE;
            var color = "#000000";
            var most_severe_num = 0;
            var msc = feature.data.MSC;
            var variantType = msc.toString();
            for (var i = 0, len = colorArray.length; i < len; i++) {
                if (colorArray[i].type === variantType) {
                    color = colorArray[i].color;
                }
            }
            return color;
        }
    });
});
