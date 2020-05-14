// export namespace InterfaceTypes{
// }
export interface AccountType {
    acc_id: number,
    acc_nama: string,
    acc_tipe: string,
    acc_no_akun: number,
    acc_saldo: number,
    acc_created_at?: string,
    acc_updated_at?: string,
    acc_isactive: string
}

export interface ProfileType {
    prl_id: number,
    prl_nik: string,
    prl_nama: string,
    prl_group: string,
    prl_tempat_lahir: string,
    prl_nohp: string,
    prl_email: string,
    prl_alamat: string,
    prl_gender: string,
    prl_saldo: number,
    prl_username: string,
    prl_password: string,
    prl_gelar: string,
    prl_gelar_profesi: string,
    prl_created_at?: string,
    prl_updated_at?: string,
    prl_isactive: string,
    prl_profile_id: string
}

export interface AdminType {
    adm_id: number,
    adm_nama: string,
    adm_username: string,
    adm_email: string,
    adm_nohp: number,
    adm_password: string,
    adm_role: string,
    adm_created_at?: string,
    adm_updated_at?: string,
    adm_isactive: string;
}

export interface CashflowType {
    cf_id: string,
    cf_keterangan: string,
    cf_tipe: string,
    cf_id_kredit: string,
    cf_id_debet: string,
    cf_nominal: number,
    cf_refjurnal: string
}

export interface CodevoucherType {
    cvc_id: number,
    cvc_kode: string,
    cvc_id_kode: string,
    cvc_user: number,
    cvc_user_id: number,
    cvc_updated_at?: string
}

export interface ElearningType {
    elr_id: number,
    elr_nama_seminar: string,
    elr_jadwal_mulai: string,
    elr_jadwal_selesai: string,
    elr_kuota: number,
    elr_harga: number,
    elr_pemateri: string,
    elr_template: string,
    elr_created_at: string,
    elr_updated_at: string,
    elr_isactive: string
}

export interface EvoucherType {
    evc_id: number,
    evc_nama: string,
    evc_jenis: string,
    evc_value: number,
    evc_keterangan: string,
    evc_expired: string,
    evc_kuota: number,
    evc_created_at?: string,
    evc_updated_at?: string,
    evc_isactive: string
}

export interface InboxType {
    ibx_id: number,
    ibx_refid: string,
    ibx_group: string,
    ibx_id_profile: string,
    ibx_interface: string,
    ibx_tipe: string,
    ibx_status: string,
    ibx_format_msg: string,
    ibx_keterangan: string,
    ibx_created_at?: string,
    ibx_updated_at?: string,
    ibx_isactive: string
}

export interface OutboxType {
    obx_id: number,
    obx_refid: string,
    obx_group: string,
    obx_id_profile: string,
    obx_interface: string,
    obx_tipe: string,
    obx_status: string,
    obx_format_msg: string,
    obx_keterangan: string,
    obx_created_at?: string,
    obx_updated_at?: string,
    obx_isactive: string
}

export interface SettingType {
    st_id: number,
    st_keterangan: string,
    st_kode: string,
    st_value?: any,
    st_created_at?: string,
    st_updated_at?: string,
    st_isactive: string
}

export interface TransaksiType {
    trx_id: string,
    trx_keterangan: string,
    trx_tipe: string,
    trx_id_tipe: string,
    trx_saldo_before: number,
    trx_fee: number,
    trx_total_harga: number,
    trx_saldo_after: number,
    trx_status: string,
    trx_id_profile: string,
    trx_code_voucher: string,
    trx_invoice: string,
    trx_refid: string,
    trx_created_at?: string,
    trx_updated_at?: string
}

export interface OtpType {
    id: number,
    otp_nohp: string,
    otp_kode: number,
    otp_status: number,
    otp_created_at?: string
}