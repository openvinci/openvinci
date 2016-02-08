/**
 * Created by Michel Lopez H on 27/10/2015.
 */
Ext.define('APP.model.SimpleUser', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'nombre', type: 'string', mapping:'name'}
    ],
    proxy: {
        type: 'ajax',
        url:'data/userList.php',
        reader: {
            type: 'json',
            messageProperty: 'msg',
            successProperty: 'success',
            root: 'data'
        }
    }
});