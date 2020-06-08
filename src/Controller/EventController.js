const { STRUCTURE } = require('@Config/Config');
const database = require('@Model/index');
const MainController = require('@Controllers/MainController');

class EventController extends MainController {
	structure;
	constructor(){
		super();
		this.structure = STRUCTURE;
	}

	checkingEvent = (type, date) => {
		return new Promise(async resolve => {
			let newDate;
			if(date){
				date = MainController.createDate(0);
			}
			newDate = this.convertDate(date);
			let data = await database.event.connection.raw(`SELECT * FROM event WHERE event_type = '${type}' AND '${newDate}' BETWEEN event_startdate AND event_enddate AND event_isactive = 1 LIMIT 1`)
			if(data.rows.length > 0){
				return {
					state: true,
					data: data.rows[0]
				}
			}else{
				return {
					state: false,
					data: {}
				}
			}
		})
	}

	createEventInbox = (profile_id, eventid, eventkode, value, namaEvent) => {
		return new Promise(async resolve => {
			let refid = `EVENT${this.generateID()}`;
			let akun = await database.profile.single({prl_profile_id: profile_id});

	        let format_msg = `EVENT_REDEEM.${eventkode}.${eventid}.${value}.${akun.prl_profile_id}.${refid}`;
	        const insertInbox = {
	            ibx_refid: refid,
	            ibx_id_profile: akun.prl_profile_id,
	            ibx_interface: 'H',
	            ibx_tipe: 'EVENTREDEEM',
	            ibx_status: 'Q',
	            ibx_format_msg: format_msg,
	            ibx_keterangan: `Berhasil input ke inbox pada ${this.createDate(0)}`,
	            ibx_raw_data: JSON.stringify({profile_id, eventid, eventkode, value, namaEvent})
	        }
        	let harga = Number(value);
	        let trxID = this.generateID();
	        let trxINV = this.createInvoice('EVENT');
	        let transaksiData = {
	            trx_id: trxID,
	            trx_keterangan: 'Transaksi sedang dalam proses',
	            trx_tipe: 'EVENT',
	            trx_id_tipe: 'EVENTREDEEM',
	            trx_harga: harga,
	            trx_fee: 0,
	            trx_total_harga: harga,
	            trx_saldo_before: Number(akun.prl_saldo),
	            trx_saldo_after: 0,
	            trx_status: 'Q',
	            trx_id_profile: akun.prl_profile_id,
	            trx_code_voucher: '',
	            trx_invoice: trxINV,
	            trx_refid: refid,
	            trx_produk_id: eventid,
	            trx_judul: namaEvent
	        }
	        let transaksi = await database.transaksi.insert(transaksiData);
	        let inbox = await database.inbox.insertOne(insertInbox);

	        resolve({
	        	transaksi: transaksi,
	        	inbox: inbox
	        })
		})



	}
}

module.exports = new EventController;