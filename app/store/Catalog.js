/**
 * Created by Michel Lopez H on 15/11/2015.
 */
Ext.define('APP.store.Catalog', {
    extend: 'Ext.data.Store',
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            model: 'APP.model.Catalog',
            autoLoad:true
        }, cfg)]);
    }
});