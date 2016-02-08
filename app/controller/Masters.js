// JavaScript Document
Ext.define('APP.controller.Masters', {
    extend: 'Ext.app.Controller',
    models:['Backup', 'Supplier', 'DocType'],
    stores:['Backups', 'Suppliers', 'DocTypes'],
    views:['master.GenericView', 'master.GenericEdit', 'master.Config', 'backup.Manager'],
    init: function() {
        this.control({
            '#navToolBar': {
                render: this.loadInterface
            },
            'genericEditMaster gridpanel':{
                selectionchange: this.changeSelect,
                edit: this.update
            },
            'genericEditMaster #add':{
                click: this.add
            },
            'genericEditMaster #del':{
                click: this.del
            },
            'windowConfig #saveBttn':{
                click:this.saveConfig
            },
            'backupManager gridpanel':{
                celldblclick:this.bkpRestore
            },
            'backupManager #add':{
                click:this.bkpAdd
            }
        });
    },
    loadInterface:function(el){
        if(APP.acl(6))Ext.getStore('Backups').load();

        var admBttn=Ext.ComponentQuery.query('adminbutton')[0];
        var admMnu=admBttn.menu;

        if(APP.acl(105))admMnu.add({
            glyph:47,
            text:'Catalogo de Proveedores',
            params: {title:'Catalogo de Proveedores', store:'Suppliers',
                columns: [{
                    text: 'Nombre', dataIndex: 'nombre', flex: 1, sortable: true,
                    editor: {xtype: 'textfield', allowBlank: false}
                },{
                    text: 'NIT', dataIndex: 'NIT', flex: 1, sortable: true,
                    editor: {xtype: 'textfield'}
                }],
                acl:{ create:105, update:105, destroy:105}
            },
            handler: this.getController('Masters').setGenericEditView
        });

        if(APP.acl(106))admMnu.add({
            glyph:47,
            text:'Catalogo de tipos de documentos del proveedor',
            params: {title:'Catalogo de tipos de documentos del proveedor', store:'DocTypes',
                columns: [{
                    text: 'Nombre', dataIndex: 'nombre', flex: 1, sortable: true,
                    editor: {xtype: 'textfield', allowBlank: false}
                }],
                acl:{ create:106, update:106, destroy:106}
            },
            handler: this.getController('Masters').setGenericEditView
        });

        if(APP.acl(5))admMnu.add({
            text:'Configuración',
            glyph:42,
            handler:function(){

                Ext.Ajax.request({
                    url: 'data/config.php',
                    params: {action:'read'},
                    scope:this,
                    success: function(response){
                        response = Ext.decode(response.responseText);
                        if(response.success){
                            var win = Ext.widget('windowConfig');
                            var baseCfg=win.down('propertygrid').sourceConfig;
                            win.down('propertygrid').setSource(response.src, Ext.Object.merge(baseCfg, response.display));
                        }
                    },
                    failure:function(){
                        Ext.Msg.alert('Alerta','No se pudo obtener la informacion del servidor');
                    }
                });
            }
        });

        if(APP.acl(6))admMnu.add({
            text:'Respaldo de Datos',
            glyph:100,
            handler:function(el){
                var win = Ext.widget('backupManager');
            }
        })

    },

    setGenericView: function(el){
        var win = Ext.widget('genericMaster');
        win.setTitle(el.params.title);
        var grid = win.down('grid');
        Ext.suspendLayouts();
        grid.reconfigure(Ext.getStore(el.params.store));
        Ext.resumeLayouts(true);
    },

    setGenericEditView: function(el){
        var win = Ext.widget('genericEditMaster');
        win.setTitle(el.params.title);
        win.acl = el.params.acl;
        if(el.params.fieldDefaults)win.fieldDefaults = el.params.fieldDefaults;
        var grid = win.down('grid');
        Ext.suspendLayouts();
		if(el.params.columns)grid.reconfigure(Ext.getStore(el.params.store), el.params.columns);
		else grid.reconfigure(Ext.getStore(el.params.store));
        Ext.resumeLayouts(true);
        if(el.params.acl.create){
            if(APP.acl(el.params.acl.create))win.down('#add').enable(); else win.down('#add').disable();
        }
        if(el.params.acl.destroy){
            if(APP.acl(el.params.acl.destroy))win.down('#del').enable(); else win.down('#del').disable();
        }
    },

    changeSelect:function(model, records, e){
        var win=Ext.ComponentQuery.query('genericEditMaster')[0];
        if (records[0]){
            if(win.acl.destroy){
                if(APP.acl(win.acl.destroy))win.down('#del').enable(); else win.down('#del').disable();
            }else win.down('#del').enable();
        }else{
            win.down('#del').disable();
        }
    },

    update:function(editor, e){
        var sm =editor.cmp.getSelectionModel();
        e.store.sync({
            scope:this,
            callback:function(){
                e.store.load();
            }
        });
    },

    add:function(el){
        var store=el.up('gridpanel').getStore(),
        sm = el.up('gridpanel').getSelectionModel(),
        defaults = el.up('window').rDefaults;

        Ext.Msg.prompt('Nuevo Elemento', 'Por favor entre el valor:', function(btn, text){
            if (btn === 'ok'){
                // process text value and close...
                //var rec = {nombre:text};
                var rec = el.up('window').fieldDefaults;
                rec.nombre=text;
                store.insert(0, rec);
                store.sync({
                    scope:this,
                    callback:function(b, o){
                        if(b.hasException){
                            Ext.Msg.alert('Alerta', 'Error del servidor.');
                            store.load();
                        }else{
                            store.load({
                                scope   : this,
                                callback: function(records, operation, success) {
                                    if (store.getCount() > 0) {
                                        sm.select(store.find('nombre',text));
                                    }
                                }
                            });
                        }
                    }
                });
            }
        });
    },

    del:function(el){
        var title='Alerta',
        msg="Desea borrar este elemento?";
        Ext.Msg.confirm(title, msg, function(btn){
            if (btn === 'yes'){
                var sm = el.up('gridpanel').getSelectionModel(),
                store=el.up('gridpanel').getStore();
                store.remove(sm.getSelection());

                store.sync({
                    scope:this,
                    callback:function(){
                        store.load({
                            scope   : this,
                            callback: function(records, operation, success) {
                                if (store.getCount() > 0) {
                                    sm.select(0);
                                }else{
                                    el.up('window').down('#del').disable();
                                }
                            }
                        });
                    }
                });
            }
        });
    },

    saveConfig:function(el){
        var src=base64_encode(Ext.encode(el.up('propertygrid').getSource()));

        Ext.Ajax.request({
            url: 'data/config.php',
            params: {action: 'write', src: src},
            scope:this,
            success: function(response){
                response = Ext.decode(response.responseText);
                if(response.success){
                    el.up('window').close();
                    var title='Informacion',
                        msg="La configuracion se ha salvado exitosamente, debe cerrar la sesion para q los nuevos valores tengan efecto, desea cerrar la sesion ahora?";
                    Ext.Msg.confirm(title, msg, function(btn){
                        if (btn === 'yes') {
                            APP.getApplication().getController('Users').logoutUser(el);
                        }
                    });
                }
            },
            failure:function(){
                Ext.Msg.alert('Alerta','No se pudo enviar la informacion al servidor');
            }
        });
    },

    bkpRestore:function(el, td, cellInd, rec, tr, rowInd){
        if(APP.acl(7)){
            rec.set('size',0);
            Ext.Msg.wait('Restaurando Respaldo', 'por favor espere...');
            Ext.getStore('Backups').sync({
                scope:this,
                callback:function(){
                    Ext.Msg.alert('Respaldo instalado', 'presione F5 para actualizar el sitio');
                    Ext.getStore('Backups').reload();
                }
            });
        }else{
            Ext.Msg.alert('Alerta', 'sin permisos para restaurar respaldos');
        }
    },

    bkpAdd:function(el){
        Ext.Msg.prompt('Nota', 'por favor comente el respaldo:', function(btn, text){
            if (btn == 'ok'){
                // process text value and close...
                var bkp =Ext.create('APP.model.Backup',{note:text});
                Ext.getStore('Backups').insert(0,bkp);
                Ext.Msg.wait('Creando respaldo', 'por favor espere...');
                Ext.getStore('Backups').sync({
                    success:function(b,o){
                        Ext.Msg.close();
                        Ext.getStore('Backups').reload();
                    }
                });
            }
        });

    }
});