Ext.define('APP.controller.Accounts', {
    extend: 'Ext.app.Controller',
    models:['Catalog', 'Group', 'AccountTree', 'Account', 'Balance'],
    stores:['Catalog', 'Groups', 'AccountTree', 'Accounts', 'Balance'],
    views:['account.AccountButton', 'account.Catalog', 'account.Editor'],
    init: function() {
        this.control({
            '#navToolBar':{
                render:this.loadInterface
            },
            'accountCatalog treepanel':{
                itemclick:this.selectAccount
            },
            'accountCatalog #addItm':{
                click:this.addAccount
            },
            'accountEditor #saveFrm':{
                click:this.EditorSave
            }
        });
    },
    loadInterface:function(el){
        //add menu button
        var mBtn = el.insert(1,{xtype:'accountbutton'});
        var mnu = mBtn.menu;

        if(APP.acl(103))mnu.add({
            glyph:47,
            text:'Grupos de Catálogos de cuentas',
            params: {title:'Grupos de Catálogos de cuentas', store:'Catalog',
                columns: [{
                    text: 'Nombre',  dataIndex: 'nombre', flex:1, sortable : true,
                    editor: {xtype: 'textfield',allowBlank: false}
                }],
                acl:{ create:103, update:103, destroy:103}
            },
            handler: this.getController('Masters').setGenericEditView
        });

        if(APP.acl(9))mnu.add({
            text:'Catálogo de cuentas',
            glyph:47,
            handler:function(el){
                if(Ext.getStore('Catalog').count()){
                    win = Ext.widget('accountCatalog');
                    var fldrCmb = Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0];
                    if(fldrCmb.getValue()){
                        var fldrRec=Ext.getStore('Folders').findRecord('id',fldrCmb.getValue(),0,false,false,true);
                        win.down('[name=catalogo]').setValue(fldrRec.get('catalogo'));
                    }else{
                        win.down('[name=catalogo]').select(Ext.getStore('Catalog').first());
                    }
                }else{
                    Ext.Msg.alert('Alerta', 'Debe existir al menos un grupo de Catálogo creado');
                }

            }
        });

        if(APP.acl(14))mnu.add({
            glyph:47,
            text:'Grupos Contables',
            params: {title:'Grupos Contables', store:'Groups',
                columns: [{
                    text: 'Nombre',  dataIndex: 'nombre', flex:1, sortable : true,
                    editor: {xtype: 'textfield',allowBlank: false}
                },{
                    text: 'Tipo de Saldo',  dataIndex: 'debe', flex:1, sortable : true,
                    renderer: function(value){
                        if(value)return "Debe"; else return "Haber";
                    },
                    editor: {
                        xtype: 'combobox',
                        store: [[true,'Debe'], [false,'Haber']],
                        name: 'debe',
                        allowBlank:false
                    }
                }],
                acl:{ create:14, update:14, destroy:14}
            },
            handler: this.getController('Masters').setGenericEditView
        });



    },
    selectAccount:function(el, record, item, index, e, eOpts){
        var addBtn=el.up('window').down('#addItm');
        if(!record.get('leaf')){
            if(APP.acl(8))addBtn.enable(); else addBtn.disable();
        }else{
            addBtn.disable();
        }
    },
    addAccount:function(el){
        var win = el.up('window'),
        tree = win.down('treepanel'),
        rec = tree.getSelectionModel().getLastSelected();
        var editor = Ext.widget('accountEditor');
        editor.down('form').getForm().reset();
        editor.down('[name=action]').setValue('create');
        editor.down('[name=catalogo]').setValue(el.up('window').down('[name=catalogo]').getValue());
        var nivel=1;
        if(rec){
            nivel = rec.get('nivel')+1;
            editor.down('[name=padre]').setValue(rec.get('id'));
            editor.down('[name=grupo]').setValue(rec.get('grupo'));
            editor.down('[name=grupo]').setReadOnly(true);
        }
        editor.down('[name=nivel]').setValue(nivel);
    },
    EditorSave:function(el){
        var form = el.up('form').getForm();
        if (form.isValid()) {
            var values = form.getValues(),
            store = this.getStore('Accounts');
            if(!values.detalle)values.detalle=false;
            Ext.Ajax.request({
                url: 'data/accounts.php',
                params:values,
                success: function(response, opts) {
                    var obj = Ext.decode(response.responseText);
                    if(obj.success){
                        Ext.getStore('Accounts').reload();

                        var ctlg=Ext.ComponentQuery.query('accountCatalog [name=catalogo]')[0].getValue();
                        var acct = Ext.getStore('AccountTree');
                        acct.reload({
                            params:{'catalogo':ctlg}
                        });
                    }else{
                        Ext.Msg.alert('Error', obj.msg);
                    }
                },
                failure: function(response, opts) {
                    console.log('Error de comunicación con el servidor, codigo ' + response.status);
                }
            });
            el.up('window').close();
        }
    }
});