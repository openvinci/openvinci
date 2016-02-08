/**
 * Created by Michel Lopez H on 23/11/2015.
 */
Ext.define('APP.model.Entry', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'contabilidad', type: 'int'},
        {name: 'libro', type: 'int'},
        {name: 'periodo', type: 'int'},
        {name: 'fecha', type:'date', dateFormat:"Y-m-d"},
        {name: 'tipo_partida', type: 'int'},
        {name: 'numero_partida', type: 'string'},
        {name: 'referencia', type: 'string'},
        {name: 'concepto', type: 'string'},
        {name: 'valor', type: 'float'},
        {name: 'anulada', type: 'boolean'}
    ],
    associations:[
        { type: 'hasMany', model: 'APP.model.EntryRow', name:'entryrows', foreignKey: 'partida', autoLoad:true }
    ],
    proxy: {
        type: 'rest',
        api: {
            create: 'data/entry.php?action=create',
            read: 'data/entry.php?action=read',
            update: 'data/entry.php?action=update',
            destroy: 'data/entry.php?action=destroy'
        },
        reader: {
            type: 'json',
            messageProperty: 'msg',
            successProperty: 'success',
            root: 'data'
        }
    }
});