/**
 * Created by Michel Lopez H on 24/12/2015.
 */
Ext.define('APP.store.Currency', {
    extend: 'Ext.data.Store',
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            model: 'APP.model.Currency',
            autoLoad:true
        }, cfg)]);
    }
});