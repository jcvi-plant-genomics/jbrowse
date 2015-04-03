define( [
            'dojo/_base/declare',
            'JBrowse/View/InfoDialog'
        ],
        function(
            declare,
            InfoDialog
        ) {
return declare( InfoDialog, {

    title: "JBrowse Help",

    constructor: function(args) {
        this.browser = args.browser;
        this.defaultContent = this._makeDefaultContent();

        if( ! args.content && ! args.href ) {
            // make a div containing our help text
            this.content = this.defaultContent;
        }
    },

    _makeDefaultContent: function() {
        return    ''
                + '<div class="help_dialog">'
                + '<div class="main" style="float: left; width: 79%;">'

                + '<dl>'
                + '<dt>Introduction</dt>'
                + '<dd><ul>'
	        + '    <li>JBrowse has a double pane interface, with the track list on the left side and the track display on the right. The navigation and search features are all located at the top right below the menu bar.</li>'
                + '</ul></dd>'
	        + '<img src="img/jbrowse_intro.png" height="420px">'
                + '<dt>Moving</dt>'
                + '<dd><ul>'
                + '    <li>Move the view by clicking and dragging in the track area, or by clicking <img class="icon nav" id="moveLeftSmall" src="'+this.browser.resolveUrl('img/Empty.png')+'">  or <img class="icon nav" id="moveRightSmall" src="'+this.browser.resolveUrl('img/Empty.png')+'"> in the navigation bar, or by pressing the left and right arrow keys.</li>'
                + '    <li>Center the view at a point by clicking on either the track scale bar or overview bar, or by shift-clicking in the track area.</li>'
                + '</ul></dd>'
                + '<dt>Zooming</dt>'
                + '<dd><ul>'
                + '    <li>Zoom in and out by clicking <img class="icon nav" id="zoomInSmall" src="'+this.browser.resolveUrl('img/Empty.png')+'"> or <img class="icon nav" id="zoomOutSmall" src="'+this.browser.resolveUrl('img/Empty.png')+'"> in the navigation bar, or by pressing the up and down arrow keys while holding down "shift".</li>'
                + '    <li>Select a region and zoom to it ("rubber-band" zoom) by clicking and dragging in the overview or track scale bar, or shift-clicking and dragging in the track area.</li>'
                + '    </ul>'
	        + '<img src="img/rubberband_zoom.png" height="100px">'
                + '</dd>'
                + '<dt>Showing Tracks</dt>'
                + '<dd><ul><li>Turn a track on by checking its box.</li>'
                + '        <li>Turn a track off by selecting the "X" button on the track header.</li>'
                + '    </ul>'
	        + '<img src="img/displaying_track.png" height="250px">'
                + '</dd>'
                + '<dt>Track Lists</dt>'
                + '<dd><ul><li>The hierarchical track list displays tracks arranged into various categories and sub-categories. </li>'
              + '    </ul>'
	        + '<img src="img/track_types.png" height="300px">'
                + '</dd>'
                + '<dt>Faceted Track Displayer</dt>'
                + '<dd><ul><li>In addition to the tracks available within the hierarchical menu, additional tracks are available through the faceted track displayer. </li>'
	        + '    <li>The comprehensive list of metadata are available on the left hand side and is searchable. The data displayed within the columns are only a subset.</li>'
                + '    </ul>'
	        + '<img src="img/jbrowse_faceted_help.jpg">'
                + '</dd>'
                + '</dl>'
                + '<dl>'
                + '<dt>Searching</dt>'
                + '<dd><ul>'
                + '    <li>Jump to a feature or reference sequence by typing its name in the location box and pressing Enter.</li>'
                + '    <li>Jump to a specific region by typing the region into the location box as: <span class="example">ref:start..end</span>.</li>'
	        + '<img src="img/search_by_position.png" height="150px">'
	        + '   <li>You can also search by locus id and annotation features such as gene symbol and protein name.</li>'
	        + '<img src="img/search_by_other.png" height="300px">'
                + '    </ul>'
                + '</dd>'
                + '<dt>Example Searches</dt>'
                + '<dd>'
                + '    <dl class="searchexample">'
                + '        <dt>uc0031k.2</dt><dd>searches for the feature named <span class="example">uc0031k.2</span>.</dd>'
                + '        <dt>chr4</dt><dd>jumps to chromosome 4</dd>'
                + '        <dt>chr4:79,500,000..80,000,000</dt><dd>jumps the region on chromosome 4 between 79.5Mb and 80Mb.</dd>'
                + '        <dt>5678</dt><dd>centers the display at base 5,678 on the current sequence</dd>'
                + '    </dl>'
                + '</dd>'
                + '<dt>SeqLighter v1.0</dt>'
                + '<dd><ul>'
	        + '   <li>To launch the sequence viewer, right click((Ctrl+click on Mac) a gene model on the ‘Protein Coding Gene Models’ track. Select View Sequence on the dropdown menu.</li>'
	        + '<img src="plugins/SeqLighter/img/seqlighter_image1.png" height="200px">'
	        + '   <li>This will launch a popup screen displaying the nucleotide sequence of the selected gene model. The default format is in CODATA and there are other sequence formats such as FASTA, PRIDE, and RAW to choose from.</li>'
	        + '<img src="plugins/SeqLighter/img/seqlighter_image2.png" height="250px"><br />'
	        + '<li>Flanking Sequence: An option to add upstream and downstream sequences of the gene model is available in 500bp, 1K, 2K, 3K and 4K. </li>'
	        + '<img src="plugins/SeqLighter/img/seqlighter_image3.png" height="120px">'
	        + '<li>When one of these are selected, the additional sequence is highlighted in grey.Note: The flanking sequences will not available in the downloaded image.</li>'
	        + '<img src="plugins/SeqLighter/img/seqlighter_image4.png" height="270px">'
	        + '<li>The downloadable formats include PNG, JPEG and SVG.</li>'
	        + '<img src="plugins/SeqLighter/img/seqlighter_image5.png" height="100px">'
	        + '<li>. In addition, copying and pasting of the elements in the sequence box will retain any selected highlights.</li>'
	        + '<img src="plugins/SeqLighter/img/seqlighter_image7.png" height="300px">'
	        + '<li>Note: The downloaded images will only be in CODATA format.</li>'
	        + '<img src="plugins/SeqLighter/img/seqlighter_image6.png" height="250px">'
	        + '<li>Highlighting options for exons, introns, utrs and start/stop codon is available. In addition, reverse complement of the selected sequence [including flanking regions] is available. </li>'
	        + '<img src="plugins/SeqLighter/img/seqlighter_image8.png" height="300px">'
	        + '<li>When reverse complement is enabled, other highlighting options will not be available. The highlighting is available for all of the sequence formats such as FASTA, PRIDE, CODATA and RAW. </li>'
	        + '<img src="plugins/SeqLighter/img/seqlighter_image9.png" height="300px">'
	        + '<li>This sequence widget was built using the BioJs sequence viewer component. (http://biojs.net/jenkins/target/registry/Biojs.Sequence.html)</li>'
                + '</ul>'
                + '</dd>'
                + '<dt>Variant Tracks Features</dt>'
                + '<dd><ul>'
                + '<li>Select the 1001 Genomes track from the track list.</li>'
	        + '<img src="plugins/EnsemblVariants/img/activate1001GeomesTrack.png" height="600px"><br />'
                + '<li>The 1001 Genomes variant track is color coded by the most severe variant consequence using <a target="_blank" href="http://plants.ensembl.org/info/genome/variation/predicted_data.html#consequence_type_table">Ensembl&#39;s consequence diagram</a>.' 
	        + 'The color legend is available on the track drop down menu.</li>'
	        + '<img src="plugins/EnsemblVariants/img/trackDropDownMenu.png" height="380px">&nbsp&nbsp&nbsp&nbsp<img src="plugins/EnsemblVariants/img/colorLegend.png" height="400px"><br />'
	        + '<li>The track can be filtered by the consequence variation type.:</li>'
	        + '<img src="plugins/EnsemblVariants/img/majorGroupList.png" height="350px"><br />'
	        + '<li>The track can also be filtered by the variant type:</li>'
	        + '<img src="plugins/EnsemblVariants/img/filterByType.png" height="430px"><br />'
                + '<li>The variant feature dialogue box retrieves the data using Ensembl&#39;s <a target="_blank" href="http://rest.ensemblgenomes.org/">REST API</a>.</li>'
                + '<li>To view the variant feature dialogue box, right click(Ctrl+click on Mac) a variant marker on the 1001 Genomes track and select "View Variation Feature from the menu.</li>'
	        + '<img src="plugins/EnsemblVariants/img/waitForResults.png" height="350px"><br />'
	        + '<img src="plugins/EnsemblVariants/img/variantFeatures.png" height="700px"><br />'
                + '</ul></dd>'
                + '<dt>JBrowse Documentation</dt>'
                + '<dd><ul><li><a target="_blank" href="docs/tutorial/">Quick-start tutorial</a></li>'
                + '        <li><a target="_blank" href="http://gmod.org/wiki/JBrowse">JBrowse Configuration Guide</a></li>'
                + '        <li><a target="_blank" href="docs/config.html"><tt>biodb-to-json.pl</tt> reference</a></li>'
                + '        <li><a target="_blank" href="docs/featureglyphs.html">HTMLFeatures class reference</a></li>'
                + '    </ul>'
                + '</dd>'
                + '</dl>'
                + '</div>'

            ;
    }
});
});
