/**
 * Created by Michel Lopez H on 29/12/2015.
 */
Ext.define('APP.view.banks.AccountCatalog', {
    extend: 'Ext.window.Window',
    alias: 'widget.accountcatalog',
    glyph:'61852@FontAwesome',
    title: 'Cuentas Bancarias',
    autoShow: true,
    modal: true,
    resizable: false,
    width: 500,
    constrainHeader: true,

    initComponent: function () {
        var me = this;
        Ext.applyIf(me, {
            items:[{
                xtype:'gridpanel',
                height:300,
                autoScroll:true,
                store:'BankAccounts',
                columns:[{
                    text: 'Banco',
                    flex:3,
                    sortable: true,
                    dataIndex: 'banco_nombre'
                },{
                    text: 'Cuenta',
                    flex:2,
                    sortable: true,
                    dataIndex: 'banco_cuenta'
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
                            var editor = Ext.widget('bankAccountEditor');
                            editor.down('form').getForm().loadRecord(rec);
                        },
                        disabled: (APP.acl(33)) ? false : true
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
                                            Ext.getStore('BankAccounts').reload();
                                        }
                                    })
                                }
                            });
                        },
                        disabled: (APP.acl(33)) ? false : true
                    }]
                }],
                tbar:[{
                    glyph: 43,
                    tooltip: 'Agregar Cuenta Bancaria',
                    scale: 'medium',
                    text: 'Agregar',
                    itemId: 'addItm',
                    disabled: (APP.acl(33)) ? false : true
                }]
            }]
        });
        me.callParent(arguments);
    }
});