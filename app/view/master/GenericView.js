/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
Ext.define('APP.view.master.GenericView', {
    extend: 'Ext.window.Window',
    alias: 'widget.genericMaster',
    glyph:77,
    title: 'Generic view',
    layout: 'fit',
    autoShow: true,
    modal:true,
    resizable:false,
    width:500,
    constrainHeader:true,

    initComponent: function() {
            

            this.callParent(arguments);
    }
});

