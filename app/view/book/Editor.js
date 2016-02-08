/**
 * Created on 19/10/2015.
 */
Ext.define('APP.view.book.Editor', {
    extend: 'Ext.window.Window',
    alias: 'widget.bookEditor',
    glyph:100,
    title: 'Libro de diario',
    layout: 'fit',
    autoShow: true,
    modal:true,
    resizable:false,
    constrainHeader:true,

    initComponent: function() {
        Ext.applyIf(this, {
            items:[{
                xtype:'form',
                border:false,
                padding:5,
                items:[{
                    xtype: 'hidden',
                    name: 'id'
                }, {
                    xtype: 'hidden',
                    name: 'editable',
                    value:true
                }, {
                    xtype: 'hidden',
                    name: 'contabilidad',
                    value: Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0].getValue()
                }, {
                    xtype: 'textfield',
                    fieldLabel: 'Nombre',
                    labelWidth: 70,
                    name: 'nombre',
                    allowBlank: false
                }, {
                    xtype: 'combobox',
                    store: ['auxiliar', 'diario'],
                    name: 'tipo',
                    allowBlank: false,
                    fieldLabel: 'Tipo',
                    labelWidth: 70,
                    editable: false,
                    value:'diario'
                }, {
                    xtype:'fieldset',
                    title:'Numeración de partidas de diario',
                    defaults: {labelWidth:60},
                    items:[{
                        xtype: 'textfield',
                        fieldLabel: 'Prefijo',
                        name: 'prefijo_partida',
                        maxLength:10,
                        allowBlank: false,
                        listeners:{'change':this.updateSample}
                    }, {
                        xtype: 'numberfield',
                        fieldLabel: 'Lugares',
                        name: 'lugares_partida',
                        allowExponential: false,
                        allowDecimals: false,
                        allowBlank: false,
                        value:4,
                        listeners:{'change':this.updateSample}
                    }, {
                        xtype: 'numberfield',
                        fieldLabel: 'Numero',
                        name: 'numero_partida',
                        allowExponential: false,
                        allowDecimals: false,
                        allowBlank: false,
                        value:1,
                        listeners:{'change':this.updateSample}
                    }, {
                        xtype: 'displayfield',
                        name: 'sample',
                        fieldLabel: 'muestra'
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
    },
    updateSample:function(el){
        var frm = el.up('form'),
        values = frm.getValues(),
        sample =APP.consecutive(values.prefijo_partida, values.lugares_partida, values.numero_partida);
        frm.down('[name=sample]').setValue(sample);
    }
});