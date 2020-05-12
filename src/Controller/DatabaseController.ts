const Connection = require('@Connection/Postgre');
const { STRUCTURE } = require('@Config/Config');

import {
    AccountType, 
    AdminType, 
    CashflowType, 
    CodevoucherType, 
    ElearningType, 
    InboxType, 
    OutboxType, 
    ProfileType,
    SettingType,
    TransaksiType,
    EvoucherType
} from './InterfaceTypes';
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
    TransaksiStructure
} = require('./InterfaceStructure');

class DatabaseController {
    public table: string;
    public tableList: Array<any>;
    public response: Object;
    public TableStructure: Object;
    public TableInterface: Array<any>;
    constructor(table: string){
        this.table = table;
        this.response = STRUCTURE;
        const TableStructure = new Object({
            account: <AccountType> AccountStructure,
            admin: <AdminType> AdminStructure,
            cashflow: <CashflowType> CashflowStructure,
            codevoucher: <CodevoucherType> CodevoucherStructure,
            elearning: <ElearningType> ElearningStructure,
            evoucher: <EvoucherType> EvoucherStructure,
            inbox: <InboxType> InboxStructure,
            outbox: <OutboxType> OutboxStructure,
            profile: <ProfileType> ProfileStructure,
            setting: <SettingType> SettingStructure,
            transaksi: <TransaksiType> TransaksiStructure
        })
        this.TableStructure = TableStructure[table];
    }

    public ValidateData = (list: any) => {
        return new Promise<Object>(async (resolve, reject) => {
            var response: any = this.response;
            try{
                switch(this.table){
                    case 'account': {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<AccountType> = list;
                            response.data = res;
                        }else{
                            let res: AccountType = list;
                            response.data = res;
                        }
                        response.state = true;
                        response.message = `Success get data from Table : ${this.table}`;
                        resolve(response);
                    } break;
                    case 'admin' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<AdminType> = list;
                            response.data = res;
                        }else{
                            let res: AdminType = list;
                            response.data = res;
                        }
                        response.state = true;
                        response.message = `Success get data from Table : ${this.table}`;
                        resolve(response);
                    } break;
                    case 'cashflow' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<CashflowType> = list;
                            response.data = res;
                        }else{
                            let res: CashflowType = list;
                            response.data = res;
                        }
                        response.state = true;
                        response.message = `Success get data from Table : ${this.table}`;
                        resolve(response);
                    } break;
                    case 'codevoucher' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<CodevoucherType> = list;
                            response.data = res;
                        }else{
                            let res: CodevoucherType = list;
                            response.data = res;
                        }
                        response.state = true;
                        response.message = `Success get data from Table : ${this.table}`;
                        resolve(response);
                    } break;
                    case 'elearning' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<ElearningType> = list;
                            response.data = res;
                        }else{
                            let res: ElearningType = list;
                            response.data = res;
                        }
                        response.state = true;
                        response.message = `Success get data from Table : ${this.table}`;
                        resolve(response);
                    } break;
                    case 'evoucher' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<EvoucherType> = list;
                            response.data = res;
                        }else{
                            let res: EvoucherType = list;
                            response.data = res;
                        }
                        response.state = true;
                        response.message = `Success get data from Table : ${this.table}`;
                        resolve(response);
                    } break;
                    case 'inbox' : {
                        // let response: Array<InboxType> = list;
                        if(Boolean(Array.isArray(list))){
                            let res: Array<InboxType> = list;
                            response.data = res;
                        }else{
                            let res: InboxType = list;
                            response.data = res;
                        }
                        response.state = true;
                        response.message = `Success get data from Table : ${this.table}`;
                        resolve(response);
                    } break;
                    case 'outbox' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<OutboxType> = list;
                            response.data = res;
                        }else{
                            let res: OutboxType = list;
                            response.data = res;
                        }
                        response.state = true;
                        response.message = `Success get data from Table : ${this.table}`;
                        resolve(response);
                    } break;
                    case 'profile' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<ProfileType> = list;
                            response.data = res;
                        }else{
                            let res: ProfileType = list;
                            response.data = res;
                        }
                        response.state = true;
                        response.message = `Success get data from Table : ${this.table}`;
                        resolve(response);
                    } break;
                    case 'setting' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<SettingType> = list;
                            response.data = res;
                        }else{
                            let res: SettingType = list;
                            response.data = res;
                        }
                        response.state = true;
                        response.message = `Success get data from Table : ${this.table}`;
                        resolve(response);
                    } break;
                    case 'transaksi' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<TransaksiType> = list;
                            response.data = res;
                        }else{
                            let res: TransaksiType = list;
                            response.data = res;
                        }
                        response.state = true;
                        response.message = `Success get data from Table : ${this.table}`;
                        resolve(response);
                    } break;
                }
            }catch(err){
                console.log('Error', err);
                response.code = 102;
                response.message = 'Something Error on Parsing data from Database'
                resolve(response)

            }
        })
    }

    public select = (fields: Array<string>) => {
        return new Promise<Object>(async (resolve) => {
            Connection(this.table)
            .select(fields)
            .then(this.ValidateData)
            .then(resolve)
        })
    }

    public selectOne = (fields: Array<string>) => {
        return new Promise<Object>(async (resolve) => {
            Connection(this.table)
            .select(fields)
            .first()
            .then(this.ValidateData)
            .then(resolve)
        })
    }

    public all = () => {
        return new Promise<object>(async (resolve) => {
            Connection(this.table)
            .then(this.ValidateData)
            .then(resolve)
        })
    }

    public single = (field: string, value: string | number) => {
        return new Promise<object>(async(resolve) => {
            Connection(this.table).where({[field]: value}).first()
            .then(this.ValidateData)
            .then(resolve)
        })
    }

    public insertOne = () => {
        return new Promise<object>(async (resolve) => {

        })
    }
}

module.exports = DatabaseController