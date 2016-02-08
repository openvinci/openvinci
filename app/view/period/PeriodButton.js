// JavaScript Document
Ext.define('APP.view.period.PeriodButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.periodbutton',
	glyph:112,
	scale:'medium',
	text:'Periodo',
	
	initComponent: function() {
		var me = this;
        Ext.apply(me, {
            menu:[]
        });
		me.callParent(arguments);
	}
})