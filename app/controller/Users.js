// JavaScript Document
Ext.define('APP.controller.Users', {
    extend: 'Ext.app.Controller',
    models:['UserGroup', 'User', 'SimpleUser'],
    stores:['UserGroups', 'Users', 'UserList'],
    views: ['Header', 'user.Logon', 'user.Login', 'user.UserButton', 'user.Pass', 'user.AdminButton', 'user.EditGroups', 'user.EditUsers'],
    init: function() {
        this.control({
            '#navToolBar':{
                render:this.loadInterface
            },
            'userlogin button[action=save]':{
                click: this.loginUser
            },
            'userbutton #closeSess':{
                click:this.logoutUser
            },
            'userbutton #changePass':{
                click: this.changePass
            },
            'userpass button[action=save]':{
                click: this.savePass
            },
            'usergroups gridpanel':{
                selectionchange: this.loadgroup,
                itemdblclick: this.editgroup
            },
            'usergroups #addGrp':{
                click: this.addGrp
            },
            'usergroups #delGrp':{
                click: this.delGrp
            },
            'usergroups #saveGrp':{
                click: this.saveGrp
            },
            'usergroups #resetGrp':{
                click: this.rstGrp
            },
            'users gridpanel':{
                selectionchange: this.loaduser,
                itemdblclick: this.edituser
            },
            'users #addUsr':{
                click: this.addUsr
            },
            'users #delUsr':{
                click: this.delUsr
            },
            'users #saveUsr':{
                click: this.saveUsr
            },
            'users #resetUsr':{
                click: this.rstGrp
            },
            'users #groupBox':{
                select: this.usrGrpSelect
            }
        });

        //client side access global function
        APP.acl=function(permit){
            //retrieve user data from cookie if necessary
            if(!Ext.isObject(APP.user))APP.user=Ext.decode(Ext.util.Cookies.get('user'));
            var user=APP.user.permits.split(', ');
            Ext.Array.each(user, function(itm, i, arr){user[i]=parseInt(itm);});
            user=Ext.Array.indexOf(user,permit);
            if(user!==-1)return true; else return false;
        };
    },

    loadInterface:function(el){
        //refresh logo
        //var logo = Ext.dom.Query.select('.app-header img')[0];
        //console.log(logo);
        //Ext.get(logo).setStyle('z-index', 10000 );

        //retrieve user data from cookie
        APP.user=Ext.decode(Ext.util.Cookies.get('user'));

        //loading stores
        if(APP.acl(2))Ext.getStore('UserGroups').load();
        if(APP.acl(1))Ext.getStore('Users').load();
        
        //adding interface
        if(APP.acl(1) || APP.acl(2)){
            var uBtn = el.insert(0,{xtype:'adminbutton'});
            var mnu = uBtn.menu;

            if(APP.acl(1))mnu.add({
                text:'Usuarios', 
                glyph:117,
                handler:function(){
                    Ext.getStore('Users').clearFilter();
                    Ext.widget('users');
                }
            });

            if(APP.acl(2))mnu.add({
                text:'Grupos',
                glyph:85,
                handler:function(){
                    Ext.widget('usergroups');
                }
            });
        }
    },

    loginUser: function(el){
        var form = el.up('form').getForm();
        if (form.isValid()) {
            // Submit the Ajax request and handle the response
            form.submit({
                scope:this,
                success: function(form, action) {
                    APP.user=base64_decode(action.result.msg);
                    Ext.util.Cookies.set('user',APP.user);
                    Ext.getCmp('viewport').removeAll();
                    Ext.getCmp('viewport').add({xtype:'userlogon'});
                },
                failure: function(form, action) {
                    switch (action.failureType) {
                        case Ext.form.action.Action.CONNECT_FAILURE:
                            Ext.Msg.alert('Error', 'Fallo en la comunicacion con el servidor');
                            break;
                        case Ext.form.action.Action.SERVER_INVALID:
                            Ext.Msg.alert('Error', action.result.msg);
                    }
                }
            });
        }
    },

    logoutUser:function(el){
        Ext.Ajax.request({
            url: 'data/users.php',
            params: {action: 'logout'},
            callback: function(response){
                Ext.util.Cookies.clear('user');
                APP.user={};
                Ext.getCmp('viewport').removeAll();
                Ext.getCmp('viewport').add({xtype:'userlogin'});
            }
        });
    },

    changePass:function(el){
        Ext.widget('userpass');
    },

    savePass:function(el){
        var form = el.up('form').getForm();
        if (form.isValid()) {
            // Submit the Ajax request and handle the response
            form.submit({
                success: function(form, action) {
                el.up('window').close();
                    Ext.Msg.alert('Error', action.result.msg);
                },
                failure: function(form, action) {
                    switch (action.failureType) {
                        case Ext.form.action.Action.CONNECT_FAILURE:
                            Ext.Msg.alert('Error', 'Fallo en la comunicacion con el servidor');
                            break;
                        case Ext.form.action.Action.SERVER_INVALID:
                            Ext.Msg.alert('Error', action.result.msg);
                    }
                }
            });
        }
    },

    loadgroup:function(model, records, e){
        var win=Ext.ComponentQuery.query('usergroups')[0];
        if (records[0]){
            win.down('#delGrp').enable();
        }
    },
    
    editgroup: function(el, record, item, index, e, eOpts){
        var win=el.up('window'), form = win.down('form').getForm();
        win.down('form').enable();
        form.loadRecord(record);
        if(record.get('permits')){
            win.down('checkboxgroup').setValue({permits:record.get('permits').split(', ')});
        }else{
            win.down('checkboxgroup').setValue({permits:[]});
        }
        win.down('grid').disable();
        win.down('form').action='update';
        
    },

    addGrp:function(el){
        var win = el.up('window');
        win.down('form').enable();
        win.down('grid').disable();
        win.down('form').action='create';
        win.down('form').getForm().reset();
    },

    delGrp:function(el){
        var title='Borrar el Grupo de Usuarios?',
        msg="Todas las entradas asociadas se borraran en el proceso";
        Ext.Msg.confirm(title, msg, function(btn){
            if (btn === 'yes'){
                var sm = el.up('gridpanel').getSelectionModel(),
                store=Ext.getStore('UserGroups');
                if(Ext.getStore('Users').find('type',sm.getSelection()[0].get('id'))!==-1){
                    Ext.Function.defer(function(){
                        var title='Alerta',
                        msg="El grupo contiene usuarios, no puede ser borrado";
                        Ext.Msg.alert(title, msg);
                    }, 200);
                    return;
                }
                store.remove(sm.getSelection());

                store.sync({
                    scope:this,
                    callback:function(){
                        Ext.getStore('UserGroups').load({
                            scope   : this,
                            callback: function(records, operation, success) {
                                if (store.getCount() > 0) {
                                    sm.select(0);
                                }
                            }
                        });
                    }
                });
            }
        });
    },

    saveGrp:function(el){
        var form = el.up('window').down('form').getForm();
        if (form.isValid()) {
            var model=this.getModel('UserGroup'),
            values = form.getValues(),
            sm = el.up('window').down('gridpanel').getSelectionModel(),            
            store=this.getStore('UserGroups');
            switch(el.up('window').down('form').action){
                case 'update':
                    var record=form.getRecord();
                    if(Ext.isArray(values.permits))values.permits=values.permits.join(', '); 
                    else if(!values.permits)values.permits='';
                    record.set(values);
                    record.save({
                        scope:this,
                        success:function(){
                            store.load({
                                scope:this,
                                success:function(){
                                    sm.select(values.id);
                                }
                            });
                        }
                    });
                    break;
                case 'create':
                    if(Ext.isArray(values.permits)){
                        values.permits=values.permits.join(', ');
                    }else if(!values.permits){ 
                        values.permits='';
                    }
                    store.add(values);
                    store.sync({
                        scope:this,
                        callback:function(){
                            store.load({
                                scope   : this,
                                callback: function(records, operation, success) {
                                    if (store.getCount() > 0) {
                                        sm.select(store.find('name',values.name));
                                    }
                                }
                            });
                        }
                    });
                    break;
            }
            
            el.up('window').down('grid').enable();
            el.up('window').down('form').disable();
        }
    },
    rstGrp:function(el){
        var win = el.up('window');
        win.down('form').getForm().reset();
        win.down('form').disable();
        win.down('grid').enable();
        win.down('form').action='';        
    },

    loaduser:function(model, records, e){
        var win=Ext.ComponentQuery.query('users')[0];
        if (records[0]){
            win.down('#delUsr').enable();
        }
    },
    
    edituser: function(el, record, item, index, e, eOpts){
        var win=el.up('window'), form = win.down('form').getForm();
        win.down('form').enable();
        form.loadRecord(record);
        if(record.get('permits')){
            win.down('checkboxgroup').setValue({permits:record.get('permits').split(', ')});
        }else{
            win.down('checkboxgroup').setValue({permits:[]});
        }
        win.down('grid').disable();
        win.down('form').action='update';        
    },

    addUsr:function(el){
        var win = el.up('window');
        win.down('form').enable();
        win.down('grid').disable();
        win.down('form').action='create';
        win.down('form').getForm().reset();
    },

    delUsr:function(el){
        var title='Borrar el Usuario?',
        msg="Todas las entradas asociadas serán borradas en el proceso";
        Ext.Msg.confirm(title, msg, function(btn){
            if (btn === 'yes'){
                var sm = el.up('gridpanel').getSelectionModel(),
                store=Ext.getStore('Users');
                store.remove(sm.getSelection());
                store.sync({
                    scope:this,
                    callback:function(){
                        Ext.getStore('Users').load({
                            scope   : this,
                            callback: function(records, operation, success) {
                                if (store.getCount() > 0) {
                                    sm.select(0);
                                }
                            }
                        });
                    }
                });
            }
        });
    },

    saveUsr:function(el){
        var form = el.up('window').down('form').getForm();
        if (form.isValid()) {
            var model=this.getModel('User'),
            values = form.getValues(),
            sm = el.up('window').down('gridpanel').getSelectionModel(),            
            store=this.getStore('Users');
            switch(el.up('window').down('form').action){
                case 'update':
                    var record=form.getRecord();
                    
                    if(Ext.isArray(values.permits))values.permits=values.permits.join(', '); 
                    else if(!values.permits)values.permits='';
                    record.set(values);
                    record.save({
                        scope:this,
                        success:function(){
                            Ext.getStore('UserList').reload();
                            store.load({
                                scope:this,
                                success:function(){
                                    sm.select(values.id);
                                }
                            });
                        }
                    });
                    break;
                case 'create':
                    if(Ext.isArray(values.permits)){
                        values.permits=values.permits.join(', ');
                    }else if(!values.permits){ 
                        values.permits='';
                    }
                    store.add(values);
                    store.sync({
                        scope:this,
                        callback:function(){
                            Ext.getStore('UserList').reload();
                            store.load({
                                scope   : this,
                                callback: function(records, operation, success) {
                                    if (store.getCount() > 0) {
                                        sm.select(store.find('name',values.name));
                                    }
                                }
                            });
                        }
                    });
                    break;
            }
            
            el.up('window').down('grid').enable();
            el.up('window').down('form').disable();
        }
    },

    usrGrpSelect:function(el,recs){
        var win=el.up('window');
        if(recs[0].get('permits')){
            win.down('checkboxgroup').setValue({permits:recs[0].get('permits').split(', ')});
        }else{
            win.down('checkboxgroup').setValue({permits:[]});
        }
    }
});