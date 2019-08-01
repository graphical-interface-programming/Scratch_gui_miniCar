// eslint-disable-next-line camelcase
const DigiLed_ReceiveData = 'function SetDigiLed(dispArr)\n' +
    '\tsendCanMsg(11, dispArr)\t-- id, len, data{}\n' +
    'end\n\n';
export default DigiLed_ReceiveData;
