define([
        'dojo/_base/declare',
        'JBrowse/Plugin'
    ],
    function(
        declare,
        JBrowsePlugin
    ) {

        return declare(JBrowsePlugin, {
            constructor: function(args) {
                console.log("Loaded 1001GenomesVariants plugin");
                var browser = args.browser;
            }
        });

    });
