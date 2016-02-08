/**
 * Created by Michel Lopez H on 30/10/2015.
 */
Ext.define('APP.store.Balance', {
    extend: 'Ext.data.Store',
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            model: 'APP.model.Balance',
            remoteFilter:true
        }, cfg)]);
    }
});