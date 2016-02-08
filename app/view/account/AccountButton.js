// JavaScript Document
Ext.define('APP.view.account.AccountButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.accountbutton',
	glyph:61,
	scale:'medium',
	text:'Contabilidad',
	
	initComponent: function() {
		var me = this;
        Ext.apply(me, {
            menu:[]
        });
		me.callParent(arguments);
	}
})