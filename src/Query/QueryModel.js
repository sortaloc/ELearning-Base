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

exports.QueryModel = {
    profileSelect
}