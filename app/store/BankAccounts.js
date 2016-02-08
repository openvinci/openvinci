/**
 * Created by Michel Lopez H on 26/12/2015.
 */
Ext.define('APP.store.BankAccounts', {
    extend: 'Ext.data.Store',
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            model: 'APP.model.BankAccount',
            remoteFilter:true
        }, cfg)]);
    }
});