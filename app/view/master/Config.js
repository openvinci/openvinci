/**
 * Created on 21/10/2015.
 */
Ext.define('APP.view.master.Config', {
    extend: 'Ext.window.Window',
    alias: 'widget.windowConfig',
    glyph:42,
    title: 'Configuración',
    layout: 'fit',
    autoShow: true,
    modal:true,
    resizable:false,
    width:500,
    constrainHeader:true,

    initComponent: function() {
        Ext.applyIf(this, {
            items:[{
                xtype: 'propertygrid',
                source:{email:'', tpCierre:'', tpApertura:''},
                sourceConfig:{
                    email:{
                        editor:Ext.create('Ext.form.field.Text', {vtype: 'email'})
                    },
                    tpCierre:{
                        editor:Ext.create('Ext.form.field.ComboBox', {
                            store:'EntryTypes',
                            valueField: 'id',
                            displayField: 'nombre'
                        })
                    },
                    tpApertura:{
                        editor:Ext.create('Ext.form.field.ComboBox', {
                            store:'EntryTypes',
                            valueField: 'id',
                            displayField: 'nombre'
                        })
                    }
                },
                buttons:[{
                    text:'Guardar Cambios',
                    itemId:'saveBttn'
                }]
            }]
        });
        this.callParent(arguments);
    }
});