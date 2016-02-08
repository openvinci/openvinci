/**
 * Created by Michel Lopez H on 21/11/2015.
 */
Ext.define('APP.model.Supplier', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'nombre', type: 'string'},
        {name: 'NIT', type: 'string'}
    ],
    proxy: {
        type: 'rest',
        api: {
            create: 'data/supplier.php?action=create',
            read: 'data/supplier.php?action=read',
            update: 'data/supplier.php?action=update',
            destroy: 'data/supplier.php?action=destroy'
        },
        reader: {
            type: 'json',
            messageProperty: 'msg',
            successProperty: 'success',
            root: 'data'
        }
    }
});