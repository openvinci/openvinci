/**
 * Created on 23/09/2015.
 */
Ext.define('APP.model.BalanceTree', {
    extend: 'Ext.data.TreeModel',
    fields: [
        {name: 'id',  type: 'string'},
        {name: 'text',  type: 'string', mapping:'nombre'},
        {name: 'leaf', type: 'boolean', mapping:'detalle'},
        {name: 'parentId',  type: 'string', mapping: 'padre'},
        {name: 'catalogo',  type: 'int'},
        {name: 'nivel',  type: 'int'},
        {name: 'balance',  type: 'int'},
        {name: 'ini_debe',  type: 'float'},
        {name: 'ini_haber',  type: 'float'},
        {name: 'per_debe',  type: 'float'},
        {name: 'per_haber',  type: 'float'},
        {name: 'fin_debe',  type: 'float'},
        {name: 'fin_haber',  type: 'float'}
    ],
    proxy: {
        type: 'ajax',
        url: 'data/balancetree.php'
    }
});