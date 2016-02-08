/**
 * Created by Michel Lopez H on 10/11/2015.
 */
Ext.define('APP.store.Backups', {
    extend: 'Ext.data.Store',
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            model: 'APP.model.Backup',
            sorters:[{
                property: 'tmstmp',
                direction: 'DESC'
            }]
        }, cfg)]);
    }
});