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
			    }
			});

		    var filterVariantTypeList = ["All_Variant_Types","deletion","insertion", "SNV", "substitution","sequence_alteration","inversion"];
		    var variantTypeFilters = lang.mixin();

		    for( var id in filterVariantTypeList){
			fname = filterVariantTypeList[id];
			
			variantTypeFilters[fname] = function ( fname ) {
			    return {
				desc: "Show " + fname,
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
   
		    
		    var variantConsequenceFilters = lang.mixin();
		    var colorArray = this.colorArray();

		    for (var type in colorArray) {
			var color = colorArray[type]['color'];
			var num = colorArray[type]['num'];
			var group = colorArray[type]['group'];

			variantConsequenceFilters[type] = function ( type ) {
			    return {
				desc: "<table><tr><td>Show " + type + "</td><td><div style='background-color:" + color + "; width: 10px;'>&nbsp</div></td></tr></table>",
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
		    var colorObject = this.colorArray();

		    return this._getNamedFeatureFilters()
			.then( function( filters) {

			    // merge our builtin filters with additional ones
			    // that might have been generated in
			    // _getNamedFeatureFilters() based on e.g. the VCF
			    // header

			    var filterVariantTypeList = ["All_Variant_Types","deletion","insertion", "SNV", "substitution", "sequence_alteration", "inversion"];
			    var filterConsequenceList = Object.keys(colorObject);
			    var filterMajorGroupList = new Array();
			    var filterSpliceGroupList = new Array();
			    var filterUTRGroupList = new Array();
			    var filterRegulatoryGroupList = new Array();
			    var filterOthersGroupList = new Array();

			    for (var type in colorObject) {
				var group = colorObject[type]['group'];
				if(group == 'Major'){
				    filterMajorGroupList.push(type);
				} else if (group == 'Splice') {
				    filterSpliceGroupList.push(type);
				} else if (group == 'UTR') {
				    filterUTRGroupList.push(type);
				} else if (group == 'Regulatory') {
				    filterRegulatoryGroupList.push(type);
				} else {
				    filterOthersGroupList.push(type);
				}
			    }

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

			    var new_filters = track._makeFeatureFilterTrackMenuItems( filterVariantTypeList, filterMajorGroupList, filterSpliceGroupList, filterUTRGroupList, filterRegulatoryGroupList, filterOthersGroupList, filters);

			    return new_filters;
			});
		},
		_makeFeatureFilterTrackMenuItems: function( typeList, majorGroupList, spliceGroupList, utrGroupList, regulatoryGroupList, othersGroupList, filters ) {
		    var thisB = this;
		    var browser = this.browser;

		    var trackLegend = this.variantTrackLegend();
		    var majorGroupArray = this.makeGroupArray(majorGroupList,filters[0]);
		    var spliceGroupArray = this.makeGroupArray(spliceGroupList,filters[0]);
		    var utrGroupArray = this.makeGroupArray(utrGroupList,filters[0]);
		    var regulatoryGroupArray = this.makeGroupArray(regulatoryGroupList,filters[0]);
		    var othersGroupArray = this.makeGroupArray(othersGroupList,filters[0]);
		    var typeArray = this.makeGroupArray(typeList,filters[1]);

		    return when( filters || this._getNamedFeatureFilters() )
			.then( function( filters ) {

			    var consequenceGroupArray = new Array();
			    consequenceGroupArray = [{label: 'Major Variant Types', title: 'Major Variant Subcategory', children: majorGroupArray},{label: 'Splice Variant Types', title: 'Splice Variant Subcategory', children: spliceGroupArray},{label: 'UTR Variant Types', title:'UTR Variant Subcategory', children: utrGroupArray },{label: 'Regulatory Variant Types', title: 'Regulatory Variant Subcategory', children: regulatoryGroupArray},{label: 'Other Variant Types', title: 'Other Variant Subcategory', children: othersGroupArray}];
			    
			    var new_options =  [
				{
				    label: 'Filter features by consequence type',
				    title: "Choose variant consequence filter.",
				    children: consequenceGroupArray
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
				    content: trackLegend
				}
			    ];
			    var mergedArray =  consequenceGroupArray.concat.apply( consequenceGroupArray, new_options );

			    return new_options;
			});
		}

	    });
	});
