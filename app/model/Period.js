/**
 * Created on 03/10/2015.
 */
Ext.define('APP.model.Period', {
    extend: 'Ext.data.Model',
    fields:[
        {name:'id', type:'int'},
        {name:'nombre', type:'string'},
        {name:'inicio', type:'date', dateFormat:"Y-m-d"},
        {name:'fin', type:'date', dateFormat:"Y-m-d"},
        {name:'ejercicio', type:'int'}
    ],
    proxy: {
        type: 'rest',
        api: {
            create: 'data/periods.php?action=create',
            read: 'data/periods.php?action=read',
            update: 'data/periods.php?action=update',
            destroy: 'data/periods.php?action=destroy'
        },
        reader: {
            type: 'json',
            messageProperty: 'msg',
            successProperty: 'success',
            root: 'data'
        }
    }
});