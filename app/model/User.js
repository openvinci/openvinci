// JavaScript Document
Ext.define('APP.model.User', {
    extend: 'Ext.data.Model',
    fields: ['name', 'permits', 'pass', 'email',{
		name:'id', type:'int'
	},{
		name:'type', type:'int'
	},{
		name:'active', type:'boolean'
	}],
	proxy: {
        type: 'rest',
		actionMethods:{create: 'POST', read: 'GET', update: 'POST', destroy: 'POST'},
        api: {
			create:'data/users.php?action=create',
			read: 'data/users.php?action=read',
			update: 'data/users.php?action=update',
			destroy: 'data/users.php?action=destroy'
		},
        reader: {
            type: 'json',
            root: 'data',
            successProperty: 'success'
        }
    }
});