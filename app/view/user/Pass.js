Ext.define('APP.view.user.Pass', {
    extend: 'Ext.window.Window',
    alias: 'widget.userpass',
	glyph:117,
    title: 'Cambiar Contraseña',
    layout: 'fit',
    autoShow: true,
    modal:true,
    resizable:false,
	constrainHeader:true,

    initComponent: function() {
        this.items = [{
          xtype: 'form',
          url:'data/users.php',
          baseParams:{action:'changepass'},
          border:false,
          bodyPadding:5,
          defaultType:'textfield',
		  fieldDefaults:{labelWidth:140},
          items: [{
            name : 'oldpass',
			itemId: 'oldpass',
            fieldLabel: 'Contraseña actual',
			inputType:'password',
			minLength: 4,
            allowBlank:false
          },{
            name : 'pass',
			itemId: 'pass',
            fieldLabel: 'Contraseña nueva',
            allowBlank:false,
            inputType:'password',
			minLength: 4,
			allowBlank:false,
			listeners: {
                validitychange: function(field){
                    field.next().validate();
                },
                blur: function(field){
                    field.next().validate();
                }
            }
		  },{
            name : 'pass2',
			itemId: 'pass2',
            fieldLabel: 'Reescribir contraseña',
            inputType:'password',
			minLength: 4,
			vtype: 'password',
            initialPassField: 'pass' // id of the initial password field
          }],
          buttons:[{
          	text: 'Cambiar contraseña',
            action: 'save'
          }]
        }];

        this.callParent(arguments);
    }
});