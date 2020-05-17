const profileSelect = (profileData) => {
    return `
    SELECT * from 
    profile 
    WHERE
    prl_nik LIKE '%${profileData.prl_nik}%'
    OR
    prl_nama LIKE '%${profileData.prl_nama}%'
    OR
    prl_nohp LIKE '%${profileData.prl_nohp}%'
    OR
    prl_username LIKE '%${profileData.prl_username}%'
    `
}

const kodeOtpSelect = (kode, number, today) => {
    console.log(kode, number, today)
    return `
    SELECT * FROM 
    public.otp_list 
    WHERE 
    otp_kode LIKE '%${kode}%' AND otp_nohp LIKE '%${number}%' AND otp_created_at LIKE '${today}%' AND otp_status = 0`
}

exports.module = {
    profileSelect,
    kodeOtpSelect
}