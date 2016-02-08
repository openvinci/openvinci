/**
 * Created on 23/09/2015.
 */
Ext.define('APP.model.AccountTree', {
    extend: 'Ext.data.TreeModel',
    fields: [
        {name: 'id',  type: 'string'},
        {name: 'text',  type: 'string', mapping:'nombre'},
        {name: 'leaf', type: 'boolean', mapping:'detalle'},
        {name: 'parentId',  type: 'string', mapping: 'padre'},
        {name: 'catalogo',  type: 'int'},
        {name: 'grupo',  type: 'int'},
        {name: 'nivel',  type: 'int'}
    ],
    proxy: {
        type: 'ajax',
        url: 'data/accounttree.php'
    }
});