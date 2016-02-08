/**
 * Created on 03/10/2015.
 */
Ext.define('APP.view.folder.Importer', {
    extend: 'Ext.window.Window',
    alias: 'widget.importerMaster',
    glyph:77,
    title: 'Importar Carpeta de Vinci 4.5',
    layout: 'fit',
    autoShow: true,
    modal:true,
    resizable:false,
    catalog:0,      //id of selected account catalog
    filename:'',    //name of the imported zip file
    folder:0,       //folder id of the imported zip
    constrainHeader:true,
    width:500,

    initComponent: function() {
        Ext.applyIf(this, {
           items:[{
               xtype:'form',
               padding: 5,
               border:false,
               defaults:{labelWidth:130, anchor:'100%'},
               items:[{
                   xtype: 'combobox',
                   store: 'Catalog',
                   name: 'catalog',
                   allowBlank: false,
                   fieldLabel: 'Catalogo de Cuentas',
                   editable: false,
                   value: Ext.getStore('Catalog').first().get('id'),
                   displayField:'nombre',
                   valueField:'id'
               },{
                   xtype: 'filefield',
                   name: 'workfolder',
                   fieldLabel: 'Carpeta',
                   msgTarget: 'side',
                   allowBlank: false,
                   listeners: {
                       change: this.submitFrm
                   }
               }, {
                   itemId: 'status',
                   xtype: 'progressbar',
                   text: 'Esperando...'
               },{
                   padding:5,
                   border:false,
                   loader:{url: 'data/static/importInfo.html', autoLoad:true},
                   height:300,
                   autoScroll:true
               }]
           }]
        });
        this.callParent(arguments);
    },
    submitFrm:function(el){
        var catalog=el.up('window').down('[name=catalog]').getValue();
        if(catalog){
            el.up('window').catalog=catalog;
        }
        el.up('form').submit({
            clientValidation: true,
            scope:this,
            url:'importer/upload.php',
            success: function(form, action) {
                //action.result.msg
                this.up('window').filename = action.result.msg;
                //console.log(action.result.msg, this);
                var bkp = Ext.create('APP.model.Backup',{
                    size:0,
                    note:'antes de importar '+action.result.msg
                });
                el.up('window').down('#status').updateProgress(.03,'creando respaldo');
                bkp.save({
                    scope:this,
                    callback:function(r,o,s){
                        if(s){
                            Ext.getStore('Backups').reload();
                            this.up('window').checkAccounts();
                        }else{
                            this.up('window').down('#status').updateText('Error creando el respaldo');
                        }
                    }
                })
            },
            failure: function(form, action) {
                switch (action.failureType) {
                    case Ext.form.action.Action.CLIENT_INVALID:
                        Ext.Msg.alert('Error', 'Los campos del formulario no pueden ser enviados con errores');
                        break;
                    case Ext.form.action.Action.CONNECT_FAILURE:
                        Ext.Msg.alert('Error', 'Error de comunicacion Ajax');
                        break;
                    case Ext.form.action.Action.SERVER_INVALID:
                        Ext.Msg.alert('Error', action.result.msg);
                }
            }
        });
    },
    checkAccounts:function(){
        this.down('#status').updateProgress(.05,'verificando cuentas');
        Ext.Ajax.request({
            scope:this,
            url: 'importer/accounts.php',
            params:{id:this.filename, catalog:this.catalog},
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(obj.success){
                    Ext.getStore('Groups').reload();
                    Ext.getStore('Accounts').reload();
                    this.checkPeriods();
                }else{
                    Ext.Msg.alert('Alerta',obj.msg);
                }
            },
            failure: function(response, opts) {
                this.down('#status').updateText('server-side failure with status code ' + response.status);
            }
        });
    },
    checkPeriods:function(){
        this.down('#status').updateProgress(.1,'verificando periodos');
        Ext.Ajax.request({
            scope:this,
            url: 'importer/periods.php',
            params:{id:this.filename, catalog:this.catalog},
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(obj.success){
                    Ext.getStore('Periods').reload();
                    this.checkCurrencies();
                }else{
                    Ext.Msg.alert('Alerta',obj.msg);
                }
            },
            failure: function(response, opts) {
                this.down('#status').updateText('server-side failure with status code ' + response.status);
            }
        });
    },
    checkCurrencies:function(){
        this.down('#status').updateProgress(.15,'verificando monedas');
        Ext.Ajax.request({
            scope:this,
            url: 'importer/currency.php',
            params:{id:this.filename, catalog:this.catalog},
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(obj.success){
                    Ext.getStore('Currency').reload();
                    this.checkEntryTypes();
                }else{
                    Ext.Msg.alert('Alerta',obj.msg);
                }
            },
            failure: function(response, opts) {
                this.down('#status').updateText('server-side failure with status code ' + response.status);
            }
        });
    },
    checkEntryTypes:function(){
        this.down('#status').updateProgress(.2,'verificando tipos de partidas');
        Ext.Ajax.request({
            scope:this,
            url: 'importer/entryTypes.php',
            params:{id:this.filename, catalog:this.catalog},
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(obj.success){
                    Ext.getStore('EntryTypes').reload();
                    this.importFolder();
                }else{
                    Ext.Msg.alert('Alerta',obj.msg);
                }
            },
            failure: function(response, opts) {
                this.down('#status').updateText('server-side failure with status code ' + response.status);
            }
        });
    },
    importFolder:function(){
        this.down('#status').updateProgress(.25,'creando carpeta');
        Ext.Ajax.request({
            scope:this,
            url: 'importer/folder.php',
            params:{id:this.filename, catalog:this.catalog},
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(obj.success){
                    Ext.getStore('Folders').reload();
                    this.folder = obj.msg;
                    this.balance();
                }else{
                    Ext.Msg.alert('Alerta',obj.msg);
                }
            },
            failure: function(response, opts) {
                this.down('#status').updateText('server-side failure with status code ' + response.status);
            }
        });
    },
    balance:function(){
        this.down('#status').updateProgress(.3,'creando balances');
        Ext.Ajax.request({
            scope:this,
            url: 'importer/balance.php',
            params:{id:this.filename, catalog:this.catalog, folder:this.folder},
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(obj.success){
                    Ext.getStore('Balance').reload();
                    this.books();
                }else{
                    Ext.Msg.alert('Alerta',obj.msg);
                }
            },
            failure: function(response, opts) {
                this.down('#status').updateText('server-side failure with status code ' + response.status);
            }
        });
    },
    books:function(){
        this.down('#status').updateProgress(.35,'creando libros');
        Ext.Ajax.request({
            scope:this,
            url: 'importer/books.php',
            params:{id:this.filename, catalog:this.catalog, folder:this.folder},
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(obj.success){
                    this.suppliers();
                }else{
                    Ext.Msg.alert('Alerta',obj.msg);
                }
            },
            failure: function(response, opts) {
                this.down('#status').updateText('server-side failure with status code ' + response.status);
            }
        });
    },
    suppliers:function(){
        this.down('#status').updateProgress(.4,'Actualizando proveedores');
        Ext.Ajax.request({
            scope:this,
            url: 'importer/suppliers.php',
            params:{id:this.filename, catalog:this.catalog, folder:this.folder},
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(obj.success){
                    Ext.getStore('Suppliers').reload();
                    this.docTypes();
                }else{
                    Ext.Msg.alert('Alerta',obj.msg);
                }
            },
            failure: function(response, opts) {
                this.down('#status').updateText('server-side failure with status code ' + response.status);
            }
        });
    },
    docTypes:function(){
        this.down('#status').updateProgress(.45,'Actualizando Tipos de documentos');
        Ext.Ajax.request({
            scope:this,
            url: 'importer/docTypes.php',
            params:{id:this.filename, catalog:this.catalog, folder:this.folder},
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(obj.success){
                    Ext.getStore('DocTypes').reload();
                    this.markers();
                }else{
                    Ext.Msg.alert('Alerta',obj.msg);
                }
            },
            failure: function(response, opts) {
                this.down('#status').updateText('server-side failure with status code ' + response.status);
            }
        });
    },
    markers:function(){
        this.down('#status').updateProgress(.5,'creando Marcadores');
        Ext.Ajax.request({
            scope:this,
            url: 'importer/markers.php',
            params:{id:this.filename, catalog:this.catalog, folder:this.folder},
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(obj.success){
                    this.entries();
                }else{
                    Ext.Msg.alert('Alerta',obj.msg);
                }
            },
            failure: function(response, opts) {
                this.down('#status').updateText('server-side failure with status code ' + response.status);
            }
        });
    },
    entries:function(){
        this.down('#status').updateProgress(.55,'Importando Partidas');
        Ext.Ajax.request({
            scope:this,
            url: 'importer/entries.php',
            params:{id:this.filename, catalog:this.catalog, folder:this.folder},
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(obj.success){
                    this.bankAccounts();
                }else{
                    Ext.Msg.alert('Alerta',obj.msg);
                }
            },
            failure: function(response, opts) {
                this.down('#status').updateText('server-side failure with status code ' + response.status);
            }
        });
    },
    bankAccounts:function(){
        this.down('#status').updateProgress(.6,'Importando Cuentas Bancarias');
        Ext.Ajax.request({
            scope:this,
            url: 'importer/bankAccounts.php',
            params:{id:this.filename, catalog:this.catalog, folder:this.folder},
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(obj.success){
                    this.payees();
                }else{
                    Ext.Msg.alert('Alerta',obj.msg);
                }
            },
            failure: function(response, opts) {
                this.down('#status').updateText('server-side failure with status code ' + response.status);
            }
        });
    },
    payees:function(){
        this.down('#status').updateProgress(.65,'Importando Beneficiarios');
        Ext.Ajax.request({
            scope:this,
            url: 'importer/payees.php',
            params:{id:this.filename, catalog:this.catalog, folder:this.folder},
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(obj.success){
                    this.cleanUp();
                }else{
                    Ext.Msg.alert('Alerta',obj.msg);
                }
            },
            failure: function(response, opts) {
                this.down('#status').updateText('server-side failure with status code ' + response.status);
            }
        });
    },
    cleanUp:function(){
        this.down('#status').updateProgress(.95,'borrando temporales');
        Ext.Ajax.request({
            scope:this,
            url: 'importer/cleanup.php',
            params:{id:this.filename},
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(obj.success){
                    this.down('#status').updateProgress(0,obj.msg);
                }else{
                    Ext.Msg.alert('Alerta',obj.msg);
                }
            },
            failure: function(response, opts) {
                this.down('#status').updateText('server-side failure with status code ' + response.status);
            }
        });
    }
});