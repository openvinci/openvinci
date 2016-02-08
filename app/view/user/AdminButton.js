// JavaScript Document
Ext.define('APP.view.user.AdminButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.adminbutton',
	glyph:61,
	scale:'medium',
	text:'Administración',
	
	initComponent: function() {
		var me = this;
                Ext.apply(me, {
                    menu:[]
                });
		this.callParent(arguments);
	}
})