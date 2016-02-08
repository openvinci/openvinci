/**
 * The application header displayed at the top of the viewport
 * @extends Ext.Component
 */
Ext.define('APP.view.Header', {
    extend: 'Ext.container.Container',    
    dock: 'top',
    baseCls: 'app-header',
	alias:'widget.siteHeader',
    
    initComponent: function() {
        Ext.applyIf(this, {
			tpl:"<img src='style/imgs/icon196x196.png' /><h1>{siteName}</h1>",
			data:config
        });
                
        this.callParent(arguments);
    }
});