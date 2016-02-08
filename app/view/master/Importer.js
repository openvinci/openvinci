/**
 * Created on 03/10/2015.
 */
Ext.define('APP.view.master.Importer', {
    extend: 'Ext.window.Window',
    alias: 'widget.importerMaster',
    glyph:77,
    title: 'Importar de Vinci 4.5',
    layout: 'fit',
    autoShow: true,
    modal:true,
    resizable:false,
    width:500,
    selectedGroup:0, //selected group catalog
    filename:'', //name of the imported zip file
    constrainHeader:true,

    initComponent: function() {
        Ext.applyIf(this, {
           items:[{
               xtype:'form',
               padding: 5,
               border:false,
               items:[{
                   xtype:'combo',
                   name:'grupo',
                   fieldLabel: 'Grupo de Catalogos',
                   labelWidth:120,
                   anchor: '100%',
                   store: 'Groups',
                   queryMode: 'local',
                   displayField: 'nombre',
                   valueField: 'id',
                   allowBlank:false,
                   editable:false,
                   listeners:{
                       change:function(el, v){el.up('window').selectedGroup = v}
                   }
               },{
                   xtype: 'filefield',
                   name: 'workfolder',
                   fieldLabel: 'Carpeta',
                   labelWidth:120,
                   msgTarget: 'side',
                   allowBlank: false,
                   anchor: '100%',
                   listeners:{
                       change:this.submitFrm
                   }
               },{
                   itemId:'status',
                   xtype:'progressbar',
                   text:'Esperando...'
               }]
           }]
        });
        this.callParent(arguments);
    },
    submitFrm:function(el){
        el.up('form').submit({
            clientValidation: true,
            scope:this,
            url:'importer/upload.php',
            success: function(form, action) {
                //action.result.msg
                this.up('window').filename = action.result.msg;
                //console.log(action.result.msg, this);
                this.up('window').checkAccounts();
            },
            failure: function(form, action) {
                switch (action.failureType) {
                    case Ext.form.action.Action.CLIENT_INVALID:
                        Ext.Msg.alert('Error', 'Los campos del formulario no pueden ser enviados con errores');
                        break;
                    case Ext.form.action.Action.CONNECT_FAILURE:
                        Ext.Msg.alert('Error', 'Error de comunicacion Ajax');
                        break;
                    case Ext.form.action.Action.SERVER_INVALID:
                        Ext.Msg.alert('Error', action.result.msg);
                }
            }
        });
    },
    checkAccounts:function(){
        this.down('#status').updateProgress(.3,'verificando cuentas');
        Ext.Ajax.request({
            scope:this,
            url: 'importer/accounts.php',
            params:{id:this.filename, group:this.selectedGroup},
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(obj.success){
                    Ext.getStore('AccountGroups').load();
                    Ext.getStore('Accounts').load();
                    this.checkPeriods();
                }else this.down('#status').updateText(obj.msg);
            },
            failure: function(response, opts) {
                this.down('#status').updateText('server-side failure with status code ' + response.status);
            }
        });
    },
    checkPeriods:function(){
        this.down('#status').updateProgress(.6,'verificando periodos');
        Ext.Ajax.request({
            scope:this,
            url: 'importer/periods.php',
            params:{id:this.filename, group:this.selectedGroup},
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(obj.success){
                    Ext.getStore('Periods').load();
                    this.cleanUp();
                }else this.down('#status').updateText(obj.msg);
            },
            failure: function(response, opts) {
                this.down('#status').updateText('server-side failure with status code ' + response.status);
            }
        });
    },
    cleanUp:function(){
        this.down('#status').updateProgress(.9,'borrando temporales');
        Ext.Ajax.request({
            scope:this,
            url: 'importer/cleanup.php',
            params:{id:this.filename},
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if(obj.success){
                    this.down('#status').updateProgress(0,obj.msg);
                }else this.down('#status').updateText(obj.msg);
            },
            failure: function(response, opts) {
                this.down('#status').updateText('server-side failure with status code ' + response.status);
            }
        });
    }
});