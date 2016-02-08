/**
 * Created by Michel Lopez H on 02/11/2015.
 */
Ext.define('APP.model.Book', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'contabilidad', type: 'int'},
        {name: 'nombre', type: 'string'},
        {name: 'tipo', type: 'string'},
        {name: 'editable', type: 'boolean'},
        {name: 'prefijo_partida', type: 'string'},
        {name: 'numero_partida', type: 'int'},
        {name: 'lugares_partida', type: 'int'},
    ],
    validations: [
        {type: 'inclusion', field: 'tipo', list: ['auxiliar', 'diario']},
    ],
    proxy: {
        type: 'rest',
        api: {
            create: 'data/books.php?action=create',
            read: 'data/books.php?action=read',
            update: 'data/books.php?action=update',
            destroy: 'data/books.php?action=destroy'
        },
        reader: {
            type: 'json',
            messageProperty: 'msg',
            successProperty: 'success',
            root: 'data'
        }
    }
});