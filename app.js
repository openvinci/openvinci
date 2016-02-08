// JavaScript Document
Ext.Loader.setConfig({enabled: true});
Ext.Ajax.timeout = 120000;
Ext.application({
	name: 'APP',
	appFolder: 'app',
	autoCreateViewport: true,
	controllers: ['MailListener', 'Users', 'Accounts', 'Periods', 'Folders', 'Masters', 'Entries', 'Reports', 'Banks'],
	launch: function() {
		// Add the additional VTypes
		Ext.apply(Ext.form.field.VTypes, {
			password: function(val, field) {
				if (field.initialPassField) {
					var pwd = field.up('form').down('#' + field.initialPassField);
					return (val == pwd.getValue());
				}
				return true;
			},
	
			passwordText: 'Las contraseñas no coinciden'
		});
		//loading glyph fonts
		Ext.setGlyphFontFamily('Pictos');
		//removing loading message
		Ext.select('div.loadingBox').remove();
	}
});
