/**
 * Created by Michel Lopez H on 23/11/2015.
 */
Ext.define('APP.controller.Entries', {
    extend: 'Ext.app.Controller',
    models: ['Entry', 'EntryRow'],
    stores: ['Entries', 'MoreUsedConcepts', 'AccountMajor'],
    views: ['entry.Catalog', 'entry.Editor', 'entry.Major'],
    init: function () {
        this.control({
            '#navToolBar': {
                render: this.loadInterface
            },
            'entryCatalog #addItm':{
                click:this.newEntry
            },
            'entryCatalog gridpanel':{
                itemdblclick: this.editEntry
            },
            'entryEditor #addItm':{
                click: this.addEntryRow
            },
            'entryEditor #saveFrm':{
                click: this.saveEntry
            },
            'entryMajor gridpanel':{
                itemdblclick: this.editEntryFromMajor
            }
        });
    },

    loadInterface: function (el) {
        var dryBtn = Ext.ComponentQuery.query('diarybutton')[0];
        var drymnu = dryBtn.menu;

        drymnu.add({
            glyph:102,
            text:'Operar Partidas',
            handler:function(el){
                var acc=Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0].getValue();
                if(acc){
                    var win = Ext.widget('entryCatalog');
                    Ext.Msg.wait('Cargando', 'buscando datos de la ultima partida');
                    Ext.Ajax.request({
                        url: 'data/entry.php',
                        scope:this,
                        params: {action:'lastentry/'+acc},
                        success: function(response){
                            var text = response.responseText,
                                resp = Ext.decode(text);
                            if(resp.success){
                                win.down('[name=periodo]').setValue(resp.periodo);
                                win.down('[name=libro]').setValue(resp.libro);
                            }else{
                                win.down('[name=periodo]').setValue(Ext.getStore('Periods').first().get('id'));
                            }
                        },
                        failure:function(){
                            win.down('[name=periodo]').setValue(Ext.getStore('Periods').first().get('id'));
                        },
                        callback:function(){
                            Ext.Msg.close();
                        }
                    });
                }else Ext.Msg.alert('Error', 'debe existir al menos una contabilidad definida');
            }
        });

        var prdBtn = Ext.ComponentQuery.query('periodbutton')[0];
        var prdmnu = prdBtn.menu;

        if(APP.acl(35))prdmnu.add({
            glyph:77,
            text:'Mayor General',
            handler:function(el){
                var win = Ext.widget('entryMajor');
                var acc = win.down('[name=cuenta]');
                acc.select(acc.getStore().first());
            }
        });
    },

    newEntry:function(el){
        var win = Ext.widget('entryEditor'),
            book = el.up('window').down('[name=libro]'),
            period = el.up('window').down('[name=periodo]'),
            balance = Ext.getStore('Balance').findRecord('periodo',period.getValue(),0,false,false,true);
            if(balance){
                //this is a closed period
                Ext.Msg.alert('Alerta', 'Este es un periodo cerrado, no se pueden añadir mas partidas');
                win.close();
                return false;
            }

            fId=Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0].getValue(),
            folder =Ext.getStore('Folders').findRecord('id',fId,0,false,false,true);

        var pp =folder.get('prefijo_partida'),
            lp =folder.get('lugares_partida'),
            np =folder.get('numero_partida'),
            consec = APP.consecutive(pp, lp, np);

        win.down('[name=numero_partida]').setValue(consec);
        win.down('[name=libro]').setValue(book.getValue());
        win.down('[name=periodo]').setValue(period.getValue());

        //reloading concepts
        Ext.getStore('MoreUsedConcepts').reload({
            params:{id:fId}
        })
    },

    editEntry:function(el, rec){
        if(APP.acl(17)){
            var win = Ext.widget('entryEditor');
            win.down('form').getForm().loadRecord(rec);

            //get detail accounts array
            var accounts=[];
            Ext.getStore('Accounts').each(function(r){
                var fId=Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0].getValue(),
                    folder =Ext.getStore('Folders').findRecord('id',fId,0,false,false,true);
                if(r.get('detalle') == true && r.get('catalogo') == folder.get('catalogo')){
                    accounts.push([r.get('id'), r.get('id')+' - '+ r.get('nombre')]);
                }
            },this);

            //get current period
            var period=Ext.getStore('Periods').findRecord('id',rec.get('periodo'),0,false,false,true);

            Ext.suspendLayouts();
            win.down('grid').reconfigure(rec.entryrows(),[{
                text: 'cuenta', dataIndex: 'cuenta', width: 100, sortable: true, locked: true,
                editor: {
                    xtype: 'combobox', editable: false,
                    store: accounts,
                    valueField: 'id',
                    displayField: 'nombre',
                    matchFieldWidth: false
                }
            }, {
                text: 'Nombre', dataIndex: 'cuenta', width: 250, sortable: true, locked: true,
                renderer:win.renderAccName,
                summaryType: 'count', summaryRenderer: function(v){return '<b>Total</b>';}
            }, {
                text: 'Debe', dataIndex: 'debe', width: 120, sortable: false, locked:true,
                xtype: 'numbercolumn', align: 'right',
                editor:{xtype:'numberfield', allowExponential:false, minValue:0},
                summaryType: 'sum', summaryRenderer: function(v){return '<b>'+Ext.util.Format.number(v,'0,0.00')+'</b>';}
            }, {
                text: 'haber', dataIndex: 'haber', width:120, sortable: false, locked:true,
                xtype: 'numbercolumn', align: 'right',
                editor:{xtype:'numberfield', allowExponential:false, minValue:0},
                summaryType: 'sum', summaryRenderer: function(v){return '<b>'+Ext.util.Format.number(v,'0,0.00')+'</b>';}
            }, {
                xtype: 'actioncolumn',
                menuDisabled: true,
                align: 'center',
                width: 30,
                locked:true,
                hidden:(APP.acl(17)) ? false : true,
                items: [{
                    icon: 'style/imgs/icon-delete.png',
                    tooltip: 'Borrar',
                    handler: function (grid, rowIndex, colIndex) {
                        var rec = grid.getStore().getAt(rowIndex);

                        var balance=Ext.getStore('Balance').findRecord('periodo',period.get('id'),0,false,false,true);
                        if(balance){
                            Ext.Msg.alert('Alerta', 'Esta partida pertenece a un periodo cerrado, no se puede editar');
                            return false;
                        }

                        var title = 'Alerta',
                            msg = "Desea borrar este elemento?";
                        Ext.Msg.confirm(title, msg, function (btn) {
                            if (btn === 'yes') {
                                rec.destroy({
                                    scope: this,
                                    callback: function () {
                                        grid.getStore().reload();
                                    }
                                })
                            }
                        });
                    }
                }]
            }, {
                text: 'Concepto', dataIndex: 'concepto', width: 250, sortable: true, lockable:false,
                editor:'textfield'
            }, {
                text: 'Marcador', dataIndex: 'marcador', width: 100, sortable: true, lockable:false,
                renderer:win.renderMarker, editor:{  xtype: 'combobox', editable: false,
                    store: 'Markers',
                    valueField: 'id',
                    displayField: 'nombre'
                }

            }, {
                text: 'Proveedor', dataIndex: 'proveedor', width: 120, sortable: true, lockable:false,
                renderer:win.renderSupplier, editor:{  xtype: 'combobox', editable: false,
                    store: 'Suppliers',
                    valueField: 'id',
                    displayField: 'nombre'
                }
            },{
                text: 'Documento',  dataIndex: 'tipo_doc', width: 120, sortable: true, lockable:false,
                renderer:win.renderDocType, editor:{  xtype: 'combobox', editable: false,
                    store: 'DocTypes',
                    valueField: 'id',
                    displayField: 'nombre'
                }
            }, {
                text: 'Serie',  dataIndex: 'serie_doc', width: 120, sortable: true, lockable:false,
                editor:'textfield'
            },{
                text: 'Fecha',  dataIndex: 'fecha_doc',width:90, sortable: true, lockable:false,
                xtype: 'datecolumn', format:'Y-m-d', tooltip:'la fecha esta restringida al rango del periodo',
                editor:{xtype:'datefield', submitFormat: 'Y-m-d', editable:false, minValue:period.get('inicio'), maxValue:period.get('fin'), value:period.get('inicio')}
            }, {
                text: 'Observaciones', dataIndex: 'observaciones',  width: 250, sortable: true, lockable: false,
                editor:'textfield'
            }]);
            win.down('grid').show();
            win.down('[name=account]').enable();
            Ext.resumeLayouts(true);
            win.center();

        }else{
            Ext.Msg.alert('Alerta', 'sin permisos para editar partidas');
        }
    },
    addEntryRow:function(el){
        var prdId=el.up('window').down('[name=periodo]').getValue(),
            balance=Ext.getStore('Balance').findRecord('periodo',prdId,0,false,false,true);
        if(balance){
            Ext.Msg.alert('Alerta', 'Esta partida pertenece a un periodo cerrado, no se puede editar');
            return false;
        }

        var accCmb=el.up('grid').down('#addItmCmb');
        if(accCmb.isValid()){
            //get account id
            var v = accCmb.getValue(),
                accId = accCmb.getModelData().account,
                entryRwStore=el.up('grid').getStore(); //get account store
            //see for duplicate accounts
            if(!entryRwStore.findRecord('cuenta',accId,0,false,false,true)){
                //get entry
                var entryId = el.up('window').down('[name=id]').getValue();
                //get catalog
                var folder = el.up('window').down('[name=contabilidad]').getValue();
                    catalogId=Ext.getStore('Folders').findRecord('id',folder,0,false,false,true).get('catalogo');

                //add new entry row
                entryRwStore.add({
                    partida:entryId,
                    catalogo:catalogId,
                    cuenta:accId
                })
            }else{
                Ext.Msg.alert('Alerta','cuenta duplicada');
            }
        }
    },
    saveEntry:function(el){
        el.up('window').down('[name=account]').disable();
        var frm = el.up('window').down('form'),
            store = Ext.getStore('Entries'),
            values = frm.getForm().getValues();

        var balance=Ext.getStore('Balance').findRecord('periodo',values.periodo,0,false,false,true);
        if(balance){
            Ext.Msg.alert('Alerta', 'Esta partida pertenece a un periodo cerrado, no se puede editar');
            return false;
        }

        if(frm.isValid()){
            el.up('window').down('[name=account]').enable();
            if(values.id){
                //update entry
                var rec = frm.getForm().getRecord();
                rec.set(values);
                if(!rec.dirty)rec.setDirty();
                var rows = el.up('window').down('grid').getStore();
                if(rows.sum('debe')!=rows.sum('haber')){
                    Ext.Msg.alert('Alerta', 'El debe no es igual al Haber');
                    return false;
                }
                rows.sync({
                    scope:this,
                    callback:function(){
                        store.sync({
                            scope:this,
                            callback:function(b, o){
                                store.reload();
                            }
                        });
                    }
                });

            }else{
                //create entry
                var rec = Ext.create('APP.model.Entry',values);
                rec.save({
                    scope:this,
                    callback:function(r,o,s){
                        if(s){
                            var resp=Ext.decode(o.response.responseText);
                            if(resp.success){
                                store.reload({
                                    scope:this,
                                    callback:function(){
                                        //id of last reccord added on resp.msg
                                        var lastEntry =Ext.getStore('Entries').findRecord('id',resp.msg,0,false,false,true);
                                        var entryGrid = Ext.ComponentQuery.query('entryCatalog')[0].down('grid');
                                        entryGrid.getSelectionModel().select(lastEntry);
                                        this.editEntry(entryGrid, lastEntry);
                                    }
                                });
                                //reload stores to get new consecutives
                                Ext.getStore('Folders').reload();
                                Ext.getStore('Books').reload();
                            }else{
                                Ext.Msg.alert('Fallo al crear la partida',resp.msg);
                            }
                        }
                    }
                });
            }
            el.up('window').close();

        }
    },
    editEntryFromMajor:function(el, rec){
        Ext.getStore('Entries').on({
            load: {
                fn:function(store, records, success){

                    if(success){
                        Ext.Msg.close();
                        var eRec=Ext.getStore('Entries').findRecord('id',rec.get('id'),0,false,false,true);
                        this.editEntry(el, eRec);
                    }else{
                        Ext.Msg.alert("Problema al leer los datos,\n es posible que el servidor este apagado");
                    }
                },
                scope: this,
                single: true
            }
        });
        Ext.getStore('Entries').clearFilter(true);
        Ext.Msg.wait('Cargango','Leyendo datos del servidor...');
        Ext.getStore('Entries').filter([
            {property: "libro", value: rec.get('bookId')},
            {property: "periodo", value: rec.get('prdId')}
        ]);
    }
});