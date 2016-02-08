/**
 * Created on 19/10/2015.
 */
Ext.define('APP.store.Folders', {
    extend: 'Ext.data.Store',
    constructor: function (cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            model: 'APP.model.Folder',
            listeners:{
                load:this.selectFirst
            }
        }, cfg)]);
    },
    selectFirst:function(el, recs, success){
        var cmb=Ext.ComponentQuery.query('#navToolBar [name=workfolder]')[0];
        if(el.count() && !cmb.getValue()){
            cmb.select(el.first());
        }
    }
});