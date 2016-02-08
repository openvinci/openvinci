// JavaScript Document
// JavaScript Document
Ext.define('APP.view.user.UserButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.userbutton',
	glyph:42,
	iconAlign:'left',
	scale:'medium',
	initComponent: function() {
		this.text='Mi cuenta';
		this.menu=[{
			text:'Cerrar la sesion',
			itemId:'closeSess',
            glyph:'61457@FontAwesome'
		},{
			text:'Cambiar la contraseña',
			itemId:'changePass',
			glyph:47
		}];
		this.callParent(arguments);
	}
})