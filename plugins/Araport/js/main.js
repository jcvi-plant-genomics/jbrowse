define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dijit/MenuItem',
    'JBrowse/Plugin',
    './View/Dialog/UserGuide'
    ],
    function(
        declare,
        lang,
        dijitMenuItem,
        JBrowsePlugin,
        HelpDialog
    ) {

        return declare(JBrowsePlugin, {
            constructor: function(args) {
                console.log("Loaded Araport plugin");
                var browser = args.browser;

                var thisB = this;
                this.browser.afterMilestone('initView', function() {

                    function showHelp() {
                        new HelpDialog( lang.mixin(thisB.config.araportGuide || {}, { browser: thisB } )).show();
                    }

                    this.browser.addGlobalMenuItem( 'help', new dijitMenuItem(
                            {
                                label: 'Detailed User Guide',
                        iconClass: 'jbrowseIconHelp',
                        onClick: showHelp
                            }));
                }, this );

            }

        });

    });
