/**
 * Created on 21/09/2015.
 */
// JavaScript Document
Ext.define('APP.model.Group', {
    extend: 'Ext.data.Model',
    fields: [
        {name:'id', type:'int'},
        'nombre',
        {name:'debe', type:'boolean'},
        {name:'editable', type:'boolean'}
    ],
    idProperty:'id',
    proxy: {
        type: 'rest',
        //actionMethods:{create: 'POST', read: 'GET', update: 'POST', destroy: 'POST'},
        api: {
            create:'data/groups.php?action=create',
            read: 'data/groups.php?action=read',
            update: 'data/groups.php?action=update',
            destroy: 'data/groups.php?action=destroy'
        },
        reader: {
            type: 'json',
            root: 'data',
            successProperty: 'success'
        }
    }
});