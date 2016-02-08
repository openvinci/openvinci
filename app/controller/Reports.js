/**
 * Created by Michel Lopez H on 14/12/2015.
 */
Ext.define('APP.controller.Reports', {
    extend: 'Ext.app.Controller',
    models: [],
    stores: [],
    views: ['reports.ReportsButton'],
    init: function () {
        this.control({
            '#navToolBar': {
                render: this.loadInterface
            }
        });
    },
    loadInterface: function (el) {
        var tbs = el.down('tbspacer');
        var rprtBtn = el.insert(el.items.findIndex('xtype', 'tbfill'), {xtype:'reportsbutton'});
        var rprtmnu = rprtBtn.menu;
    }
});