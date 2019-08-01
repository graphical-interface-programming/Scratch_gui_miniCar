// eslint-disable-next-line camelcase
const DigiLedZXM_ReceiveData = 'function SetDigiLedZXM(dispArr)\n' +
    '\tsendCanMsg(13, dispArr)\t-- id, len, data{}\n' +
    'end\n\n';

export default DigiLedZXM_ReceiveData;
