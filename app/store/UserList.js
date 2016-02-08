/**
 * Created by Michel Lopez H on 27/10/2015.
 */
Ext.define('APP.store.UserList', {
    extend: 'Ext.data.Store',
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            model: 'APP.model.SimpleUser',
            autoLoad:true
        }, cfg)]);
    }
});