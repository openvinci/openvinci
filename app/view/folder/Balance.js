/**
 * Created on 19/10/2015.
 */
Ext.define('APP.view.folder.Balance', {
    extend: 'Ext.window.Window',
    alias: 'widget.balanceCatalog',
    glyph:112,
    title: 'Balances',
    layout: 'fit',
    autoShow: true,
    modal:true,
    resizable:false,
    width:1000,
    constrainHeader:true,

    initComponent: function() {
        Ext.applyIf(this, {
            items:[{
                xtype: 'treepanel',
                height: 400,
                useArrows: true,
                rootVisible: false,
                autoScroll: true,
                store: 'BalanceTree',
                tbar:[{
                    text:'Imprimir',
                    glyph:'61487@FontAwesome',
                    scale:'medium',
                    disabled:true,
                    itemId:'printBttn',
                    disabled:(APP.acl(38))?false:true,
                    menu:[{
                        glyph: '61755@FontAwesome',
                        text: 'HTML',
                        handler:function(el){
                            var balance = el.up('window').down('[name=balance]').getValue();
                            if(balance){
                                var newWind = window.open("data/reports/balance.php?id="+balance, "balance", "");
                            }
                        }
                    }, {
                        glyph: '61891@FontAwesome',
                        text: 'EXCEL',
                        handler:function(el){
                            var balance = el.up('window').down('[name=balance]').getValue();
                            if(balance){
                                var newWind = window.open("data/reports/balance_exel.php?id="+balance, "balance", "");
                            }
                        }
                    }, {
                        glyph: '61889@FontAwesome',
                        text: 'PDF',
                        handler:function(el){
                            var balance = el.up('window').down('[name=balance]').getValue();
                            if(balance){
                                var newWind = window.open("data/reports/balance_pdf.php?id="+balance, "balance", "");
                            }
                        }
                    }]
                },'->', {
                    xtype: 'combobox',
                    store: 'Balance',
                    name: 'balance',
                    allowBlank: false,
                    fieldLabel: 'Periodo',
                    labelWidth:60,
                    editable: false,
                    valueField:'id',
                    displayField:'periodName',
                    listeners:{change:this.filterTree}
                }],
                columns: [{
                    text: 'No. Cuenta',
                    dataIndex: 'id',
                    width: 100
                }, {
                    xtype: 'treecolumn',
                    text: 'Nombre',
                    flex: 1,
                    dataIndex: 'text'
                },{
                    text:'Balance Inicial',
                    columns: [{
                        text: 'Debe',
                        dataIndex: 'ini_debe',
                        xtype: 'numbercolumn',
                        align:'right'
                    },{
                        text: 'Haber',
                        dataIndex: 'ini_haber',
                        xtype: 'numbercolumn',
                        align:'right'
                    }]
                },{
                    text:'Balance del Periodo',
                    columns: [{
                        text: 'Debe',
                        dataIndex: 'per_debe',
                        xtype: 'numbercolumn',
                        align:'right'
                    },{
                        text: 'Haber',
                        dataIndex: 'per_haber',
                        xtype: 'numbercolumn',
                        align:'right'
                    }]
                },{
                    text:'Balance Final',
                    columns: [{
                        text: 'Debe',
                        dataIndex: 'fin_debe',
                        xtype: 'numbercolumn',
                        align:'right'
                    },{
                        text: 'Haber',
                        dataIndex: 'fin_haber',
                        xtype: 'numbercolumn',
                        align:'right'
                    }]
                }]
            }]
        });
        this.callParent(arguments);
    },
    filterTree:function(el,v){
        var bTree = Ext.getStore('BalanceTree');
        bTree.load({
            params:{balance:v}
        });
    }
});