// JavaScript Document
Ext.define('APP.store.Accounts', {
    extend: 'Ext.data.Store',
    model: 'APP.model.Account',
    autoLoad:true,
    remoteFilter:true
});