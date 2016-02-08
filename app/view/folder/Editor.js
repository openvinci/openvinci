/**
 * Created on 19/10/2015.
 */
Ext.define('APP.view.folder.Editor', {
    extend: 'Ext.window.Window',
    alias: 'widget.folderEditor',
    glyph:100,
    title: 'Contabilidad',
    layout: 'fit',
    autoShow: true,
    modal:true,
    resizable:false,
    width:600,
    constrainHeader:true,

    initComponent: function() {
        //populate origins
        var chkOrgs=[];
        Ext.getStore('Folders').each(function(r){
            chkOrgs.push({
                 boxLabel: r.get('nombre'), name: 'origins', inputValue: r.get('id')
            });
        },this);

        //populate users
        var chkUsrs=[];
        Ext.getStore('UserList').each(function(r){
            chkUsrs.push({
                boxLabel: r.get('nombre'), name: 'users', inputValue: r.get('id')
            });
        },this);

        Ext.applyIf(this, {
            items:[{
                xtype:'form',
                border:false,
                layout:'column',
                items:[{
                    columnWidth: 0.50,
                    border:false,
                    padding:5,
                    layout:'form',
                    items:[{
                        xtype: 'hidden',
                        name: 'id'
                    }, {
                        xtype: 'textfield',
                        fieldLabel: 'Nombre',
                        name: 'nombre',
                        labelWidth: 60
                    }, {
                        xtype: 'combobox',
                        store: 'Catalog',
                        name: 'catalogo',
                        allowBlank: false,
                        fieldLabel: 'Catálogo',
                        editable: false,
                        displayField:'nombre',
                        valueField:'id',
                        listeners:{change:this.changeCatalog}
                    }, {
                        xtype:'fieldset',
                        title:'Cierre Anual',
                        defaults: {anchor: '100%', labelWidth:60},
                        items:[{
                            xtype: 'combobox',
                            store: ['total', 'resultados'],
                            name: 'tipo_cierre',
                            anchor:'100%',
                            allowBlank: false,
                            fieldLabel: 'Tipo',
                            editable: false,
                            value:'total'
                        },{
                            xtype: 'combobox',
                            store:[[0,'']],
                            matchFieldWidth:false,
                            name: 'cuenta_cierre',
                            anchor:'100%',
                            queryMode: 'local',
                            allowBlank:false,
                            fieldLabel:'Cuenta',
                            editable:false,
                            valueField:'id',
                            diaplayField:'nombre'
                        }]
                    }, {
                        xtype:'fieldset',
                        title:'Numeración de partidas de diario',
                        defaults: {anchor: '100%', labelWidth:60},
                        items:[{
                            xtype: 'combobox',
                            store: ['global', 'por libro'],
                            name: 'tipo_numeracion',
                            anchor: '100%',
                            allowBlank: false,
                            fieldLabel: 'Tipo',
                            editable: false,
                            value:'global',
                            listeners:{change:this.setNumberingType}
                        },{
                            xtype: 'textfield',
                            fieldLabel: 'Prefijo',
                            name: 'prefijo_partida',
                            maxLength:10,
                            listeners:{'change':this.updateSample}
                        }, {
                            xtype: 'numberfield',
                            fieldLabel: 'Lugares',
                            name: 'lugares_partida',
                            allowExponential: false,
                            allowDecimals: false,
                            listeners:{'change':this.updateSample}
                        }, {
                            xtype: 'numberfield',
                            fieldLabel: 'Número',
                            name: 'numero_partida',
                            allowExponential: false,
                            allowDecimals: false,
                            listeners:{'change':this.updateSample}
                        }, {
                            xtype: 'displayfield',
                            name: 'sample',
                            fieldLabel: 'Muestra'
                        }, {
                            xtype:'hidden',
                            name:'consolidada'
                        }]
                    }]
                }, {
                    columnWidth: 0.50,
                    height: 350,
                    layout: 'accordion',
                    itemId: 'dependencies',
                    items: [{
                        title: 'Consolidación de datos',
                        autoScroll:true,
                        items:[{
                            xtype:'checkboxgroup',
                            columns: 1,
                            vertical: true,
                            itemId:'originList',
                            items:chkOrgs
                        }]
                    }, {
                        title: 'Usuarios',
                        autoScroll:true,
                        items:[{
                            xtype:'checkboxgroup',
                            columns: 1,
                            vertical: true,
                            itemId:'userList',
                            items:chkUsrs
                        }]
                    }, {
                        title: 'Presupuestos'
                    }, {
                        title: 'Reportes',
                        items:[{
                            xtype: 'fieldcontainer',
                            fieldLabel: 'Firma 1',
                            labelWidth: 50,
                            layout: 'hbox',
                            width: '100%',
                            labelStyle:'padding-top: 20px;',
                            defaults: {labelAlign: 'top'},
                            items: [{
                                xtype: 'textfield',
                                flex: 1,
                                fieldLabel: 'Nombre',
                                name: 'firma1'
                            }, {
                                xtype: 'splitter'
                            }, {
                                xtype: 'textfield',
                                flex: 1,
                                fieldLabel: 'Cargo',
                                name: 'cargo1'
                            }]
                        },{
                            xtype: 'fieldcontainer',
                            fieldLabel: 'Firma 2',
                            labelWidth: 50,
                            layout:'hbox',
                            width:'100%',
                            defaults:{labelAlign:'top'},
                            items: [{
                                xtype: 'textfield',
                                flex: 1,
                                name:'firma2'
                            }, {
                                xtype: 'splitter'
                            }, {
                                xtype: 'textfield',
                                flex: 1,
                                name:'cargo2'
                            }]
                        },{
                            xtype: 'fieldcontainer',
                            fieldLabel: 'Firma 3',
                            labelWidth: 50,
                            layout:'hbox',
                            width:'100%',
                            defaults:{labelAlign:'top'},
                            items: [{
                                xtype: 'textfield',
                                flex: 1,
                                name:'firma3'
                            }, {
                                xtype: 'splitter'
                            }, {
                                xtype: 'textfield',
                                flex: 1,
                                name:'cargo3'
                            }]
                        },{
                            xtype: 'fieldcontainer',
                            fieldLabel: 'Firma 4',
                            labelWidth: 50,
                            layout:'hbox',
                            width:'100%',
                            defaults:{labelAlign:'top'},
                            items: [{
                                xtype: 'textfield',
                                flex: 1,
                                name:'firma4'
                            }, {
                                xtype: 'splitter'
                            }, {
                                xtype: 'textfield',
                                flex: 1,
                                name:'cargo4'
                            }]
                        }]
                    }]
                }],
                buttons:[{
                    xtype:'button',
                    text:'Cancelar',
                    itemId:'resetFrm',
                    scale:'medium',
                    handler:function(el){el.up('window').close()}
                },'->',{
                    xtype:'button',
                    itemId:'saveFrm',
                    action: 'save',
                    scale:'medium',
                    text:'Guardar'
                }]
            }]
        });
        this.callParent(arguments);
    },
    updateSample:function(el){
        var frm = el.up('form'),
        values = frm.getValues(),
        sample =APP.consecutive(values.prefijo_partida, values.lugares_partida, values.numero_partida);
        frm.down('[name=sample]').setValue(sample);
    },
    OriginName:function(v){
        var r = Ext.getStore('Folders').findRecord('id',v,0,false,false,true);
        return r.get('nombre');
    },
    setNumberingType:function(el,v){
        var frm=el.up('form');
        if(v == 'global'){
            frm.down('[name=prefijo_partida]').enable();
            frm.down('[name=numero_partida]').enable();
            frm.down('[name=lugares_partida]').enable();
        }else{
            frm.down('[name=prefijo_partida]').disable();
            frm.down('[name=numero_partida]').disable();
            frm.down('[name=lugares_partida]').disable();
        }
    },

    changeCatalog:function(el,v){
        var ctaCmb = el.up('window').down('[name = cuenta_cierre]'),
        ctaStore = ctaCmb.getStore();
        ctaStore.removeAll();
        var dta=[];
        Ext.getStore('Accounts').each(function(r){
            if(r.get('grupo') == 2 && r.get('detalle') == true && r.get('catalogo') == v){
                //console.info(r.data);
                dta.push([r.get('id'), r.get('id')+' - '+ r.get('nombre')]);
            }
        },this);
        if(dta.length)ctaStore.loadRawData(dta);
        else ctaStore.loadRawData([[0,'']]);
    }
});