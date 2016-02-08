/**
 * Created by Michel Lopez H on 24/11/2015.
 */
Ext.define('APP.view.entry.Editor', {
    extend: 'Ext.window.Window',
    alias: 'widget.entryEditor',
    glyph:102,
    title: 'Editar Partida',
    layout: 'fit',
    autoShow: true,
    modal:true,
    resizable:false,
    width:1000,
    closable:false,
    constrainHeader:true,

    initComponent: function() {
        //get detail accounts array
        var accounts=[];
        Ext.getStore('Accounts').each(function(r){
            var fId=Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0].getValue(),
                folder =Ext.getStore('Folders').findRecord('id',fId,0,false,false,true);
            if(r.get('detalle') == true && r.get('catalogo') == folder.get('catalogo')){
                accounts.push([r.get('id'), r.get('id')+' - '+ r.get('nombre')]);
            }
        },this);

        Ext.applyIf(this, {
            items:[{
                xtype:'form',
                border:false,
                padding:5,
                defaults:{anchor:'100%'},
                items:[{
                    xtype: 'hidden',
                    name: 'id'
                }, {
                    xtype: 'hidden',
                    name: 'contabilidad',
                    value: Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0].getValue()
                }, {
                    xtype: 'hidden',
                    name: 'numero_partida',
                    listeners:{change:this.displayEntryNumber}
                }, {
                    xtype: 'hidden',
                    name: 'libro',
                    listeners:{change:this.displayBook}
                },{
                    xtype: 'hidden',
                    name: 'periodo',
                    listeners:{change:this.displayPeriod}
                },{
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    items:[{
                        xtype:'displayfield',
                        name:'d_libro',
                        flex:1,
                        fieldLabel: 'Libro',
                        allowBlank:false,
                        labelWidth: 90
                    },{
                        xtype: 'splitter'
                    },{
                        xtype:'displayfield',
                        name:'d_numero_partida',
                        flex:1,
                        fieldLabel: 'No. de Partida',
                        allowBlank:false,
                        labelWidth: 90
                    },{
                        xtype: 'splitter'
                    },{
                        xtype:'displayfield',
                        name:'d_periodo',
                        flex:1,
                        fieldLabel: 'periodo',
                        allowBlank:false,
                        labelWidth: 60
                    }]
                }, {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    items: [{
                        xtype: 'combobox',
                        store: 'EntryTypes',
                        name: 'tipo_partida',
                        allowBlank: false,
                        fieldLabel: 'Tipo de partida',
                        labelWidth: 90,
                        flex: 1,
                        editable: false,
                        valueField: 'id',
                        displayField: 'descrip',
                        value: Ext.getStore('EntryTypes').first().get('id')
                    }, {
                        xtype: 'splitter'
                    }, {
                        xtype: 'textfield',
                        name: 'referencia',
                        flex: 1,
                        fieldLabel: 'Referencia',
                        labelWidth: 90
                    }, {
                        xtype: 'splitter'
                    }, {
                        xtype: 'datefield',
                        allowBlank: false,
                        editable: false,
                        flex: 1,
                        fieldLabel: 'Fecha',
                        labelWidth: 60,
                        name: 'fecha',
                        submitFormat: 'Y-m-d'
                    }]
                },{
                    xtype: 'combobox',
                    store: 'MoreUsedConcepts',
                    name: 'concepto',
                    fieldLabel: 'Concepto',
                    labelWidth: 60,
                    valueField:'nombre',
                    displayField:'nombre'
                },{
                    xtype:'grid',
                    hidden:true,
                    columns:[],
                    enableLocking:true,
                    height:300,
                    autoScroll:true,
                    margin:'5 0',
                    features: [{
                        ftype: 'summary'
                    }],
                    selType: 'cellmodel',
                    plugins: [
                        Ext.create('Ext.grid.plugin.CellEditing', {
                            clicksToEdit: 1
                        })
                    ],
                    listeners:{edit:this.refreshGrid, beforeEdit:this.preventEdit},
                    tbar:[{
                        xtype: 'combobox',
                        itemId: 'addItmCmb',
                        name:'account',
                        store: accounts,
                        valueField: 'id',
                        displayField: 'nombre',
                        matchFieldWidth: false,
                        fieldLabel:'Cuenta',
                        labelWidth: 80,
                        width:500,
                        allowBlank:false,
                        validator:this.accValidator,
                        disabled:true
                    },{
                        glyph: 43,
                        tooltip: 'Agregar Cuenta',
                        scale: 'medium',
                        text: 'Agregar',
                        itemId: 'addItm',
                        disabled: (APP.acl(17)) ? false : true
                    },'->','click en la celda para editarla']
                }],
                buttons:[{
                    xtype:'button',
                    text:'Cancelar',
                    itemId:'resetFrm',
                    scale:'medium',
                    handler:this.cancelEdit
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
    displayEntryNumber:function(el,v){
        el.up('window').down('[name=d_numero_partida]').setValue(v);
    },
    displayBook:function(el,v){
        var bookRecord=Ext.getStore('Books').findRecord('id', v ,0,false,false,true);
        el.up('window').down('[name=d_libro]').setValue(bookRecord.get('nombre'));
        if(!el.up('form').getForm().getRecord()){
            //refactor consecutive if new record and folder consecutive is by book
            var fId=Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0].getValue(),
                folder =Ext.getStore('Folders').findRecord('id',fId,0,false,false,true);
            if(folder.get('tipo_numeracion')!='global'){
                var book = Ext.getStore('Books').findRecord('id', v, 0, false, false, true),
                    pp =book.get('prefijo_partida'),
                    lp =book.get('lugares_partida'),
                    np =book.get('numero_partida'),
                    consec = APP.consecutive(pp, lp, np);
                el.up('window').down('[name=numero_partida]').setValue(consec);
            }
        }
    },
    displayPeriod:function(el,v){
        var periodRecord=Ext.getStore('Periods').findRecord('id', v, 0, false, false, true);
        el.up('window').down('[name=d_periodo]').setValue(periodRecord.get('nombre'));

        //restrict date values to period range
        el.up('window').down('[name=fecha]').setMinValue(periodRecord.get('inicio'));
        el.up('window').down('[name=fecha]').setMaxValue(periodRecord.get('fin'));
        el.up('window').down('[name=fecha]').setValue(periodRecord.get('inicio'));
    },
    renderAccName:function(v){
        if(v)return Ext.getStore('Accounts').findRecord('id', v, 0, false, false, true).get('nombre');
        else return '';
    },
    renderMarker:function(v){
        if(v)return Ext.getStore('Markers').findRecord('id', v, 0, false, false, true).get('nombre');
        else return '';
    },
    renderSupplier:function(v){
        if(v)return Ext.getStore('Suppliers').findRecord('id', v, 0, false, false, true).get('nombre');
        else return '';
    },
    renderDocType:function(v){
        if(v)return Ext.getStore('DocTypes').findRecord('id', v, 0, false, false, true).get('nombre');
        else return '';
    },
    cancelEdit:function(el){
        Ext.getStore('Entries').reload();
        el.up('window').close();
    },
    accValidator:function(v){
        var store = this.getStore(),
            rec = store.findRecord('field2',v,0,false,false,true);
        if(!rec)return 'el valor no es valido'; else return true;
    },
    refreshGrid:function(edt, e){
        e.grid.getView().refresh();
    },
    preventEdit:function(edt, e){
        var period = parseInt(e.grid.up('form').down('[name=periodo]').getValue()),
            balance = Ext.getStore('Balance').findRecord('periodo',period,0,false,false,true);
        if(balance)return false;
    }
});