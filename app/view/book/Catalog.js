/**
 * Created on 19/10/2015.
 */
Ext.define('APP.view.book.Catalog', {
    extend: 'Ext.window.Window',
    alias: 'widget.bookCatalog',
    glyph:100,
    title: 'Libros de Diario',
    layout: 'fit',
    autoShow: true,
    modal:true,
    resizable:false,
    width:600,
    constrainHeader:true,

    initComponent: function() {
        Ext.applyIf(this, {
            items:[{
                xtype:'grid',
                store:'Books',
                height:300,
                autoScroll:true,
                columns: [{
                    text: 'Nombre',
                    dataIndex: 'nombre',
                    flex: 2,
                    sortable: true
                },{
                    text: 'Tipo',
                    dataIndex: 'tipo',
                    width: 80,
                    sortable: true
                },{
                    text: 'Consecutivo',
                    dataIndex: 'prefijo_partida',
                    flex: 1,
                    sortable: true,
                    renderer:this.renderConsecutive
                },{
                    xtype: 'actioncolumn',
                    menuDisabled: true,
                    align: 'center',
                    width: 30,
                    items: [{
                        icon: 'style/imgs/icon-edit.png',
                        tooltip: 'Editar',
                        handler: function (grid, rowIndex, colIndex) {
                            var rec = grid.getStore().getAt(rowIndex);
                            var editor = Ext.widget('bookEditor');
                            editor.down('form').getForm().loadRecord(rec);
                            if(!rec.get('editable')){
                                editor.down('[name=tipo]').disable();
                            }
                        },
                        disabled: (APP.acl(21)) ? false : true
                    }]
                },{
                    xtype: 'actioncolumn',
                    menuDisabled: true,
                    align: 'center',
                    width: 30,
                    items: [{
                        icon: 'style/imgs/icon-delete.png',
                        tooltip: 'Borrar',
                        handler: function (grid, rowIndex, colIndex) {
                            var rec = grid.getStore().getAt(rowIndex);
                            if(!rec.get('editable')){
                                Ext.Msg.alert('Error','Este libro es del sistema, no se puede borrar');
                                return;
                            }
                            var title = 'Alerta',
                                msg = "Desea borrar este elemento?";
                            Ext.Msg.confirm(title, msg, function (btn) {
                                if (btn === 'yes') {
                                    rec.destroy({
                                        scope:this,
                                        callback:function(){
                                            Ext.getStore('Folders').reload();
                                        }
                                    })
                                }
                            });
                        },
                        disabled: (APP.acl(21)) ? false : true
                    }]
                }],
                tbar:[{
                    glyph: 43,
                    tooltip: 'Agregar Libro',
                    scale: 'medium',
                    text: 'Agregar',
                    itemId: 'addItm',
                    disabled: (APP.acl(21)) ? false : true
                }]
            }]
        });
        this.callParent(arguments);
    },
    renderConsecutive:function(v, mtDt, record){
        return APP.consecutive(v,record.get('lugares_partida'),record.get('numero_partida'));
    }
});