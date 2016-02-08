/**
 * Created by Michel Lopez H on 08/11/2015.
 */
Ext.define('APP.store.Markers', {
    extend: 'Ext.data.Store',
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            model: 'APP.model.Marker',
            remoteFilter:true
        }, cfg)]);
    }
});