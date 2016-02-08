/**
 * Created on 19/10/2015.
 */
Ext.define('APP.view.folder.Catalog', {
    extend: 'Ext.window.Window',
    alias: 'widget.folderCatalog',
    glyph:100,
    title: 'Catálogo de Contabilidades',
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
                store:'Folders',
                height:300,
                autoScroll:true,
                columns: [{
                    text: 'Nombre',
                    dataIndex: 'nombre',
                    flex: 3,
                    sortable: true
                },{
                    text: 'Catalogo',
                    dataIndex: 'catalogo',
                    flex: 1,
                    sortable: true,
                    renderer:this.catalogName
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
                            var editor = Ext.widget('folderEditor');
                            editor.down('form').getForm().loadRecord(rec);
                            editor.down('#dependencies').down('[inputValue=' + rec.get('id') + ']').disable();
                        },
                        disabled: (APP.acl(3)) ? false : true
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
                        disabled: (APP.acl(3)) ? false : true
                    }]
                }],
                tbar:[{
                    glyph: 43,
                    tooltip: 'Agregar Carpeta',
                    scale: 'medium',
                    text: 'Agregar',
                    itemId: 'addItm',
                    disabled: (APP.acl(3)) ? false : true
                },'->',{
                    glyph:68,
                    scale: 'medium',
                    text:'Importar',
                    tooltip: 'Importar de Vinci 4.5',
                    disabled:(APP.acl(104))?false:true,
                    handler:function(el){
                        var win = Ext.widget('importerMaster');
                    }
                }]
            }]
        });
        this.callParent(arguments);
    },
    catalogName:function(v){
        return Ext.getStore('Catalog').findRecord('id',v,0,false,false,true).get('nombre');
    }
});