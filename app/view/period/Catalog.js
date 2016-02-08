/**
 * Created on 07/10/2015.
 */
Ext.define('APP.view.period.Catalog', {
    extend: 'Ext.window.Window',
    alias: 'widget.periodCatalog',
    glyph:77,
    title: 'Catálogo de Periodos',
    layout: 'fit',
    autoShow: true,
    modal:true,
    resizable:false,
    width:600,
    constrainHeader:true,

    initComponent: function() {
        Ext.applyIf(this, {
            items:[{
                xtype:'grid',
                store:'Periods',
                height:300,
                autoScroll:true,
                columns: [{
                    text: 'Mes',
                    dataIndex: 'nombre',
                    flex: 2,
                    sortable: true,
                    editor: {xtype: 'textfield', allowBlank: false}
                },{
                    text: 'Inicio',
                    dataIndex: 'inicio',
                    flex: 1,
                    sortable: true,
                    xtype: 'datecolumn',
                    format:'d M Y',
                    align:'right',
                    editor: {xtype: 'datefield', allowBlank: false, editable:false}
                }, {
                    text: 'Fin',
                    dataIndex: 'fin',
                    flex: 1,
                    sortable: true,
                    xtype: 'datecolumn',
                    format: 'd M Y',
                    align:'right',
                    editor: {xtype: 'datefield', allowBlank: false, editable: false}
                },{
                    xtype: 'actioncolumn',
                    menuDisabled: true,
                    align: 'center',
                    width: 30,
                    items: [{
                        icon: 'style/imgs/icon-delete.png',
                        tooltip: 'Delete',
                        handler: function (grid, rowIndex, colIndex) {
                            var rec = grid.getStore().getAt(rowIndex);
                            var title = 'Alerta',
                                msg = "Desea borrar este elemento?";
                            Ext.Msg.confirm(title, msg, function (btn) {
                                if (btn === 'yes') {
                                    rec.destroy({
                                        scope:this,
                                        callback:function(){
                                            Ext.getStore('Periods').reload();
                                        }
                                    })
                                }
                            });
                        },
                        disabled: (APP.acl(4)) ? false : true
                    }]
                }],
                features: [{ftype:'grouping', groupHeaderTpl: 'Ejercicio: {name}'}],
                selType: 'rowmodel',
                tbar:[{
                    glyph:43,
                    tooltip:'Agregar Elemento',
                    scale:'medium',
                    text:'Agregar',
                    itemId:'addItm'
                },'->', {
                    xtype:'textfield',
                    name:'ejercicio',
                    fieldLabel: 'Ejercicio',
                    labelWidth: 55,
                    width:120,
                    maxLength:10,
                    enforceMaxLength:true
                },{
                    xtype: 'datefield',
                    fieldLabel: 'Inicio',
                    labelWidth: 35,
                    name: 'startDte',
                    width: 160,
                    editable: false,
                    listeners:{
                        change:this.calculateEnd
                    }
                },{
                    xtype: 'datefield',
                    fieldLabel: 'Fin',
                    labelWidth: 30,
                    name: 'endDte',
                    width: 160,
                    editable:false
                }]
            }],
            listeners:{
                show:function(el){
                    Ext.getStore('Periods').on('load', this.setTBar, this)
                },
                close:function(el){
                    Ext.getStore('Periods').un('load', this.setTBar, this)
                }
            }
        });
        this.callParent(arguments);
    },
    calculateEnd:function(el,nv,ov){
        var edt = Ext.Date.add(nv, Ext.Date.MONTH, 1);
        edt = Ext.Date.add(edt, Ext.Date.DAY, -1);
        el.up('window').down('[name=endDte]').setValue(edt);
        el.up('window').down('[name=ejercicio]').setValue(Ext.Date.format(nv, 'Y'));
    },
    setTBar:function(el,records,success,eopts){
        var dt=el.max('fin');
        if(!dt)dt=new Date();
        dt = Ext.Date.add(dt, Ext.Date.DAY, 1);
        this.down('[name=startDte]').setValue(dt);
    }
});