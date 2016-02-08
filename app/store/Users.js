// JavaScript Document
Ext.define('APP.store.Users', {
    extend: 'Ext.data.Store',
    model: 'APP.model.User',
	groupField: 'type'
});