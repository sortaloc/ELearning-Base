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
    EvoucherType,
    OtpType
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
    TransaksiStructure,
    OtpStructure
} = require('./InterfaceStructure');
const Connection = require('@Connection/Postgre');
const { STRUCTURE } = require('@Config/Config');

class DatabaseController {
    public table: string;
    public tableList: Array<any>;
    public response: Object;
    public TableStructure: Object;
    public connection: any;
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
            transaksi: <TransaksiType> TransaksiStructure,
            otp_list: <OtpType> OtpStructure
        })
        this.TableStructure = TableStructure[table];
        this.connection = Connection;

        Connection.raw('select 1+1 as result')
        // .then(() => console.log('Connection Established'))
        .catch((err: Error) => {
            console.log('Connection Error to Database', err)
        })
    }

    private ValidateData = (list: any) => {
        return new Promise<Object>(async (resolve) => {
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
                        resolve(response.data);
                    } break;
                    case 'admin' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<AdminType> = list;
                            response.data = res;
                        }else{
                            let res: AdminType = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'cashflow' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<CashflowType> = list;
                            response.data = res;
                        }else{
                            let res: CashflowType = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'codevoucher' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<CodevoucherType> = list;
                            response.data = res;
                        }else{
                            let res: CodevoucherType = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'elearning' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<ElearningType> = list;
                            response.data = res;
                        }else{
                            let res: ElearningType = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'evoucher' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<EvoucherType> = list;
                            response.data = res;
                        }else{
                            let res: EvoucherType = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'inbox' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<InboxType> = list;
                            response.data = res;
                        }else{
                            let res: InboxType = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'outbox' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<OutboxType> = list;
                            response.data = res;
                        }else{
                            let res: OutboxType = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'profile' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<ProfileType> = list;
                            response.data = res;
                        }else{
                            let res: ProfileType = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'setting' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<SettingType> = list;
                            response.data = res;
                        }else{
                            let res: SettingType = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'transaksi' : {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<TransaksiType> = list;
                            response.data = res;
                        }else{
                            let res: TransaksiType = list;
                            response.data = res;
                        }
                        resolve(response.data);
                    } break;
                    case 'otp_list': {
                        if(Boolean(Array.isArray(list))){
                            let res: Array<OtpType> = list;
                            response.data = res;
                        }else{
                            let res: OtpType = list;
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

    private ValidateResult = (result: any) => {
        return new Promise<object>((resolve) => {
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

    public select = (fields: Array<string>) => {
        return new Promise<Object>(async (resolve) => {
            Connection(this.table)
            .select(fields)
            .then(this.ValidateData)
            .then(resolve)
        })
    }

    public selectField = (fields: Array<string>, where: any) => {
        return new Promise<Object>(async (resolve) => {
            Connection(this.table)
            .select(fields)
            .where(where)
            .then(this.ValidateData)
            .then(resolve)
        })
    }

    public selectFieldOne = (fields: Array<string>, where: any) => {
        return new Promise<Object>(async (resolve) => {
            Connection(this.table)
            .select(fields)
            .where(where)
            .first()
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
        return new Promise<Object>(async (resolve) => {
            Connection(this.table)
            .then(this.ValidateData)
            .then(resolve)
        })
    }

    public allSelect = (where: any) => {
        return new Promise<Object>(async (resolve) => {
            Connection(this.table)
            .where(where)
            .then(this.ValidateData)
            .then(resolve)
        })
    }

    public single = (where: any) => {
        return new Promise<Object>(async(resolve) => {
            Connection(this.table)
            .where(where)
            .first()
            .then(this.ValidateData)
            .then(resolve)
        })
    }

    public insertOne = (insert: any) => {
        return new Promise<object>(async (resolve) => {
            Connection(this.table)
            .insert(insert)
            .then(this.ValidateResult)
            .then(resolve)
        })
    }

    public custom = () => {
        return Connection;
    }
}
module.exports = DatabaseController;