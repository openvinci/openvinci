// JavaScript Document
Ext.define('APP.view.reports.ReportsButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.reportsbutton',
    glyph:'61487@FontAwesome',
	scale:'medium',
	text:'Reportes',
	
	initComponent: function() {
		var me = this;
        Ext.apply(me, {
            menu:[]
        });
		me.callParent(arguments);
	}
})