Ext.define('APP.view.user.EditUsers', {
    extend: 'Ext.window.Window',
    alias: 'widget.users',
	glyph:117,
    title: 'Usuarios',
    layout: 'fit',
    autoShow: true,
    modal:true,
    resizable:false,
    width:800,
    layout:'column',
    constrainHeader:true,

    initComponent: function() {
        var tpl=Ext.create('Ext.XTemplate',
                '{[ Ext.getStore("UserGroups").findRecord("id",values.name, false, false, false, true).get("name") ]}'			
        );
        this.items=[{
            columnWidth: 0.3,
            xtype:'grid',
            columns: [
                { text: 'Nombre',  dataIndex: 'name', flex:1, sortable : true},
            ],
            features: [{ftype:'grouping', groupHeaderTpl:tpl}],
            store:'Users',
            height:300,
            autoScroll:true,
            tbar:[{
                glyph:43,
                tooltip:'Agregar usuario',
                scale:'medium',
                text:'Agregar',
                itemId:'addUsr'
            },{
                glyph:88,
                itemId:'delUsr',
                tooltip:'Eliminar usuario',
                scale:'medium',
                text:'Eliminar',
                disabled:true
            }]
        },{
            columnWidth: 0.7,
            itemId:'editForm',
            height:300,
            xtype:'form',
            disabled:true,
            action:'',
            border:false,
            fieldDefaults:{labelWidth:60},
            layout:'column',
            items:[{
                columnWidth: 0.55,
                height:260,
                border:false,
                layout:'form',
                autoScroll:true,
                padding:4,
                items:[{
                    xtype:'textfield',
                    fieldLabel:'Nombre',
                    name:'name',
                    allowBlank:false
                },{
                    xtype:'textfield',
                    fieldLabel:'eMail',
                    name:'email',
                    vtype: 'email',
                    allowBlank:false
                },{
                    xtype:'combo',
                    itemId:'groupBox',
                    name:'type',
                    fieldLabel: 'Grupo',
                    store: 'UserGroups',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id'
                },{
                    xtype:'checkboxfield',
                    fieldLabel: 'Activo',
                    name: 'active',
                    inputValue:true
                },{
                    xtype: 'fieldset',
                    defaultType: 'textfield',
                    padding:'0 5 5 5',
                    layout: 'hbox',
                    fieldDefaults: {
                        msgTarget: 'under',
                        labelAlign: 'top'
                    },
                    items:[{
                        name : 'pass',
                        itemId: 'pass',
                        fieldLabel: 'Contraseña',
                        inputType:'password',
                        allowBlank:false,
                        minLength: 4,
                        flex: 1,
                        listeners: {
                            validitychange: function(field){
                                field.up('window').down('#pass2').validate();
                            },
                            blur: function(field){
                                field.up('window').down('#pass2').validate();
                            }
                        }
                    },{
                        xtype:'splitter'
                    },{
                        name : 'pass2',
                        itemId: 'pass2',
                        xtype:'textfield',
                        fieldLabel: 'Reescribir contraseña',
                        inputType:'password',
                        vtype: 'password',
                        minLength: 4,
                        flex: 1,
                        initialPassField: 'pass' // id of the initial password field
                    }]
                }]
            },{
                columnWidth: 0.45,
                layout:'form',
                border:false,
                height:260,
                padding:4,
                autoScroll:true,
                style:'border-left:1px solid silver',
                defaults: {
                    anchor:'100%',
                    labelWidth: 50
                },
                items:[{
                    xtype:'checkboxgroup',
                    fieldLabel:'Permisos',
                    labelWidth:60,
                    columns: 1,
                    vertical: true,
                    loader:{
                        url: 'data/permits.php',
                        renderer: 'component',
                        autoLoad:true
                    }
                }]
            }],			
            buttons:[{
            xtype:'button',
                text:'Cancelar',
                itemId:'resetUsr',
                action: 'reset',
                scale:'medium'
            },'->',{
                xtype:'button',
                itemId:'saveUsr',
                action: 'save',
                scale:'medium',
                text:'Guardar'
            }]
        }];
        this.callParent(arguments);
    }
});