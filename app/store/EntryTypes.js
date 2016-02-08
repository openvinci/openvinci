/**
 * Created by Michel Lopez H on 06/11/2015.
 */
Ext.define('APP.store.EntryTypes', {
    extend: 'Ext.data.Store',
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            model: 'APP.model.EntryType',
            autoLoad:true
        }, cfg)]);
    }
});