/**
 * Created on 19/10/2015.
 */
Ext.define('APP.model.Folder', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'nombre', type: 'string'},
        {name: 'tipo_cierre', type: 'string'},
        {name: 'catalogo', type: 'int'},
        {name: 'cuenta_cierre', type: 'string'},
        {name: 'tipo_numeracion', type: 'string'},
        {name: 'prefijo_partida', type: 'string'},
        {name: 'numero_partida', type: 'int'},
        {name: 'lugares_partida', type: 'int'},
        {name: 'consolidada', type: 'boolean'},
        'users', 'origins',
        {name: 'firma1', type: 'string'},
        {name: 'cargo1', type: 'string'},
        {name: 'firma2', type: 'string'},
        {name: 'cargo2', type: 'string'},
        {name: 'firma3', type: 'string'},
        {name: 'cargo3', type: 'string'},
        {name: 'firma4', type: 'string'},
        {name: 'cargo4', type: 'string'}
    ],
    validations: [
        {type: 'length', field: 'nombre', min: 4, max:50},
        {type: 'inclusion', field: 'tipo_cierre', list: ['total', 'resultados']},
        {type: 'inclusion', field: 'tipo_numeracion', list: ['global', 'por libro']},
    ],
    proxy: {
        type: 'rest',
        api: {
            create: 'data/folders.php?action=create',
            read: 'data/folders.php?action=read',
            update: 'data/folders.php?action=update',
            destroy: 'data/folders.php?action=destroy'
        },
        reader: {
            type: 'json',
            messageProperty: 'msg',
            successProperty: 'success',
            root: 'data'
        }
    }
});