// JavaScript Document
Ext.define('APP.view.Viewport', {
	extend: 'Ext.container.Viewport',
	layout: 'fit',
	requires: ['APP.view.Header'],
	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			items: [{
				xtype: 'panel',
				border: false,
				id    : 'viewport',
				layout: {
					type: 'hbox',
					align: 'middle',
					pack: 'center'
				},
				dockedItems: [{xtype:'siteHeader'}],
				items:[{xtype:(Ext.util.Cookies.get('user'))?'userlogon':'userlogin'}]
			}]
		});
		me.callParent(arguments);
	}
});