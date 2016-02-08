/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
Ext.define('APP.view.master.GenericEdit', {
    extend: 'Ext.window.Window',
    alias: 'widget.genericEditMaster',
    glyph:47,
    title: 'Generic view',
    layout: 'fit',
    autoShow: true,
    modal:true,
    resizable:false,
    acl:{}, //access control list definition,
    fieldDefaults:{nombre:''}, //default field values
    width:500,
    constrainHeader:true,

    initComponent: function() {
        this.items=[{
            xtype:'grid',
            store:{
                fields: ['nombre', 'id'],
                data  : [{nombre: '',    id:1}]
            },
            height:300,
            autoScroll:true,
            columns: [
                { text: 'Nombre',  dataIndex: 'nombre', flex:1, sortable : true, editor: {xtype: 'textfield',allowBlank: false} }
            ],
            plugins: [
                Ext.create('Ext.grid.plugin.RowEditing', {clicksToEdit: 2})
            ],
            selType: 'rowmodel',
            tbar:[{
                glyph:43,
                tooltip:'Agregar Elemento',
                scale:'medium',
                text:'Agregar',
                itemId:'add'
            },{
                glyph:88,
                itemId:'del',
                tooltip:'Eliminar Elemento',
                scale:'medium',
                text:'Eliminar',
                disabled:true
            },'->','Double click en la celda para editar']
        }];
        this.callParent(arguments);
    }
});

