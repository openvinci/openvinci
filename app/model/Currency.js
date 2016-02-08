/**
 * Created by Michel Lopez H on 24/12/2015.
 */
Ext.define('APP.model.Currency', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'nombre', type: 'string'},
        {name: 'simbolo', type: 'string'}
    ],
    proxy: {
        type: 'rest',
        api: {
            create: 'data/currency.php?action=create',
            read: 'data/currency.php?action=read',
            update: 'data/currency.php?action=update',
            destroy: 'data/currency.php?action=destroy'
        },
        reader: {
            type: 'json',
            messageProperty: 'msg',
            successProperty: 'success',
            root: 'data'
        }
    }
});