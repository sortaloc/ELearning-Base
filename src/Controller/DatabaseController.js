// import {
//     AccountType, 
//     AdminType, 
//     CashflowType, 
//     CodevoucherType, 
//     ElearningType, 
//     InboxType, 
//     OutboxType, 
//     ProfileType,
//     SettingType,
//     TransaksiType,
//     EvoucherType,
//     OtpType
// } from './InterfaceTypes';
let {
    AccountStructure,
    AdminStructure,
    CashflowStructure,
    CodevoucherStructure,
    ElearningStructure,
    EvoucherStructure,
    InboxStructure,
    OutboxStructure,
    ProfileStructure,
    SettingStructure,
    TransaksiStructure,
    OtpStructure
} = require('./InterfaceStructure');
const Connection = require('@Connection/Postgre');
const { STRUCTURE } = require('@Config/Config');

class DatabaseController {
    table;
    tableList;
    response;
    TableStructure;
    connection;
    constructor(table){
        this.table = table;
        this.response = STRUCTURE;
        const TableStructure = new Object({
            account: AccountStructure,
            admin: AdminStructure,
            cashflow: CashflowStructure,
            codevoucher: CodevoucherStructure,
            elearning: ElearningStructure,
            evoucher: EvoucherStructure,
            inbox: InboxStructure,
            outbox: OutboxStructure,
            profile: ProfileStructure,
            setting: SettingStructure,
            transaksi: TransaksiStructure,
            otp_list: OtpStructure
        })
        this.TableStructure = TableStructure[table];
        this.connection = Connection;

        Connection.raw('select 1+1 as result')
        // .then(() => console.log('Connection Established'))
        .catch((err) => {
            console.log('Connection Error to Database', err)
        })
    }

    static ValidateData = (list) => {
        return new Promise(async (resolve) => {
            var response = this.response;
            try{
                switch(this.table){
                    case 'account': {
                        if(Boolean(Array.isArray(list))){
                            let res = list;
                            response.data = res;
                        }else{
                            let res = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'admin' : {
                        if(Boolean(Array.isArray(list))){
                            let res = list;
                            response.data = res;
                        }else{
                            let res = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'cashflow' : {
                        if(Boolean(Array.isArray(list))){
                            let res = list;
                            response.data = res;
                        }else{
                            let res = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'codevoucher' : {
                        if(Boolean(Array.isArray(list))){
                            let res = list;
                            response.data = res;
                        }else{
                            let res = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'elearning' : {
                        if(Boolean(Array.isArray(list))){
                            let res = list;
                            response.data = res;
                        }else{
                            let res = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'evoucher' : {
                        if(Boolean(Array.isArray(list))){
                            let res = list;
                            response.data = res;
                        }else{
                            let res = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'inbox' : {
                        if(Boolean(Array.isArray(list))){
                            let res = list;
                            response.data = res;
                        }else{
                            let res = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'outbox' : {
                        if(Boolean(Array.isArray(list))){
                            let res = list;
                            response.data = res;
                        }else{
                            let res = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'profile' : {
                        if(Boolean(Array.isArray(list))){
                            let res = list;
                            response.data = res;
                        }else{
                            let res = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'setting' : {
                        if(Boolean(Array.isArray(list))){
                            let res = list;
                            response.data = res;
                        }else{
                            let res = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'transaksi' : {
                        if(Boolean(Array.isArray(list))){
                            let res = list;
                            response.data = res;
                        }else{
                            let res = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'otp_list': {
                        if(Boolean(Array.isArray(list))){
                            let res = list;
                            response.data = res;
                        }else{
                            let res = list;
                            response.data = res;
                        }
                    } break;
                }
            }catch(err){
                response.data = [];
                resolve(response.data)

            }
        })
    }

    static ValidateResult = (result) => {
        return new Promise((resolve) => {
            try{
                if(result.command === 'INSERT'){
                    if(result.rowCount === 0){
                        throw Error;
                    }
                    resolve({state: true, message: `Success ${result.command} to ${this.table}`});
                }else if(result.command === 'UPDATE'){

                }
            }catch(err){
                resolve({
                    state: false,
                    message: `Failed to ${result.command} on Table ${this.table}`
                })
            }
        })
    }

    select = (fields) => {
        return new Promise(async (resolve) => {
            Connection(this.table)
            .select(fields)
            .then(this.ValidateData)
            .then(resolve)
        })
    }

    selectField = (fields, where) => {
        return new Promise(async (resolve) => {
            Connection(this.table)
            .select(fields)
            .where(where)
            .then(this.ValidateData)
            .then(resolve)
        })
    }

    selectFieldOne = (fields, where) => {
        return new Promise(async (resolve) => {
            Connection(this.table)
            .select(fields)
            .where(where)
            .first()
            .then(this.ValidateData)
            .then(resolve)
        })
    }

    selectOne = (fields) => {
        return new Promise(async (resolve) => {
            Connection(this.table)
            .select(fields)
            .first()
            .then(this.ValidateData)
            .then(resolve)
        })
    }

    all = () => {
        return new Promise(async (resolve) => {
            Connection(this.table)
            .then(this.ValidateData)
            .then(resolve)
        })
    }

    allSelect = (where) => {
        return new Promise(async (resolve) => {
            Connection(this.table)
            .where(where)
            .then(this.ValidateData)
            .then(resolve)
        })
    }

    single = (where) => {
        return new Promise(async(resolve) => {
            Connection(this.table)
            .where(where)
            .first()
            .then(this.ValidateData)
            .then(resolve)
        })
    }

    insertOne = (insert) => {
        return new Promise(async (resolve) => {
            Connection(this.table)
            .insert(insert)
            .then(this.ValidateResult)
            .then(resolve)
        })
    }

    updateOne = (whre, update) => {
        return new Promise(async (resolve) => {
            
        })
    }
}
module.exports = DatabaseController;