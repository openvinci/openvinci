/**
 * Created by Michel Lopez H on 26/12/2015.
 */
Ext.define('APP.model.BankAccount', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'moneda', type: 'int'},
        {name: 'contabilidad', type: 'int'},
        {name: 'cuenta', type: 'string'},
        {name: 'banco_nombre', type: 'string'},
        {name: 'banco_cuenta', type: 'string'},
        {name: 'cheque_prefijo', type: 'string'},
        {name: 'cheque_numero', type: 'string'},
        {name: 'cheque_lugares', type: 'string'},
        {name: 'cheque_idioma', type: 'string'},
        {name: 'cheque_operado', type: 'string'},
        {name: 'cheque_revisado', type: 'string'},
        {name: 'cheque_autorizado', type: 'string'},
        {name: 'avisar_sobregiro', type: 'boolean'},
        {name: 'concil_tipo', type: 'string'},
        {name: 'concil_operado_nombre', type: 'string'},
        {name: 'concil_operado_cargo', type: 'string'},
        {name: 'concil_revisado_nombre', type: 'string'},
        {name: 'concil_revisado_cargo', type: 'string'},
        {name: 'concil_autorizado_nombre', type: 'string'},
        {name: 'concil_autorizado_cargo', type: 'string'},
        {name: 'accSignature', type: 'string',
            convert: function(value, record) {
                return record.get('banco_nombre')+' '+record.get('banco_cuenta');
            }
        }
    ],
    validations: [
        {type: 'inclusion', field: 'concil_tipo', list: ['LaB', 'BaL']},
    ],
    proxy: {
        type: 'rest',
        api: {
            create: 'data/bankaccount.php?action=create',
            read: 'data/bankaccount.php?action=read',
            update: 'data/bankaccount.php?action=update',
            destroy: 'data/bankaccount.php?action=destroy'
        },
        reader: {
            type: 'json',
            messageProperty: 'msg',
            successProperty: 'success',
            root: 'data'
        }
    }
});