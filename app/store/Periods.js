/**
 * Created on 03/10/2015.
 */
Ext.define('APP.store.Periods', {
    extend: 'Ext.data.Store',
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            model: 'APP.model.Period',
            autoLoad:true,
            remoteFilter:true,
            groupField:'ejercicio'
        }, cfg)]);
    }
});