/**
 * Created by Michel Lopez H on 21/11/2015.
 */
Ext.define('APP.store.DocTypes', {
    extend: 'Ext.data.Store',
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            model: 'APP.model.DocType',
            autoLoad:true
        }, cfg)]);
    }
});