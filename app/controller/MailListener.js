/**
 * Created by Michel Lopez H on 12/12/2015.
 */
Ext.define('APP.controller.MailListener', {
    extend: 'Ext.app.Controller',
    models: [],
    stores: [],
    views: [],
    intervalID:{},//handler for listener function
    queue:[], //list of resources to download
    logfile:'', //file that logs activity

    init: function () {
        this.intervalID = window.setInterval(this.seeForMails, 12*60*1000);
        this.seeForMails();
    },

    seeForMails: function () {
        var me = APP.getApplication().getController("MailListener");
        Ext.Ajax.request({
            url: 'data/mailListener/index.php',
            scope:this,
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                me.queue=[];
                Ext.each(obj.data,function(v,i,a){
                    me.queue.push(v);
                });
                //console.log(me.queue);
                me.queueItem();
            }
        });
    },
    queueItem:function(opts, success, response){
        //process first line of queque
        var me = this;
        var item = me.queue.shift();
        if(item){
            if(!me.logfile)me.logfile = item.log;
            if(item.pge){ //process page
                Ext.Ajax.request({
                    url:'data/mailListener/process.php',
                    params:item,
                    scope:me,
                    callback:me.queueItem
                });
            }else
            if(item.pic){ //process picture
                Ext.Ajax.request({
                    url:'data/mailListener/getPic.php',
                    params:item,
                    scope:me,
                    callback: me.queueItem
                });
            }else
            if(item.res){ //process resource
                Ext.Ajax.request({
                    url:'data/mailListener/getRes.php',
                    params:item,
                    scope:me,
                    callback: me.queueItem
                });
            }
        }else
        if(me.logfile!=''){
            //all processed
            Ext.Ajax.request({
                url:'data/mailListener/packPics.php',
                scope:me,
                params:{log: me.logfile},
                callback:function(opts, success, response){
                    Ext.Ajax.request({
                        url:'data/mailListener/packRes.php',
                        scope:me,
                        params:{log: me.logfile},
                        callback:function(opts, success, response){
                            me.logfile='';
                            me.seeForMails();
                        }
                    });
                }
            });
        }
    }
});