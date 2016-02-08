/**
 * Created on 23/09/2015.
 */
Ext.define('APP.view.account.Catalog', {
    extend: 'Ext.window.Window',
    alias: 'widget.accountCatalog',
    glyph:77,
    title: 'Catálogo de Cuentas',
    autoShow: true,
    modal:true,
    resizable:false,
    width:800,
    constrainHeader:true,

    initComponent: function() {
        Ext.applyIf(this, {
            items:[{
                xtype: 'treepanel',
                height: 300,
                useArrows: true,
                rootVisible: false,
                autoScroll: true,
                store: 'AccountTree',
                tbar:[{
                    glyph: 43,
                    tooltip: 'Agregar Cuenta',
                    scale: 'medium',
                    text: 'Agregar',
                    itemId: 'addItm',
                    disabled: (APP.acl(8)) ? false : true
                },'->',{
                    xtype: 'combobox',
                    store: 'Catalog',
                    name: 'catalogo',
                    allowBlank: false,
                    fieldLabel: 'Grupo de Catálogo',
                    labelWidth:120,
                    editable: false,
                    displayField:'nombre',
                    valueField:'id',
                    listeners:{change:this.changeCatalog}
                }, {
                    glyph: 100,
                    tooltip: 'Exportar Catálogo',
                    scale: 'medium',
                    text: 'Exportar',
                    itemId: 'importItm',
                    href: 'data/export/accountCatalog.php'
                },{
                    text:'Imprimir',
                    glyph:'61487@FontAwesome',
                    scale:'medium',
                    itemId:'printBttn',
                    disabled:(APP.acl(12))?false:true
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
                }, {
                    text: 'Grupo Contable',
                    width: 140,
                    dataIndex: 'grupo',
                    renderer: this.getAccountGroup
                }, {
                    xtype: 'actioncolumn',
                    menuDisabled: true,
                    align: 'center',
                    width: 30,
                    items: [{
                        icon: 'style/imgs/icon-edit.png',
                        tooltip: 'Edit',
                        handler: function (grid, rowIndex, colIndex) {
                            var rec = grid.getStore().getAt(rowIndex);
                            var acc = Ext.getStore('Accounts').findRecord('id', rec.get('id'), 0, false, false, true);
                            var editor = Ext.widget('accountEditor');
                            editor.down('form').getForm().loadRecord(acc);
                            editor.down('[name=action]').setValue('update/' + acc.get('id')+'/'+acc.get('catalogo'));
                            editor.down('[name=id]').setValue(acc.get('id'));
                            editor.down('[name=grupo]').setValue(acc.get('grupo'));
                            editor.down('[name=grupo]').setReadOnly(true);
                            editor.down('[name=detalle]').setReadOnly(true);
                            if(rec.data.children.length)editor.down('[name=id]').setReadOnly(true);
                        },
                        disabled: (APP.acl(10)) ? false : true
                    }]
                }, {
                    xtype: 'actioncolumn',
                    menuDisabled: true,
                    align: 'center',
                    width: 30,
                    items: [{
                        icon: 'style/imgs/icon-delete.png',
                        tooltip: 'Eliminar',
                        handler: function (grid, rowIndex, colIndex) {
                            var rec = grid.getStore().getAt(rowIndex);
                            var title = 'Alerta',
                                msg = "Desea borrar este elemento?";
                            Ext.Msg.confirm(title, msg, function (btn) {
                                if (btn === 'yes') {
                                    Ext.Ajax.request({
                                        url: 'data/accounts.php',
                                        scope:this,
                                        params:{action:'destroy/'+rec.get('id')+'/'+rec.get('catalogo')},
                                        success: function(response, opts) {
                                            var obj = Ext.decode(response.responseText);
                                            if(obj.success){
                                                Ext.getStore('Accounts').reload();
                                                var acct = Ext.getStore('AccountTree');
                                                acct.reload({
                                                    params:{'catalogo':grid.up('window').down('[name=catalogo]').getValue()}
                                                });
                                            }else{
                                                Ext.Msg.alert('alerta',obj.msg);
                                            }
                                        },
                                        failure: function(response, opts) {
                                            Ext.Msg.alert('error','server-side failure with status code ' + response.status);
                                        }
                                    });
                                }
                            });
                        },
                        disabled: (APP.acl(11)) ? false : true
                    }]
                }]
            },{
                xtype:'form',
                padding: 5,
                border:false,
                items:[{
                    xtype: 'filefield',
                    fieldLabel:'Importar Catálogo',
                    labelWidth:120,
                    anchor:'100%',
                    name:'catalogFile',
                    disabled: (APP.acl(13)) ? false : true,
                    listeners:{
                        change:this.submitFrm
                    }
                }]
            }],
            listeners:{close:this.closeWindow}
        });
        this.callParent(arguments);
    },
    getAccountGroup:function(value){
        var rec = Ext.getStore('Groups').findRecord('id',value,0,false,false,true);
        if(rec.get('debe'))var cmp = '<span style="color: red">'; else var cmp = '<span style="color: green">';
        return cmp+rec.get('nombre')+'</span>';
    },
    submitFrm:function(el){
        el.up('form').submit({
            clientValidation: true,
            scope:this,
            url:'data/import/accountCatalog.php?catalogId='+el.up('window').down('[name=catalogo]').getValue(),
            success: function(form, action) {
                Ext.Msg.alert('Importacion completa', action.result.msg);
                Ext.getStore('AccountGroups').load();
                Ext.getStore('Accounts').load();
                var acct = Ext.getStore('AccountTree');
                acct.reload({
                    params:{'catalogo':el.up('window').down('[name=catalogo]').getValue()}
                });
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
                        Ext.getStore('Accounts').reload();
                        var acct = Ext.getStore('AccountTree');
                        acct.reload({
                            params:{'catalogo':el.up('window').down('[name=catalogo]').getValue()}
                        });
                }
            }
        });
    },
    changeCatalog:function(el,v){
        var acc = Ext.getStore('Accounts');
        acc.clearFilter(true);
        acc.filter('catalogo',v);

        var acct = Ext.getStore('AccountTree');
        acct.reload({
            params:{'catalogo':v}
        });
    },
    closeWindow:function(el){
        var fldrCmb = Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0];
        if(fldrCmb.getValue()){
            //set account catalog filter to folder catalog if folder is set
            var fldrRec = fldrCmb.findRecord('id', fldrCmb.getValue());
            var ctlog = Ext.getStore('Catalog').findRecord('id', fldrRec.get('catalogo'),0,false,false,true);
        }else{
            //if not, then get first catalog available in store by default
            var ctlog = Ext.getStore('Catalog').first();
        }

        var acc = Ext.getStore('Accounts');
        acc.clearFilter(true);
        acc.filter('catalogo', ctlog.get('id'));

        var acct = Ext.getStore('AccountTree');
        acct.reload({
            params:{'catalogo':ctlog.get('id')}
        });
    }
});