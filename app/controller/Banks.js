/**
 * Created by Michel Lopez H on 22/12/2015.
 */
Ext.define('APP.controller.Banks', {
    extend: 'Ext.app.Controller',
    models: ['Currency', 'Payee', 'BankAccount', 'Check', 'CheckRow', 'Deposit', 'DepositRow'],
    stores: ['Currency', 'Payees', 'BankAccounts', 'Checks', 'Deposits'],
    views: ['banks.BankButton','banks.AccountCatalog','banks.AccountEditor',
    'check.Catalog','check.Editor', 'deposit.Catalog','deposit.Editor'],
    init: function () {
        this.control({
            '#navToolBar': {
                render: this.loadInterface
            },
            'accountcatalog #addItm':{
                click:this.addAccount
            },
            'bankAccountEditor #saveFrm':{
                click:this.saveAccount
            },
            'checkCatalog #addItm':{
                click:this.newCheckEntry
            },
            'checkCatalog gridpanel':{
                itemdblclick: this.editCheckEntry
            },
            'checkEditor #addItm':{
                click: this.addItemRow
            },
            'checkEditor #saveFrm':{
                click: this.saveCheckEntry
            },
            'depositCatalog #addItm':{
                click:this.newDepositEntry
            },
            'depositCatalog gridpanel':{
                itemdblclick: this.editDepositEntry
            },
            'depositEditor #addItm':{
                click: this.addItemRow
            },
            'depositEditor #saveFrm':{
                click: this.saveDepositEntry
            }
        });
    },

    loadInterface: function (el) {
        //add menu button
        var bnkBtn = el.insert(1,{xtype:'bankbutton'});
        var bnkmnu = bnkBtn.menu;

        if(APP.acl(107))bnkmnu.add({
            text:'Catalogo de monedas',
            glyph:'61781@FontAwesome',
            params: {title:'Catalogo de monedas', store:'Currency',
                columns: [{
                    text: 'Nombre', dataIndex: 'nombre', flex: 2, sortable: true,
                    editor: {xtype: 'textfield', allowBlank: false}
                },{
                    text: 'Simbolo',  dataIndex: 'simbolo', flex:1, sortable : true,
                    editor: {xtype: 'textfield',allowBlank: false}
                }],
                acl:{ create:107, update:107, destroy:107}
            },
            handler: this.getController('Masters').setGenericEditView
        });

        if(APP.acl(108))bnkmnu.add({
            glyph:'61447@FontAwesome',
            text:'Catalogo de beneficiarios',
            itemId:'payeeCatalog',
            params: {title:'Catalogo de beneficiarios', store:'Payees',
                columns: [{
                    text: 'Nombre', dataIndex: 'nombre', flex: 1, sortable: true,
                    editor: {xtype: 'textfield', allowBlank: false}
                },{
                    text: 'Cuenta Bancaria', dataIndex: 'banco', flex: 1, sortable: true,
                    editor: {
                        xtype: 'combobox',
                        store: 'BankAccounts',
                        valueField: 'id',
                        displayField: 'accSignature',
                        editable:false
                    },
                    renderer:function(v){
                        return Ext.getStore('BankAccounts').findRecord('id',v,0,false,false,true).get('accSignature');
                    }
                }],
                fieldDefaults:{nombre:'', contabilidad:'', banco:''},
                acl:{ create:108, update:108, destroy:108}
            },
            handler: Ext.Function.createSequence(function(el){
                //update payees defaults
                var bnkBttn=Ext.ComponentQuery.query('bankbutton')[0];
                var bnkMnu=bnkBttn.menu;
                bnkMnu.down('#payeeCatalog').params.fieldDefaults.banco=Ext.getStore('BankAccounts').first().get('id');
            }, this.getController('Masters').setGenericEditView)
        });

        if(APP.acl(33))bnkmnu.add({
            text:'Cuentas Bancarias',
            glyph:'61852@FontAwesome',
            handler:function(){
                Ext.getStore('BankAccounts').reload();
                var win = Ext.widget('accountcatalog');
            }
        });

        bnkmnu.add({
            xtype:'menuseparator'
        },{
            text: 'Cheques',
            glyph: '61815@FontAwesome',
            handler: function () {
                Ext.getStore('Checks').clearFilter(true);
                var win = Ext.widget('checkCatalog');
                win.down('[name=bankAccount]').select(Ext.getStore('BankAccounts').first());
                win.down('[name=periodo]').select(Ext.getStore('Periods').first());
                var entryType = Ext.getStore('EntryTypes').findRecord('nombre', 'CHE', 0, false, false, true).get('id');
                win.down('[name=tipo_partida]').setValue(entryType);
            }
        }, {
            text: 'Notas de Débito',
            glyph: '61815@FontAwesome',
            handler: function () {
                Ext.getStore('Checks').clearFilter(true);
                var win = Ext.widget('checkCatalog');
                win.setTitle('Diario de Notas de Débito');
                win.down('[name=bankAccount]').select(Ext.getStore('BankAccounts').first());
                win.down('[name=periodo]').select(Ext.getStore('Periods').first());
                var entryType = Ext.getStore('EntryTypes').findRecord('nombre', 'NDB', 0, false, false, true).get('id');
                win.down('[name=tipo_partida]').setValue(entryType);
            }
        }, {
            xtype:'menuseparator'
        }, {
            text: 'Depositos',
            glyph: '61816@FontAwesome',
            handler: function () {
                Ext.getStore('Deposits').clearFilter(true);
                var win = Ext.widget('depositCatalog');
                win.down('[name=bankAccount]').select(Ext.getStore('BankAccounts').first());
                win.down('[name=periodo]').select(Ext.getStore('Periods').first());
                var entryType = Ext.getStore('EntryTypes').findRecord('nombre', 'DEP', 0, false, false, true).get('id');
                win.down('[name=tipo_partida]').setValue(entryType);
            }
        }, {
            text: 'Notas de Crédito',
            glyph: '61816@FontAwesome',
            handler: function () {
                Ext.getStore('Deposits').clearFilter(true);
                var win = Ext.widget('depositCatalog');
                win.setTitle('Diario de Notas de Crédito');
                win.down('[name=bankAccount]').select(Ext.getStore('BankAccounts').first());
                win.down('[name=periodo]').select(Ext.getStore('Periods').first());
                var entryType = Ext.getStore('EntryTypes').findRecord('nombre', 'NCR', 0, false, false, true).get('id');
                win.down('[name=tipo_partida]').setValue(entryType);
            }
        });
    },
    addAccount:function(el){
        var editor = Ext.widget('bankAccountEditor');
        editor.down('[name=concil_tipo]').setValue("LaB");
        editor.down('[name=avisar_sobregiro]').setValue(true);
    },
    saveAccount:function(el){
        var frm = el.up('form').getForm(),
            store = Ext.getStore('BankAccounts'),
            values = frm.getValues();

        if(frm.isValid()){
            if(values.id){
                //update record on store
                var rec = frm.getRecord();
                rec.set(values);
            }else{
                //see if account is already declared
                if(store.find('cuenta',values.cuenta,0,false, false, true)!= -1){
                    Ext.Msg.alert('Alerta', 'Cuenta contable ya asociada a otra cuenta bancaria');
                    return false;
                }
                //add record to store
                store.add(values);
            }

            el.up('window').close();
            store.sync({
                scope:this,
                callback:function(){
                    store.reload();
                }
            });
        }
    },
    newCheckEntry:function(el){
        var win = Ext.widget('checkEditor'),
            period = el.up('window').down('[name=periodo]'),
            balance = Ext.getStore('Balance').findRecord('periodo',period.getValue(),0,false,false,true),
            bankAccount = el.up('window').down('[name=bankAccount]').getValue(),
            entryType = el.up('window').down('[name=tipo_partida]').getValue();
            if(!bankAccount){
                Ext.Msg.alert('Alerta', 'No hay una cuenta bancaria seleccionada');
                return false;
            }
        var account = Ext.getStore('BankAccounts').findRecord('cuenta', bankAccount,0,false,false,true);
            book = Ext.getStore('Books').findRecord('tipo','auxiliar');
        if(balance){
            //this is a closed period
            Ext.Msg.alert('Alerta', 'Este es un periodo cerrado, no se pueden añadir mas partidas');
            win.close();
            return false;
        }

        fId=Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0].getValue(),
            folder =Ext.getStore('Folders').findRecord('id', fId, 0, false, false, true);

        var pp =folder.get('prefijo_partida'),
            lp =folder.get('lugares_partida'),
            np =folder.get('numero_partida'),
            consec = APP.consecutive(pp, lp, np);

        win.down('[name=numero_partida]').setValue(consec);
        win.down('[name=periodo]').setValue(period.getValue());
        win.down('[name=libro]').setValue(book.get('id'));
        win.down('[name=tipo_partida]').setValue(entryType);

        win.down('[name=catalogo]').setValue(folder.get('catalogo'));
        win.down('[name=cuenta]').setValue(account.get('cuenta'));

        win.down('[name=haber]').disable();
        win.down('[name=e_concepto]').disable();

        //reloading concepts
        Ext.getStore('MoreUsedConcepts').reload({
            params:{id:fId}
        });
    },
    editCheckEntry:function(el, rec){
        if(APP.acl(27)){
            var win = Ext.widget('checkEditor');
            win.down('form').getForm().loadRecord(rec);

            //get detail accounts array
            var accounts=[];
            Ext.getStore('Accounts').each(function(r){
                var fId=Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0].getValue(),
                    folder =Ext.getStore('Folders').findRecord('id',fId,0,false,false,true),
                    bankAccount = el.up('window').down('[name=bankAccount]').getValue();
                if(r.get('detalle') == true && r.get('catalogo') == folder.get('catalogo') && r.get('id') != bankAccount){
                    accounts.push([r.get('id'), r.get('id')+' - '+ r.get('nombre')]);
                }
            },this);

            //get current period
            var period=Ext.getStore('Periods').findRecord('id',rec.get('periodo'),0,false,false,true);

            Ext.suspendLayouts();
            win.down('grid').reconfigure(rec.checkrows(),[{
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
                text: 'Valor', dataIndex: 'debe', width: 120, sortable: false, locked:true,
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
            Ext.Msg.alert('Alerta', 'sin permisos para editar movimientos');
        }
    },
    addItemRow:function(el){
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
                var catalogId=Ext.getStore('Folders').findRecord('id',folder,0,false,false,true).get('catalogo');

                //add new entry row
                entryRwStore.add({
                    partida:entryId,
                    catalogo: catalogId,
                    cuenta:accId
                })
            }else{
                Ext.Msg.alert('Alerta','cuenta duplicada');
            }
        }
    },
    saveCheckEntry:function(el){
        el.up('window').down('gridpanel').down('[name=account]').disable();
        var frm = el.up('window').down('form'),
            store = Ext.getStore('Checks'),
            values = frm.getForm().getValues();

        var balance=Ext.getStore('Balance').findRecord('periodo',values.periodo,0,false,false,true);
        if(balance){
            Ext.Msg.alert('Alerta', 'Esta partida pertenece a un periodo cerrado, no se puede editar');
            return false;
        }

        if(frm.isValid()){
            el.up('window').down('gridpanel').down('[name=account]').enable();
            if(values.id){
                //update entry
                var rec = frm.getForm().getRecord();
                rec.set(values);
                if(!rec.dirty)rec.setDirty();
                var rows = el.up('window').down('grid').getStore();
                if(rows.sum('debe')!= values.haber){
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
                var rec = Ext.create('APP.model.Check',values);
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
                                        var lastEntry =Ext.getStore('Checks').findRecord('id',resp.msg,0,false,false,true);
                                        var entryGrid = Ext.ComponentQuery.query('checkCatalog')[0].down('grid');
                                        entryGrid.getSelectionModel().select(lastEntry);
                                        this.editCheckEntry(entryGrid, lastEntry);
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
    newDepositEntry:function(el){
        var win = Ext.widget('depositEditor'),
            period = el.up('window').down('[name=periodo]'),
            balance = Ext.getStore('Balance').findRecord('periodo',period.getValue(),0,false,false,true),
            bankAccount = el.up('window').down('[name=bankAccount]').getValue(),
            entryType = el.up('window').down('[name=tipo_partida]').getValue();
        if(!bankAccount){
            Ext.Msg.alert('Alerta', 'No hay una cuenta bancaria seleccionada');
            return false;
        }
        var account = Ext.getStore('BankAccounts').findRecord('cuenta', bankAccount,0,false,false,true);
        book = Ext.getStore('Books').findRecord('tipo','auxiliar');
        if(balance){
            //this is a closed period
            Ext.Msg.alert('Alerta', 'Este es un periodo cerrado, no se pueden añadir mas partidas');
            win.close();
            return false;
        }

        fId=Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0].getValue(),
            folder =Ext.getStore('Folders').findRecord('id', fId, 0, false, false, true);

        var pp =folder.get('prefijo_partida'),
            lp =folder.get('lugares_partida'),
            np =folder.get('numero_partida'),
            consec = APP.consecutive(pp, lp, np);

        win.down('[name=numero_partida]').setValue(consec);
        win.down('[name=periodo]').setValue(period.getValue());
        win.down('[name=libro]').setValue(book.get('id'));
        win.down('[name=tipo_partida]').setValue(entryType);

        win.down('[name=catalogo]').setValue(folder.get('catalogo'));
        win.down('[name=cuenta]').setValue(account.get('cuenta'));

        win.down('[name=debe]').disable();

        //reloading concepts
        Ext.getStore('MoreUsedConcepts').reload({
            params:{id:fId}
        });
    },
    editDepositEntry:function(el, rec){
        if(APP.acl(27)){
            var win = Ext.widget('depositEditor');
            win.down('form').getForm().loadRecord(rec);

            //get detail accounts array
            var accounts=[];
            Ext.getStore('Accounts').each(function(r){
                var fId=Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0].getValue(),
                    folder =Ext.getStore('Folders').findRecord('id',fId,0,false,false,true),
                    bankAccount = el.up('window').down('[name=bankAccount]').getValue();
                if(r.get('detalle') == true && r.get('catalogo') == folder.get('catalogo') && r.get('id') != bankAccount){
                    accounts.push([r.get('id'), r.get('id')+' - '+ r.get('nombre')]);
                }
            },this);

            //get current period
            var period=Ext.getStore('Periods').findRecord('id',rec.get('periodo'),0,false,false,true);

            Ext.suspendLayouts();
            win.down('grid').reconfigure(rec.checkrows(),[{
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
                text: 'Valor', dataIndex: 'haber', width: 120, sortable: false, locked:true,
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
            Ext.Msg.alert('Alerta', 'sin permisos para editar movimientos');
        }
    },
    saveDepositEntry:function(el){
        el.up('window').down('gridpanel').down('[name=account]').disable();
        var frm = el.up('window').down('form'),
            store = Ext.getStore('Deposits'),
            values = frm.getForm().getValues();

        var balance=Ext.getStore('Balance').findRecord('periodo',values.periodo,0,false,false,true);
        if(balance){
            Ext.Msg.alert('Alerta', 'Esta partida pertenece a un periodo cerrado, no se puede editar');
            return false;
        }

        if(frm.isValid()){
            el.up('window').down('gridpanel').down('[name=account]').enable();
            if(values.id){
                //update entry
                var rec = frm.getForm().getRecord();
                rec.set(values);
                if(!rec.dirty)rec.setDirty();
                var rows = el.up('window').down('grid').getStore();
                if(rows.sum('haber')!= values.debe){
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
                var rec = Ext.create('APP.model.Deposit',values);
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
                                        var lastEntry =Ext.getStore('Checks').findRecord('id',resp.msg,0,false,false,true);
                                        var entryGrid = Ext.ComponentQuery.query('depositCatalog')[0].down('grid');
                                        entryGrid.getSelectionModel().select(lastEntry);
                                        this.editDepositEntry(entryGrid, lastEntry);
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
    }
});