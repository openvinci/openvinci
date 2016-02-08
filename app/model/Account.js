/**
 * Created on 24/09/2015.
 */
Ext.define('APP.model.Account', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',  type: 'string'},
        {name: 'nombre',  type: 'string'},
        {name: 'detalle', type: 'boolean'},
        {name: 'padre',  type: 'string'},
        {name: 'catalogo',  type: 'int'},
        {name: 'grupo',  type: 'int'},
        {name: 'nivel',  type: 'int'}
    ],
    proxy: {
        type: 'rest',
        actionMethods:{create: 'POST', read: 'GET', update: 'POST', destroy: 'POST'},
        api: {
            create:'data/accounts.php?action=create',
            read: 'data/accounts.php?action=read',
            update: 'data/accounts.php?action=update',
            destroy: 'data/accounts.php?action=destroy'
        },
        reader: {
            type: 'json',
            root: 'data',
            successProperty: 'success'
        }
    }
});