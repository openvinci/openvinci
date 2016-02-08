/**
 * Created on 03/10/2015.
 */
Ext.define('APP.controller.Periods', {
    extend: 'Ext.app.Controller',
    models:['Period'],
    stores:['Periods'],
    views:['period.PeriodButton', 'period.Catalog'],
    init: function () {
        this.control({
            '#navToolBar': {
                render: this.loadInterface
            },
            'periodCatalog #addItm':{
                click:this.addPeriods
            }
        });
    },

    loadInterface: function (el) {
        //add menu button
        var pBtn = el.insert(1,{xtype:'periodbutton'});
        var prdmnu = pBtn.menu;

        if(APP.acl(4))prdmnu.add({
            text:'Catálogo de Periodos',
            glyph:47,
            handler:function(){
                var win = Ext.widget('periodCatalog');
            }
        });
    },
    addPeriods:function(el){
        var win=el.up('window');
        var store=Ext.getStore('Periods');
        var startDte = win.down('[name=startDte]').getValue();
        var endDte = win.down('[name=endDte]').getValue();

        store.add({
            nombre: Ext.Date.format(startDte, 'F/Y'),
            inicio: startDte,
            fin: endDte,
            ejercicio: Ext.Date.format(startDte, 'Y')
        });
        store.sync({
            scope:this,
            callback:function(){
                store.reload();
            }
        })
    }
});