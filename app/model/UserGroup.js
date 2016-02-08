// JavaScript Document
Ext.define('APP.model.UserGroup', {
    extend: 'Ext.data.Model',
    fields: ['name', 'permits',{
		name:'id', type:'int'
	}],
	proxy: {
        type: 'rest',
		actionMethods:{create: 'POST', read: 'GET', update: 'POST', destroy: 'POST'},
        api: {
			create:'data/userGroups.php?action=create',
			read: 'data/userGroups.php?action=read',
			update: 'data/userGroups.php?action=update',
			destroy: 'data/userGroups.php?action=destroy'
		},
        reader: {
            type: 'json',
            root: 'data',
            successProperty: 'success'
        }
    }
});