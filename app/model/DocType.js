/**
 * Created by Michel Lopez H on 22/11/2015.
 */
Ext.define('APP.model.DocType', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'nombre', type: 'string'}
    ],
    proxy: {
        type: 'rest',
        api: {
            create: 'data/docType.php?action=create',
            read: 'data/docType.php?action=read',
            update: 'data/docType.php?action=update',
            destroy: 'data/docType.php?action=destroy'
        },
        reader: {
            type: 'json',
            messageProperty: 'msg',
            successProperty: 'success',
            root: 'data'
        }
    }
});