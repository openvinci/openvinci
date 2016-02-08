/**
 * Created by Michel Lopez H on 08/01/2016.
 */
Ext.define('APP.model.Check', {
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
        {name: 'anulada', type: 'boolean'},

        {name: 'entryId', type: 'int'},
        {name: 'catalogo', type: 'int'},
        {name: 'cuenta', type: 'string'},
        {name: 'e_concepto', type: 'string'},
        {name: 'debe', type: 'float'},
        {name: 'haber', type: 'float'}, //editable part
        {name: 'marcador', type: 'int', useNull:true},
        {name: 'proveedor', type: 'int', useNull:true},
        {name: 'tipo_doc', type: 'int', useNull:true},
        {name: 'serie_doc', type: 'string'},
        {name: 'numero_doc', type: 'string'},
        {name: 'fecha_doc', type:'date', dateFormat:"Y-m-d"},
        {name: 'observaciones', type: 'string'}
    ],
    associations:[
        { type: 'hasMany', model: 'APP.model.CheckRow', name:'checkrows', foreignKey: 'partida', autoLoad:true }
    ],
    proxy: {
        type: 'rest',
        api: {
            create: 'data/check.php?action=create',
            read: 'data/check.php?action=read',
            update: 'data/check.php?action=update',
            destroy: 'data/check.php?action=destroy'
        },
        reader: {
            type: 'json',
            messageProperty: 'msg',
            successProperty: 'success',
            root: 'data'
        }
    }
});