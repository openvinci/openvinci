/**
 * Created by Michel Lopez H on 21/01/2016.
 */
Ext.define('APP.store.Payees', {
    extend: 'Ext.data.Store',
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            model: 'APP.model.Payee',
            autoLoad:true
        }, cfg)]);
    }
});