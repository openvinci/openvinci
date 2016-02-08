/**
 * Created by Michel Lopez H on 23/11/2015.
 */
Ext.define('APP.store.Entries', {
    extend: 'Ext.data.Store',
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            model: 'APP.model.Entry',
            remoteFilter:true
        }, cfg)]);
    }
});