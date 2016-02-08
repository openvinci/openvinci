// JavaScript Document
Ext.define('APP.view.banks.BankButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.bankbutton',
    glyph:'61852@FontAwesome',
	scale:'medium',
	text:'Bancos',
	
	initComponent: function() {
		var me = this;
        Ext.apply(me, {
            menu:[]
        });
		me.callParent(arguments);
	}
})