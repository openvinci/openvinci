/**
 * Created by Michel Lopez H on 30/10/2015.
 */
Ext.define('APP.model.Balance', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'contabilidad', type: 'int'},
        {name: 'periodo', type: 'int'},
        {name: 'periodName', type: 'string', convert: function(v, r) {
            return Ext.getStore('Periods').findRecord('id', r.get('periodo'),0,false,false,true).get('nombre');
        }}
    ],
    proxy: {
        type: 'rest',
        api: {
            create: 'data/balance.php?action=create',
            read: 'data/balance.php?action=read',
            update: 'data/balance.php?action=update',
            destroy: 'data/balance.php?action=destroy'
        },
        reader: {
            type: 'json',
            messageProperty: 'msg',
            successProperty: 'success',
            root: 'data'
        }
    }
});