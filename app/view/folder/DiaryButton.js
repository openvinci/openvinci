// JavaScript Document
Ext.define('APP.view.folder.DiaryButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.diarybutton',
    glyph:112,
	scale:'medium',
	text:'Diario',
	
	initComponent: function() {
		var me = this;
        Ext.apply(me, {
            menu:[]
        });
		me.callParent(arguments);
	}
})