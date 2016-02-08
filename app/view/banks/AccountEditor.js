/**
 * Created by Michel Lopez H on 29/12/2015.
 */
Ext.define('APP.view.banks.AccountEditor', {
    extend: 'Ext.window.Window',
    alias: 'widget.bankAccountEditor',
    glyph: 77,
    title: 'Editor de cuentas bancarias',
    autoShow: true,
    modal: true,
    resizable: false,
    width: 500,
    constrainHeader: true,

    initComponent: function () {
        var me = this;

        var accounts=[];
        Ext.getStore('Accounts').each(function(r){
            var fId=Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0].getValue(),
                folder =Ext.getStore('Folders').findRecord('id',fId,0,false,false,true);
            if(r.get('detalle') == true && r.get('catalogo') == folder.get('catalogo') && r.get('grupo') == 1){
                accounts.push([r.get('id'), r.get('id')+' - '+ r.get('nombre')]);
            }
        },this);

        Ext.applyIf(me, {
            items:[{
                xtype:'form',
                border:false,
                padding:5,
                items:[{
                    xtype: 'hidden',
                    name: 'id'
                }, {
                    xtype: 'hidden',
                    name: 'contabilidad',
                    value: Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0].getValue()
                }, {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    width: '100%',
                    items: [{
                        xtype: 'textfield',
                        fieldLabel: 'Banco',
                        labelWidth: 60,
                        name: 'banco_nombre',
                        allowBlank: false,
                        flex:1
                    }, {
                        xtype: 'splitter'
                    }, {
                        xtype: 'textfield',
                        fieldLabel: 'Cuenta Bancaria',
                        labelWidth: 100,
                        name: 'banco_cuenta',
                        allowBlank: false,
                        flex:1
                    }]
                },{
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    width: '100%',
                    items:[{
                        xtype: 'combobox',
                        name: 'moneda',
                        store:'Currency',
                        valueField: 'id',
                        displayField: 'nombre',
                        matchFieldWidth: false,
                        fieldLabel: 'Moneda',
                        labelWidth: 60,
                        flex:1,
                        allowBlank: false
                    }, {
                        xtype: 'splitter'
                    }, {
                        xtype: 'combobox',
                        name: 'cuenta',
                        store: accounts,
                        valueField: 'id',
                        displayField: 'nombre',
                        matchFieldWidth: false,
                        fieldLabel: 'Cuenta Contable',
                        labelWidth: 100,
                        flex:1,
                        allowBlank: false,
                        validator: this.accValidator
                    }]
                }, {
                    xtype: 'fieldset',
                    title: 'Cheques',
                    items: [{
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        fieldLabel: 'Numeración',
                        width: '100%',
                        labelStyle: 'padding-top: 20px;',
                        labelWidth: 80,
                        defaults: {labelAlign: 'top'},
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: 'Prefijo',
                            name: 'cheque_prefijo',
                            maxLength: 10,
                            flex: 1,
                            listeners: {'change': this.updateSample}
                        }, {
                            xtype: 'splitter'
                        }, {
                            xtype: 'numberfield',
                            fieldLabel: 'Lugares',
                            name: 'cheque_lugares',
                            allowExponential: false,
                            allowDecimals: false,
                            flex: 1,
                            listeners: {'change': this.updateSample}
                        }, {
                            xtype: 'splitter'
                        }, {
                            xtype: 'numberfield',
                            fieldLabel: 'Número',
                            name: 'cheque_numero',
                            allowExponential: false,
                            allowDecimals: false,
                            flex: 1,
                            listeners: {'change': this.updateSample}
                        }]
                    }, {
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        width: '100%',
                        items: [{
                            xtype: 'displayfield',
                            name: 'sample',
                            fieldLabel: 'Muestra',
                            labelWidth: 80,
                            flex: 1,
                            anchor: '100%'
                        }, {
                            xtype: 'splitter'
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Idioma',
                            name: 'cheque_idioma',
                            labelWidth: 50,
                            flex: 1
                        }]
                    }, {
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        fieldLabel: 'Impresión',
                        width: '100%',
                        labelStyle: 'padding-top: 20px;',
                        labelWidth: 80,
                        defaults: {labelAlign: 'top'},
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: 'Operado',
                            name: 'cheque_operado',
                            flex: 1
                        }, {
                            xtype: 'splitter'
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Revisado',
                            name: 'cheque_revisado',
                            flex: 1
                        }, {
                            xtype: 'splitter'
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Autorizado',
                            name: 'cheque_autorizado',
                            flex: 1
                        }]
                    },{
                        xtype:'checkboxfield',
                        fieldLabel: 'Avisar Sobregiro en Cheques',
                        labelWidth:172,
                        name: 'avisar_sobregiro',
                        inputValue:true
                    }]
                }, {
                    xtype: 'fieldset',
                    title: 'Conciliación Bancaria',
                    items: [{
                        xtype: 'combo',
                        fieldLabel: 'Tipo de Conciliación',
                        labelWidth: 172,
                        name: 'concil_tipo',
                        anchor: '100%',
                        store: [['LaB', 'Libros a Banco'], ['BaL', 'Banco a Libros']]
                    }, {
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        fieldLabel: 'Nombre',
                        width: '100%',
                        labelStyle: 'padding-top: 20px;',
                        labelWidth: 60,
                        defaults: {labelAlign: 'top'},
                        items: [{
                            xtype: 'textfield',
                            fieldLabel: 'Operado',
                            name: 'concil_operado_nombre',
                            flex: 1
                        }, {
                            xtype: 'splitter'
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Revisado',
                            name: 'concil_revisado_nombre',
                            flex: 1
                        }, {
                            xtype: 'splitter'
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Autorizado',
                            name: 'concil_autorizado_nombre',
                            flex: 1
                        }]
                    },{
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        fieldLabel: 'Cargo',
                        width: '100%',
                        labelWidth: 60,
                        items: [{
                            xtype: 'textfield',
                            name: 'concil_operado_cargo',
                            flex: 1
                        }, {
                            xtype: 'splitter'
                        }, {
                            xtype: 'textfield',
                            name: 'concil_revisado_cargo',
                            flex: 1
                        }, {
                            xtype: 'splitter'
                        }, {
                            xtype: 'textfield',
                            name: 'concil_autorizado_cargo',
                            flex: 1
                        }]
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
        me.callParent(arguments);
    },
    accValidator:function(v){
        var store = this.getStore(),
            rec = store.findRecord('field2',v,0,false,false,true),
            rec2 = store.findRecord('field1',v,0,false,false,true);
        if(!rec && !rec2)return 'el valor no es valido'; else return true;
    },
    updateSample:function(el){
        var frm = el.up('form'),
            values = frm.getValues(),
            sample =APP.consecutive(values.cheque_prefijo, values.cheque_lugares, values.cheque_numero);
        frm.down('[name=sample]').setValue(sample);
    }
});