/**
 * Created by Michel Lopez H on 10/11/2015.
 */
Ext.define('APP.model.Backup', {
    extend: 'Ext.data.Model',
    fields: [
        {name:'id', type:'string'},
        {name:'note', type:'string'},
        {name:'tmstmp', type:'date', dateFormat:"Y-m-d\TH:i:sP"},
        {name:'size', type:'int'}
    ],
    proxy: {
        type: 'rest',
        api: {
            create:'data/backup.php?action=create',
            read: 'data/backup.php?action=read',
            update: 'data/backup.php?action=update',
            destroy: 'data/backup.php?action=destroy'
        },
        reader: {
            type: 'json',
            messageProperty: 'msg',
            successProperty: 'success',
            root: 'data'
        }
    }
});