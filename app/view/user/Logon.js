// JavaScript Document
Ext.define('APP.view.user.Logon' ,{
    extend: 'Ext.panel.Panel',
	alias: 'widget.userlogon',
	width:'100%',
	height:'100%',
	
	initComponent: function() {
        var me = this;
        Ext.applyIf(me, {
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                id:'navToolBar',
                items: ['->',{
                    xtype:'combo',
                    name:'workfolder',
                    fieldLabel: 'Contabilidad',
                    labelWidth:75,
                    store: 'Folders',
                    queryMode: 'local',
                    displayField: 'nombre',
                    valueField: 'id',
                    editable:false,
                    matchFieldWidth:false
                },{
                    xtype:'userbutton'
                }]
            }]
        });
        me.callParent(arguments);
	}
});