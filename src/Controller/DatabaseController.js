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
    // TableStructure;
    connection;
    constructor(table){
        this.table = table;
        this.response = STRUCTURE;
        // const TableStructure = new Object({
        //     account: AccountStructure,
        //     admin: AdminStructure,
        //     cashflow: CashflowStructure,
        //     codevoucher: CodevoucherStructure,
        //     elearning: ElearningStructure,
        //     evoucher: EvoucherStructure,
        //     inbox: InboxStructure,
        //     outbox: OutboxStructure,
        //     profile: ProfileStructure,
        //     setting: SettingStructure,
        //     transaksi: TransaksiStructure,
        //     otp_list: OtpStructure
        // })
        // this.TableStructure = TableStructure[table];
        this.connection = Connection;

        Connection.raw('select 1+1 as result')
        // .then(() => console.log('Connection Established'))
        .catch((err) => {
            console.log('Connection Error to Database', err)
        })
    }

    ValidateData = (list) => {
        return new Promise(async (resolve) => {
            var response = this.response;
            try{
                if(Boolean(Array.isArray(list))){
                    let res = list;
                    response.data = res;
                }else{
                    let res = list;
                    response.data = res;
                }
                resolve(response.data);
            }catch(err){
                response.data = [];
                resolve(response.data)

            }
        })
    }

    ValidateResult = (result) => {
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

    ValidateUpdate = (result) => {
        return new Promise(resolve => {
            try{
                if(Number(result) > 0){
                    return resolve({state: true, message: `Success Update`});
                }
                throw err
            }catch(err){
                return resolve({state: false, message: `Failed to Update`});
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

    updateOne = (where, update) => {
        return new Promise(async (resolve) => {
            Connection(this.table)
            .where(where)
            .update(update)
            .then(this.ValidateUpdate)
            .then(resolve);
        })
    }
}
module.exports = DatabaseController;