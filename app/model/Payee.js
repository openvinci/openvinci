/**
 * Created by Michel Lopez H on 21/01/2016.
 */
Ext.define('APP.model.Payee', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'nombre', type: 'string'},
        {name: 'banco', type: 'int'},
        {name: 'contabilidad', type: 'int'}
    ],
    proxy: {
        type: 'rest',
        api: {
            create: 'data/payee.php?action=create',
            read: 'data/payee.php?action=read',
            update: 'data/payee.php?action=update',
            destroy: 'data/payee.php?action=destroy'
        },
        reader: {
            type: 'json',
            messageProperty: 'msg',
            successProperty: 'success',
            root: 'data'
        }
    }
});