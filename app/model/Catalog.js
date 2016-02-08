/**
 * Created by Michel Lopez H on 15/11/2015.
 */
Ext.define('APP.model.Catalog', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'nombre', type: 'string'}
    ],
    proxy: {
        type: 'rest',
        api: {
            create: 'data/catalog.php?action=create',
            read: 'data/catalog.php?action=read',
            update: 'data/catalog.php?action=update',
            destroy: 'data/catalog.php?action=destroy'
        },
        reader: {
            type: 'json',
            messageProperty: 'msg',
            successProperty: 'success',
            root: 'data'
        }
    }
});