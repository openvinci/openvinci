/**
 * Created by Michel Lopez H on 30/11/2015.
 */
Ext.define('APP.view.entry.Major', {
    extend: 'Ext.window.Window',
    alias: 'widget.entryMajor',
    glyph: 77,
    title: 'Mayor General',
    autoShow: true,
    modal: true,
    resizable: false,
    width: 1000,
    constrainHeader: true,
    initComponent: function () {
        var me = this;

        //get detail accounts array
        var accounts=[];
        Ext.getStore('Accounts').each(function(r){
            var fId=Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0].getValue(),
                folder =Ext.getStore('Folders').findRecord('id',fId,0,false,false,true);
            if(r.get('detalle') == true && r.get('catalogo') == folder.get('catalogo')){
                //console.info(r.data);
                accounts.push([r.get('id'), r.get('id')+' - '+ r.get('nombre')]);
            }
        },this);

        Ext.applyIf(me, {
            tbar:[{
                xtype: 'combobox',
                store: accounts,
                matchFieldWidth: false,
                name: 'cuenta',
                allowBlank: false,
                fieldLabel: 'Cuenta',
                labelWidth: 50,
                width:500,
                validator:this.accValidator,
                listeners:{change: me.filterEntries}
            },'->','doble click en la partida para editarla',{
                text:'Imprimir',
                glyph:'61487@FontAwesome',
                scale:'medium',
                disabled:true,
                itemId:'printBttn',
                disabled:(APP.acl(36))?false:true,
                handler:function(el){
                    var cta = el.up('window').down('[name=cuenta]').getValue();
                    var fldr=Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0].getValue();
                    if(cta){

                        var newWind = window.open("data/reports/mayor.php?id="+cta+"&folder="+fldr, "mayor", "");
                    }
                }
            }],
            items:[{
                xtype:'grid',
                store:'AccountMajor',
                features: [{
                    ftype: 'groupingsummary',
                    groupHeaderTpl: [
                        'periodo: {name:this.formatName}',
                        {
                            formatName: function(name) {
                                return Ext.getStore('Periods').findRecord('id',name,0,false,false,true).get('nombre');
                            }
                        }
                    ],
                    enableGroupingMenu:false,
                    enableNoGroups:false,
                    startCollapsed:true
                }],
                height:400,
                columns:[{
                    text: 'Fecha',
                    dataIndex: 'fecha',
                    xtype: 'datecolumn',
                    format: 'Y-m-d',
                    width: 90,
                    sortable: true
                },{
                    text: 'Tipo',
                    dataIndex: 'tipo_partida',
                    width:60,
                    sortable: true
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
                    text: 'Debe',
                    dataIndex: 'debe',
                    width: 120,
                    sortable: false,
                    xtype: 'numbercolumn',
                    align: 'right',
                    summaryType: 'sum',
                    summaryRenderer: function(v){return '<b>'+Ext.util.Format.number(v,'0,0.00')+'</b>';}
                }, {
                    text: 'Haber',
                    dataIndex: 'haber',
                    width:120,
                    sortable: false,
                    xtype: 'numbercolumn',
                    align: 'right',
                    summaryType: 'sum',
                    summaryRenderer: function(v){return '<b>'+Ext.util.Format.number(v,'0,0.00')+'</b>';}
                }]
            }]
        });
        me.callParent(arguments);
    },
    filterEntries:function(el, v){
        //reloading concepts
        Ext.getStore('AccountMajor').reload({
            params:{id:v}
        });
    },
    accValidator:function(v){
        var store = this.getStore(),
            rec = store.findRecord('field2',v,0,false,false,true);
        if(!rec)return 'el valor no es valido'; else return true;
    }
});