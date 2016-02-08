/**
 * Created by Michel Lopez H on 08/11/2015.
 */
Ext.define('APP.model.Marker', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'contabilidad', type: 'int'},
        {name: 'nombre', type: 'string'},
        {name: 'descrip', type: 'string'}
    ],
    proxy: {
        type: 'rest',
        api: {
            create: 'data/markers.php?action=create',
            read: 'data/markers.php?action=read',
            update: 'data/markers.php?action=update',
            destroy: 'data/markers.php?action=destroy'
        },
        reader: {
            type: 'json',
            messageProperty: 'msg',
            successProperty: 'success',
            root: 'data'
        }
    }
});