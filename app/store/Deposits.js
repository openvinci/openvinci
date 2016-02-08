/**
 * Created by Michel Lopez H on 08/01/2016.
 */
Ext.define('APP.store.Deposits', {
    extend: 'Ext.data.Store',
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            model: 'APP.model.Deposit',
            remoteFilter:true
        }, cfg)]);
    }
});