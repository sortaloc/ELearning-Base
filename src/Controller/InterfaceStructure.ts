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

const AccountStructure: AccountType = {
    acc_id: 0,
    acc_nama: "",
    acc_tipe: "",
    acc_no_akun: 0,
    acc_saldo: 0,
    acc_created_at: "",
    acc_updated_at: "",
    acc_isactive: ""
}

const ProfileStructure: ProfileType = {
    prl_id: 0,
    prl_nik: "",
    prl_nama: "",
    prl_group: "",
    prl_tempat_lahir: "",
    prl_nohp: "",
    prl_email: "",
    prl_alamat: "",
    prl_gender: "",
    prl_saldo: 0,
    prl_username: "",
    prl_password: "",
    prl_gelar: "",
    prl_gelar_profesi: "",
    prl_created_at: "",
    prl_updated_at: "",
    prl_isactive: "",
    prl_profile_id: ""
}

const AdminStructure: AdminType = {
    adm_id: 0,
    adm_nama: "",
    adm_username: "",
    adm_email: "",
    adm_nohp: 0,
    adm_password: "",
    adm_role: "",
    adm_created_at: "",
    adm_updated_at: "",
    adm_isactive: ""
}

const CashflowStructure: CashflowType = {
    cf_id: "",
    cf_keterangan: "",
    cf_tipe: "",
    cf_id_kredit: "",
    cf_id_debet: "",
    cf_nominal: 0,
    cf_refjurnal: ""
}

const CodevoucherStructure: CodevoucherType = {
    cvc_id: 0,
    cvc_kode: "",
    cvc_id_kode: "",
    cvc_user: 0,
    cvc_user_id: 0,
    cvc_updated_at: ""
}

const ElearningStructure: ElearningType = {
    elr_id: 0,
    elr_nama_seminar: "",
    elr_jadwal_mulai: "",
    elr_jadwal_selesai: "",
    elr_kuota: 0,
    elr_harga: 0,
    elr_pemateri: "",
    elr_template: "",
    elr_created_at: "",
    elr_updated_at: "",
    elr_isactive: ""
}

const EvoucherStructure: EvoucherType = {
    evc_id: 0,
    evc_nama: "",
    evc_jenis: "",
    evc_value: 0,
    evc_keterangan: "",
    evc_expired: "",
    evc_kuota: 0,
    evc_created_at: "",
    evc_updated_at: "",
    evc_isactive: ""
}

const InboxStructure: InboxType = {
    ibx_id: 0,
    ibx_refid: "",
    ibx_group: "",
    ibx_id_profile: "",
    ibx_interface: "",
    ibx_tipe: "",
    ibx_status: "",
    ibx_format_msg: "",
    ibx_keterangan: "",
    ibx_created_at: "",
    ibx_updated_at: "",
    ibx_isactive: ""
}

const OutboxStructure: OutboxType = {
    obx_id: 0,
    obx_refid: "",
    obx_group: "",
    obx_id_profile: "",
    obx_interface: "",
    obx_tipe: "",
    obx_status: "",
    obx_format_msg: "",
    obx_keterangan: "",
    obx_created_at: "",
    obx_updated_at: "",
    obx_isactive: ""
}



const SettingStructure: SettingType = {
    st_id: 0,
    st_keterangan: "",
    st_kode: "",
    st_value: "",
    st_created_at: "",
    st_updated_at: "",
    st_isactive: ""
}

const TransaksiStructure: TransaksiType = {
    trx_id: "",
    trx_keterangan: "",
    trx_tipe: "",
    trx_id_tipe: "",
    trx_saldo_before: 0,
    trx_fee: 0,
    trx_total_harga: 0,
    trx_saldo_after: 0,
    trx_status: "",
    trx_id_profile: "",
    trx_code_voucher: "",
    trx_invoice: "",
    trx_refid: "",
    trx_created_at: "",
    trx_updated_at: ""
}

const OtpStructure: OtpType = {
    id: 0,
    otp_nohp: "",
    otp_kode: 0,
    otp_status: 0,
    otp_created_at: ""
}

module.exports = {
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
}