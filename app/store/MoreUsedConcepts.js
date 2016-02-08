/**
 * Created by Michel Lopez H on 24/11/2015.
 */
Ext.define('APP.store.MoreUsedConcepts', {
    extend: 'Ext.data.JsonStore',
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            fields:[{name:'id', type: 'int'}, 'nombre'],
            proxy: {
                type: 'ajax',
                url: 'data/MoreUsedConcepts.php',
                reader: {
                    type: 'json',
                    root: 'data',
                    messageProperty: 'msg',
                    successProperty: 'success'
                }
            },
            autoLoad:true
        }, cfg)]);
    }
});