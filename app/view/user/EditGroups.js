Ext.define('APP.view.user.EditGroups', {
    extend: 'Ext.window.Window',
    alias: 'widget.usergroups',
    glyph:85,
    title: 'Grupos de Usuarios',
    layout: 'fit',
    autoShow: true,
    modal:true,
    resizable:false,
	layout:'column',
	width:600,
	constrainHeader:true,

    initComponent: function() {
        this.items=[{
            columnWidth: 0.4,
            xtype:'grid',
            columns: [
                { text: 'Nombre',  dataIndex: 'name', flex:1, sortable : true},
            ],
            store:'UserGroups',
            height:250,
            autoScroll:true,
            tbar:[{
                glyph:43,
                tooltip:'Agregar Grupo',
                scale:'medium',
                text:'Agregar',
                itemId:'addGrp'
            },{
                glyph:88,
                itemId:'delGrp',
                tooltip:'Eliminar Grupo',
                scale:'medium',
                text:'Eliminar',
                disabled:true
            }]
        },{
            columnWidth: 0.6,
            itemId:'editForm',
            xtype:'form',
            disabled:true,
            action:'',
            height:250,
            padding:4,
            border:false,
            defaults: {
                anchor:'100%',
                labelWidth: 70
            },
            autoScroll:true,
            items:[{
                xtype:'textfield',
                fieldLabel:'Nombre',
                name:'name',
                allowBlank:false,
            },{
                xtype:'checkboxgroup',
                fieldLabel:'Permisos',
                columns: 1,
                vertical: true,
                loader:{
                    url: 'data/permits.php',
                    renderer: 'component',
                    autoLoad:true
                }
            }],
            buttons:[{
                xtype:'button',
                text:'Cancelar',
                itemId:'resetGrp',
                action: 'reset',
                scale:'medium'
            },'->',{
                xtype:'button',
                itemId:'saveGrp',
                action: 'save',
                text:'Guardar',
                scale:'medium'
            }]
        }]
        this.callParent(arguments);
    }
});