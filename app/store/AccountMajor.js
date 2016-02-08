/**
 * Created by Michel Lopez H on 24/11/2015.
 */
Ext.define('APP.store.AccountMajor', {
    extend: 'Ext.data.JsonStore',
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            fields:[
                {name:'id', type: 'int'},
                {name:'prdId', type: 'int'},
                {name:'bookId', type: 'int'},
                'numero_partida', 'tipo_partida','referencia', 'concepto',
                {name: 'fecha', type:'date', dateFormat:"Y-m-d"},
                {name: 'debe', type: 'float'},
                {name: 'haber', type: 'float'}
            ],
            sorters: [{
                property: 'fecha',
                direction: 'ASC'
            }],
            groupField: 'prdId',
            proxy: {
                type: 'ajax',
                url: 'data/AccountMajor.php',
                reader: {
                    type: 'json',
                    root: 'data',
                    messageProperty: 'msg',
                    successProperty: 'success'
                }
            }
        }, cfg)]);
    }
});