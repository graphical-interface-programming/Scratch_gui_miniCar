// eslint-disable-next-line camelcase
const led_ReceiveData = 'function SetLedArr(dispArr)\n' +
    '\tsendCanMsg(12, dispArr)\t-- id, len, data{}\n' +
    'end\n\n';

// eslint-disable-next-line camelcase
export default led_ReceiveData;
