// JavaScript Document
Ext.define('APP.view.backup.Manager', {
    extend: 'Ext.window.Window',
    alias: 'widget.backupManager',
	glyph:100,
    title: 'Respaldo de datos',
    autoShow: true,
    modal:true,
    resizable:false,
	width:700,
	constrainHeader:true,

    initComponent: function() {	
        this.items = [{
			xtype:'grid',
			height:300,
			store:'Backups',
			columns:[
				{ text: 'Fecha',  dataIndex: 'tmstmp', width:150, sortable : true, xtype: 'datecolumn', format:'Y-m-d H:i:s'},
                { text: 'Nota',  dataIndex: 'note', flex:1, sortable : true},
				{ text: 'Tamaño',  dataIndex: 'size', width:100, sortable : true, renderer:this.renderSize},
                {
                    xtype: 'actioncolumn',
                    menuDisabled: true,
                    align: 'center',
                    width: 30,
                    items: [{
                        icon: 'style/imgs/icon-delete.png',
                        tooltip: 'Borrar',
                        handler: function (grid, rowIndex, colIndex) {
                            var rec = grid.getStore().getAt(rowIndex);
                            var title = 'Alerta',
                                msg = "Desea borrar este elemento?";
                            Ext.Msg.confirm(title, msg, function (btn) {
                                if (btn === 'yes') {
                                    rec.destroy({
                                        scope:this,
                                        callback:function(){
                                            Ext.getStore('Backups').reload();
                                        }
                                    })
                                }
                            });
                        },
                        disabled: (APP.acl(6)) ? false : true
                    }]
                }
			],
			bbar:[{
                glyph: 43,
                tooltip: 'Agregar nuevo Respaldo',
                scale: 'medium',
                text: 'Agregar',
                itemId: 'add',
                disabled: APP.acl(6) ? false : true
            },'->', 'Double click en el respaldo para restaurarlo']
        }];

        this.callParent(arguments);
    },
	renderSize:function(value){
		return Ext.util.Format.fileSize(value);
	}
});