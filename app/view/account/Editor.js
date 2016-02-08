/**
 * Created on 25/09/2015.
 */
Ext.define('APP.view.account.Editor', {
    extend: 'Ext.window.Window',
    alias: 'widget.accountEditor',
    glyph:77,
    title: 'Editor de Cuentas',
    layout: 'fit',
    autoShow: true,
    modal:true,
    resizable:false,
    constrainHeader:true,

    initComponent: function() {
        Ext.applyIf(this, {
            items:[{
                xtype:'form',
                action:'data/accounts.php',
                padding: 5,
                border:false,
                items:[{
                    xtype: 'hidden',
                    name: 'action' //create or update
                },{
                    xtype: 'hidden',
                    name: 'catalogo'
                },{
                    xtype: 'hidden',
                    name: 'nivel'
                },{
                    xtype: 'fieldcontainer',
                    fieldLabel: 'No. de cuenta',
                    labelStyle: 'padding:20px 0 0 0',
                    defaults: {labelAlign: 'top'},
                    layout: 'hbox',
                    items: [{
                        flex: 1,
                        xtype: 'textfield',
                        fieldLabel: 'Cuenta Padre',
                        name: 'padre',
                        readOnly:true
                    }, {
                        xtype: 'splitter'
                    }, {
                        xtype: 'textfield',
                        fieldLabel: 'Id',
                        flex: 1,
                        name: 'id',
                        validator:function(v){
                            if(v.indexOf('/')==-1)return true;
                            else return 'el caracter "/" no puede usarse como separador en las cuentas';
                        }
                    }]
                }, {
                    xtype: 'textfield',
                    fieldLabel: 'Nombre',
                    name: 'nombre',
                    allowBlank: false,
                    width: 460
                },{
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    items:[{
                        xtype: 'combobox',
                        width:225,
                        store: [[true,'Detalle'], [false,'General']],
                        name: 'detalle',
                        allowBlank:false,
                        fieldLabel:'Tipo de Cuenta',
                        editable:false
                    }, {
                        xtype: 'splitter'
                    }, {
                        xtype:'combo',
                        name:'grupo',
                        width:230,
                        fieldLabel: 'Grupo Contable',
                        store: 'Groups',
                        queryMode: 'local',
                        displayField: 'nombre',
                        valueField: 'id',
                        allowBlank:false,
                        editable:false
                    }]
                }],
                buttons:[{
                    xtype:'button',
                    text:'Cancelar',
                    itemId:'resetFrm',
                    scale:'medium',
                    handler:function(el){el.up('window').close()}
                },'->',{
                    xtype:'button',
                    itemId:'saveFrm',
                    action: 'save',
                    scale:'medium',
                    text:'Guardar'
                }]
            }]
        });
        this.callParent(arguments);
    }
});