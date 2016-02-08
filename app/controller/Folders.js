/**
 * Created on 19/10/2015.
 */
Ext.define('APP.controller.Folders', {
    extend: 'Ext.app.Controller',
    models: ['Folder', 'BalanceTree', 'Book', 'EntryType', 'Marker'],
    stores: ['Folders', 'BalanceTree', 'Books', 'EntryTypes', 'Markers'],
    views: [
        'folder.Importer', 'folder.Catalog', 'folder.Editor', 'folder.Balance', 'folder.DiaryButton',
        'book.Catalog', 'book.Editor'
    ],
    init: function () {
        this.control({
            '#navToolBar': {
                render: this.loadInterface
            },
            '#navToolBar [name=workfolder]':{
                change: this.changefilters
            },
            'folderCatalog #addItm':{
                click:this.addFolder
            },
            'folderEditor #saveFrm':{
                click:this.EditorSave
            },
            'bookCatalog #addItm':{
                click:this.addBook
            },
            'bookEditor #saveFrm':{
                click:this.SaveBook
            }
        });

        //generator function for consecutives
        APP.consecutive=function(prefix, places, value){
            var s = Ext.String.leftPad(value, places, '0');
            return prefix+s;
        }
    },

    loadInterface: function (el) {
        Ext.getStore('Folders').load();

        var admBttn=Ext.ComponentQuery.query('adminbutton')[0];
        var admMnu=admBttn.menu;

        if(APP.acl(3))admMnu.add({
            text:'Catálogo de Contabilidades',
            glyph:100,
            handler:function(){
                var win = Ext.widget('folderCatalog');
            }
        });

        if(APP.acl(24))admMnu.add({
            glyph:47,
            text:'Catalogo de Marcadores',
            itemId:'markerCatalog',
            params: {title:'Catalogo de Marcadores', store:'Markers',
                columns: [{
                    text: 'Nombre', dataIndex: 'nombre', flex: 1, sortable: true,
                    editor: {xtype: 'textfield', allowBlank: false}
                },{
                    text: 'Descripción', dataIndex: 'descrip', flex: 3, sortable: true,
                    editor: {xtype: 'textfield'}
                }],
                acl:{ create:24, update:24, destroy:24},
                fieldDefaults:{nombre:'',contabilidad:''}
            },
            handler: this.getController('Masters').setGenericEditView
        });

        var pBtn = Ext.ComponentQuery.query('periodbutton')[0];
        var prdmnu = pBtn.menu;

        if(APP.acl(37))prdmnu.add({
            text:'Balances',
            glyph:112,
            handler:function(){
                var win = Ext.widget('balanceCatalog');
                if(Ext.getStore('Balance').count()){
                    if(Ext.getStore('Balance').count()){
                        win.down('[name=balance]').select(Ext.getStore('Balance').first());
                    }else{
                        Ext.getStore('BalanceTree').removeAll();
                    }
                }
            }
        });

        if(APP.acl(39))prdmnu.add({
            text:'Reporte de Prebalance',
            glyph:'61487@FontAwesome',
            handler:function(){
                var fldrId=Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0].getValue();
                var newWind = window.open("data/reports/prebalance.php?folder="+fldrId, "prebalance", "");
            }
        });

        if(APP.acl(39))prdmnu.add({
            text:'Cierre de periodo',
            glyph:80,
            handler:function(){
                var fldrCmb=Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0];
                if(fldrCmb.getValue()){
                    var fldrRec=fldrCmb.getStore().findRecord('id',fldrCmb.getValue(),0,false,false,true),
                        mxPrd = Ext.getStore("Balance").max('periodo');
                    if(!mxPrd){
                        var prd = 0;
                    }else{
                        mxPrd =  Ext.getStore("Periods").findRecord('id',mxPrd,0,false,false,true);
                        var prd = Ext.getStore("Periods").findBy(function(r,idx){
                            return (r.get('inicio') > mxPrd.get('fin'));
                        },this);
                    }
                    if(prd!==-1){
                        prd = Ext.getStore("Periods").getAt(prd);
                        var title = 'Alerta',
                            msg = "Desea cerrar el periodo "+prd.get('nombre');
                            msg += "?<br/>Esta operacion es definitiva y no se podrá deshacer luego";
                        Ext.Msg.confirm(title, msg, function (btn) {
                            if (btn === 'yes') {
                                var bkp = Ext.create('APP.model.Backup',{
                                    size:0,
                                    note:'antes del cierre del periodo '+prd.get('nombre')
                                });
                                Ext.Msg.wait('Creando Respaldo');
                                bkp.save({
                                    scope:this,
                                    callback:function(r,o,s){
                                        Ext.Msg.close();
                                        if(s){
                                            Ext.getStore('Backups').reload();
                                            Ext.Msg.wait('Cerrando periodo');
                                            Ext.Ajax.request({
                                                url: 'data/periodClose.php',
                                                params:{folder: fldrRec.get('id')},
                                                scope:this,
                                                callback: function(opts, success, response) {
                                                    if(success){
                                                        var obj = Ext.decode(response.responseText);
                                                        if(obj.success){
                                                            Ext.getStore('Balance').reload();
                                                            Ext.Msg.alert('Alerta', obj.msg);
                                                        }else Ext.Msg.alert('Alerta', obj.msg);
                                                    }else Ext.Msg.alert('Alerta', 'falla de coneccion al servidor, codigo de status' + response.status);
                                                }
                                            });
                                        }else{
                                            this.up('window').down('#status').updateText('Error creando el respaldo');
                                        }
                                    }
                                });

                            }
                        });
                    }else Ext.Msg.alert('Alerta','Ultimo periodo cerrado, agregue periodos nuevos al nomenclador');
                }else Ext.Msg.alert('Alerta','No existe ninguna contabilidad definida');
            }
        });

        var dryBtn = el.insert(1,{xtype:'diarybutton'});
        var drymnu = dryBtn.menu;

        if(APP.acl(21))drymnu.add({
            glyph:47,
            text:'Libros de diario',
            handler:function(el){
                var acc=Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0].getValue();
                if(acc){
                    var win = Ext.widget('bookCatalog');
                }else Ext.Msg.alert('Error', 'debe existir al menos una contabilidad definida');
            }
        });

        if(APP.acl(22))drymnu.add({
            glyph:47,
            text:'Tipos de Partidas',
            params: {title:'Tipos de Partidas', store:'EntryTypes',
                columns: [{
                    text: 'Nombre', dataIndex: 'nombre', flex: 1, sortable: true,
                    editor: {xtype: 'textfield', allowBlank: false}
                },{
                    text: 'Descripción', dataIndex: 'descrip', flex: 2, sortable: true,
                    editor: {xtype: 'textfield'}
                }],
                acl:{ create:22, update:22, destroy:22}
            },
            handler: this.getController('Masters').setGenericEditView
        });

        var accBttn=Ext.ComponentQuery.query('accountbutton')[0];
        var accMnu=accBttn.menu;
    },

    changefilters:function(el, v){
        var rec = el.findRecordByValue(v);

        var acc = Ext.getStore('Accounts');
        acc.clearFilter(true);
        acc.filter('catalogo',rec.get('catalogo'));

        var acct = Ext.getStore('AccountTree');
        acct.reload({
            params:{'catalogo':rec.get('catalogo')}
        });

        var balance = Ext.getStore('Balance');
        balance.clearFilter(true);
        balance.filter('contabilidad',v);

        var books = Ext.getStore('Books');
        books.clearFilter(true);
        books.filter('contabilidad',v);

        var markers = Ext.getStore('Markers');
        markers.clearFilter(true);
        markers.filter('contabilidad',v);
        //update markers defaults
        var admBttn=Ext.ComponentQuery.query('adminbutton')[0];
        var admMnu=admBttn.menu;
        admMnu.down('#markerCatalog').params.fieldDefaults.contabilidad=v;

        var entries = Ext.getStore('Entries');
        entries.clearFilter(true);
        entries.filter('contabilidad',v);

        var bankAccounts = Ext.getStore('BankAccounts');
        bankAccounts.clearFilter(true);
        bankAccounts.filter('contabilidad',v);

        var payees = Ext.getStore('Payees');
        payees.clearFilter(true);
        payees.filter('contabilidad', v);
        //update payees defaults
        var bnkBttn=Ext.ComponentQuery.query('bankbutton')[0];
        var bnkMnu=bnkBttn.menu;
        bnkMnu.down('#payeeCatalog').params.fieldDefaults.contabilidad=v;
        //bnkMnu.down('#payeeCatalog').params.fieldDefaults.banco=bankAccounts.first().get('id');
        //TODO reload stores on folder change
    },

    addFolder:function(el){
        var editor = Ext.widget('folderEditor');
        editor.down('#dependencies').disable();
        editor.down('[name=catalogo]').select(Ext.getStore('Catalog').first());
    },

    EditorSave:function(el){
        var frm = el.up('form').getForm(),
            store = Ext.getStore('Folders'),
            values = frm.getValues();

        if(!values.users)values.users=[]; else
        if(Ext.isNumeric(values.users))values.users=[values.users];
        if(!values.origins)values.origins=[]; else
        if(Ext.isNumeric(values.origins))values.origins=[values.origins];

        if(values.id){
            //update record on store
            var rec = frm.getRecord();
            rec.set(values);
        }else{
            //add record to store
            store.add(values);
        }
        el.up('window').close();
        store.sync({
            scope:this,
            callback:function(){
                store.reload();
                Ext.getStore('Folders').reload();
            }
        });
    },

    addBook:function(el){
        var editor = Ext.widget('bookEditor');
        editor.down('[name=prefijo_partida]').setValue('P');
    },

    SaveBook:function(el){
        var frm = el.up('form').getForm(),
            store = Ext.getStore('Books'),
            values = frm.getValues();

        if(values.id){
            //update record on store
            var rec = frm.getRecord();
            rec.set(values);
        }else{
            //add record to store
            store.add(values);
        }
        el.up('window').close();
        store.sync({
            scope:this,
            callback:function(){
                store.reload();
                Ext.getStore('Books').reload();
            }
        });
    }
});