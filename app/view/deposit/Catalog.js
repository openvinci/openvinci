/**
 * Created by Michel Lopez H on 23/11/2015.
 */
Ext.define('APP.view.deposit.Catalog', {
    extend: 'Ext.window.Window',
    alias: 'widget.depositCatalog',
    glyph:102,
    title: 'Diario de Depositos',
    layout: 'fit',
    autoShow: true,
    modal:true,
    resizable:false,
    width:1000,
    constrainHeader:true,
    searchValue: null, //search value initialization
    indexes: [], //The row indexes where matching strings are found. (used by previous and next buttons)
    currentIndex: null, //The row index of the first search, it could change if next or previous buttons are used.
    searchRegExp: null, //The generated regular expression used for searching.
    matchCls: 'x-livesearch-match', //The matched string css class.

    initComponent: function() {
        var me = this;
        Ext.applyIf(me, {
            tbar:[{
                glyph: 43,
                tooltip: 'Agregar Cheque',
                scale: 'medium',
                text: 'Agregar',
                itemId: 'addItm',
                disabled: (APP.acl(25)) ? false : true
            },'->', {
                xtype:'hidden',
                name:'tipo_partida'
            },{
                xtype: 'combobox',
                store: 'Periods',
                name: 'periodo',
                allowBlank: false,
                fieldLabel: 'Periodo',
                labelWidth: 50,
                editable: false,
                valueField: 'id',
                displayField: 'nombre',
                listeners: {change: this.filterEntries}
            },{
                xtype: 'combobox',
                store: 'BankAccounts',
                name: 'bankAccount',
                allowBlank: false,
                fieldLabel: 'Cuenta Bancaria',
                labelWidth: 100,
                width:400,
                editable: false,
                valueField: 'cuenta',
                displayField: 'accSignature',
                listeners: {change: this.filterEntries}
            },{
                text:'Imprimir',
                glyph:'61487@FontAwesome',
                scale:'medium',
                itemId:'printBttn'
                //disabled:(APP.acl(20))?false:true
            }],
            bbar:[{
                xtype: 'textfield',
                name: 'searchField',
                fieldLabel: 'Buscar',
                labelWidth:60,
                width: 300,
                listeners: {
                    change: {
                        fn: me.onTextFieldChange,
                        scope: me,
                        buffer: 500
                    }
                }
            },{
                xtype: 'button',
                text: '&lt;',
                tooltip: 'Anterior',
                handler: me.onPreviousClick,
                scope: me
            },{
                xtype: 'button',
                text: '&gt;',
                tooltip: 'Siguiente',
                handler: me.onNextClick,
                scope: me
            },'-','->','doble click en la partida para editarla'],
            items:[{
                xtype:'grid',
                store:'Deposits',
                height:400,
                autoScroll:true,
                features: [{
                    ftype: 'summary'
                }],
                columns:[{
                    text: 'Fecha',
                    dataIndex: 'fecha',
                    xtype: 'datecolumn',
                    format:'Y-m-d',
                    width:90,
                    sortable: true
                },{
                    text: 'Tipo',
                    dataIndex: 'tipo_partida',
                    width:60,
                    sortable: true,
                    renderer:this.docTypeRenderer
                }, {
                    text: 'No. de partida',
                    dataIndex: 'numero_partida',
                    width:120,
                    sortable: true
                }, {
                    text: 'Referencia',
                    dataIndex: 'referencia',
                    width:120,
                    sortable: true
                }, {
                    text: 'Concepto',
                    dataIndex: 'concepto',
                    flex: 1,
                    sortable: true,
                    summaryType: 'count',
                    summaryRenderer: function(v){return '<b>Total</b>';}
                }, {
                    text: 'Valor',
                    dataIndex: 'valor',
                    width: 120,
                    sortable: false,
                    xtype: 'numbercolumn',
                    align: 'right',
                    summaryType: 'sum',
                    summaryRenderer: function(v){return '<b>'+Ext.util.Format.number(v,'0,0.00')+'</b>';}
                }, {
                    xtype: 'actioncolumn',
                    text:'Anulada',
                    menuDisabled: true,
                    align: 'center',
                    width: 80,
                    items: [{
                        tooltip: 'Anular',
                        getClass:me.cancelRenderer,
                        handler: function (grid, rowIndex, colIndex) {
                            var rec = grid.getStore().getAt(rowIndex);

                            var balance=Ext.getStore('Balance').findRecord('periodo',rec.get('periodo'),0,false,false,true);
                            if(balance){
                                Ext.Msg.alert('Alerta', 'Esta partida pertenece a un periodo cerrado, no se puede anular');
                                return false;
                            }

                            if(!rec.get('anulado')){
                                var title = 'Desea anular esta partida?',
                                    msg = "Este cambio no se podrá deshacer";
                                Ext.Msg.confirm(title, msg, function (btn) {
                                    if (btn === 'yes') {
                                        rec.set('anulado',false);
                                        rec.set('concepto','Anulada');
                                        rec.save({
                                            callback:function(){
                                                Ext.getStore('Entries').reload();
                                            }
                                        });
                                    }
                                });
                            }
                        },
                        disabled: (APP.acl(27)) ? false : true
                    }]
                }, {
                    xtype: 'actioncolumn',
                    menuDisabled: true,
                    align: 'center',
                    width: 30,
                    hidden:(APP.acl(28)) ? false : true,
                    items: [{
                        icon: 'style/imgs/icon-delete.png',
                        tooltip: 'Borrar',
                        handler: function (grid, rowIndex, colIndex) {
                            var rec = grid.getStore().getAt(rowIndex);

                            var balance=Ext.getStore('Balance').findRecord('periodo',rec.get('periodo'),0,false,false,true);
                            if(balance){
                                Ext.Msg.alert('Alerta', 'Este cheque pertenece a un periodo cerrado, no se puede borrar');
                                return false;
                            }

                            var title = 'Alerta',
                                msg = "Desea borrar este elemento?";
                            Ext.Msg.confirm(title, msg, function (btn) {
                                if (btn === 'yes') {
                                    rec.destroy({
                                        scope: this,
                                        callback: function () {
                                            Ext.getStore('Checks').reload();
                                        }
                                    })
                                }
                            });
                        }
                    }]
                }]
            }]
        });
        me.callParent(arguments);
    },
    cancelRenderer:function(v, m){
        if(m.record.get('anulada')) return 'iconDelete';
        else return 'iconCheck';
    },
    docTypeRenderer:function(v){
        if(v) return Ext.getStore('EntryTypes').findRecord('id',v,0,false,false,true).get('nombre');
        else return '';
    },
    filterEntries:function(el,v){
        Ext.getStore('Deposits').clearFilter(true);
        var period = el.up('window').down('[name=periodo]'),
            bankAccount = el.up('window').down('[name=bankAccount]'),
            entryType=el.up('window').down('[name=tipo_partida]');

        Ext.getStore('Deposits').filter([
            {property: "cuenta", value: bankAccount.getValue()},
            {property: "periodo", value: period.getValue()},
            {property: "tipo_partida", value: entryType.getValue()}
        ]);
    },
    onTextFieldChange:function(){
        var me = this, count = 0;

        me.down('gridpanel').view.refresh();

        me.searchValue = me.down('[name=searchField]').getValue();
        me.indexes = [];
        me.currentIndex = null;

        if (me.searchValue !== null) {
            me.searchRegExp = new RegExp(me.searchValue, 'gi');

            me.down('gridpanel').getStore().each(function(record, idx) {
                var td = Ext.fly(me.down('gridpanel').view.getNode(idx)).down('td'),
                    cell, matches, cellHTML;
                while(td) {
                    cell = td.down('.x-grid-cell-inner');
                    matches = cell.dom.innerHTML.match(/<[^>]*>/gm);
                    cellHTML = cell.dom.innerHTML.replace(/<[^>]*>/gm, '\x0f');

                    // populate indexes array, set currentIndex, and replace wrap matched string in a span
                    cellHTML = cellHTML.replace(me.searchRegExp, function(m) {
                        count += 1;
                        if (Ext.Array.indexOf(me.indexes, idx) === -1) {
                            me.indexes.push(idx);
                        }
                        if (me.currentIndex === null) {
                            me.currentIndex = idx;
                        }
                        return '<span class="' + me.matchCls + '">' + m + '</span>';
                    });
                    // restore protected tags
                    Ext.each(matches, function(match) {
                        cellHTML = cellHTML.replace('\x0f', match);
                    });
                    // update cell html
                    cell.dom.innerHTML = cellHTML;
                    td = td.next();
                }
            }, me);

            // results found
            if (me.currentIndex !== null) {
                me.down('gridpanel').getSelectionModel().select(me.currentIndex);
            }
        }

        // no results found
        if (me.currentIndex === null) {
            me.down('gridpanel').getSelectionModel().deselectAll();
        }

        // force textfield focus
        me.down('[name=searchField]').focus();
    },
    onPreviousClick:function(){
        var me = this, idx;
        if ((idx = Ext.Array.indexOf(me.indexes, me.currentIndex)) !== -1) {
            me.currentIndex = me.indexes[idx - 1] || me.indexes[me.indexes.length - 1];
            me.down('grid').getSelectionModel().select(me.currentIndex);
        }
    },
    onNextClick:function(){
        var me = this, idx;
        if ((idx = Ext.Array.indexOf(me.indexes, me.currentIndex)) !== -1) {
            me.currentIndex = me.indexes[idx + 1] || me.indexes[0];
            me.down('grid').getSelectionModel().select(me.currentIndex);
        }
    }
});