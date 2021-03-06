/**
 * Created by Michel Lopez H on 23/11/2015.
 */
Ext.define('APP.model.CheckRow', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'partida', type: 'int'},
        {name: 'catalogo', type: 'int'},
        {name: 'cuenta', type: 'string'},
        {name: 'concepto', type: 'string'},
        {name: 'debe', type: 'float'},
        {name: 'haber', type: 'float'},
        {name: 'marcador', type: 'int', useNull:true},
        {name: 'proveedor', type: 'int', useNull:true},
        {name: 'tipo_doc', type: 'int', useNull:true},
        {name: 'serie_doc', type: 'string'},
        {name: 'numero_doc', type: 'string'},
        {name:'fecha_doc', type:'date', dateFormat:"Y-m-d"},
        {name: 'observaciones', type: 'string'}
    ],
    associations:[
        { type: 'belongsTo', model: 'APP.model.Check', foreignKey: 'partida' }
    ],
    proxy: {
        type: 'rest',
        api: {
            create: 'data/checkRow.php?action=create',
            read: 'data/checkRow.php?action=read',
            update: 'data/checkRow.php?action=update',
            destroy: 'data/checkRow.php?action=destroy'
        },
        reader: {
            type: 'json',
            messageProperty: 'msg',
            successProperty: 'success',
            root: 'data'
        }
    }
});