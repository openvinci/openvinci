// JavaScript Document
Ext.define('APP.view.user.Login' ,{
    extend: 'Ext.form.Panel',
    alias: 'widget.userlogin',
	bodyPadding: 10,
	frame:true,

	url:'data/users.php',
    baseParams:{action:'login'},

    initComponent: function() {
		var me = this;
		Ext.applyIf(me, {
			defaults:{ anchor: '100%'},
			fieldDefaults:{
				labelAlign: 'left'
			},
			items:[{
				xtype: 'textfield',
				name: 'email',
				fieldLabel: 'Email',
				vtype: 'email',
				allowBlank: false
			},{
                xtype: 'textfield',
                name: 'pass',
                fieldLabel: 'Contraseña',
                inputType: 'password',
                allowBlank: false,
                minLength: 4
			}],
			buttons:[{
				text: 'Acceder',
				formBind: true, 
				disabled: true,
				action:'save'
			}]
		});

        me.callParent(arguments);
    }
});