/**
 * Created by Michel Lopez H on 06/11/2015.
 */
Ext.define('APP.model.EntryType', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'nombre', type: 'string'},
        {name: 'descrip', type: 'string'},
        {name:'editable', type:'boolean'}
    ],
    proxy: {
        type: 'rest',
        api: {
            create: 'data/entrytype.php?action=create',
            read: 'data/entrytype.php?action=read',
            update: 'data/entrytype.php?action=update',
            destroy: 'data/entrytype.php?action=destroy'
        },
        reader: {
            type: 'json',
            messageProperty: 'msg',
            successProperty: 'success',
            root: 'data'
        }
    }
});