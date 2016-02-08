/**
 * Created by Michel Lopez H on 02/11/2015.
 */
Ext.define('APP.store.Books', {
    extend: 'Ext.data.Store',
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            model: 'APP.model.Book',
            remoteFilter:true
        }, cfg)]);
    }
});