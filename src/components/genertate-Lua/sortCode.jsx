import saveAs from './FileSaver.js';
import defaultCodes from './sources/seperate/default_codes.js';
import starter from './sources/seperate/starter.js';
// eslint-disable-next-line camelcase
import led_ReceiveData from './sources/seperate/Led_Receive.js';
import DigiLed_ReceiveData from './sources/seperate/DigiLed_Receive.js';
import DigiLedZXM_ReceiveData from './sources/seperate/DigiLedZXM_Receive.js';
import send_CanData from './sources/seperate/Send_CanData.js';
import judge_WhileOrBlack from './sources/seperate/Judge_WhiteOrBlack.js';
/**
 * @param data string 要写的数据
 * @param fileName string 文件名
 */
function fileWriter (data = {}, fileName = ' ') {
    const file = new File([data], {type: 'text/plain;charset=utf-8'});
    saveAs(file, fileName);
}

function getHats (data = {}) {
    if (data === {}) return;
    let hats = [];
    for (let id in data){
        if (data[id].topLevel === true) {
            hats.push(id);
        }
    }
    return hats;
}

function getIndent (depth) {
    let result = '';
    for (let i = 0; i < depth; i++) result = `${result}\t`;
    return result;
}

function handleControlForever (data, block, depth) {
    const indent = getIndent(depth);
    const result = indent + 'while(true){\n'+
        dealWithABlock(data, block.inputs.SUBSTACK.block, depth + 1) +
        indent + '}\n';
    return result;
}

function dealWithABlock (data = {}, blockID = '', depth = 0) {
    if (data === {} || blockID === '') return '';
    const indent = getIndent(depth);
    const opcode = data[blockID].opcode;
    switch (opcode) {
        // motions
        case 'motion_movesteps': break;
        case 'motion_turnright': break;
        case 'motion_turnleft': break;
        case 'motion_pointindirection': break;
        // events
        case 'event_whenflagclicked': break;
        case 'event_whengreaterthan': break;
        case 'event_whenbroadcastreceived': break;
        case 'event_broadcast': break;
        case 'event_broadcastandwait': break;
        // control
        case 'control_wait': break;
        case 'control_repeat': break;
        case 'control_forever': break;
        case 'control_if_else': break;
        case 'control_if': break;
        case 'control_repeat_until': break;
        case 'control_stop': break;
        // sensing
        case '': break;
        // operate
        case 'operator_add': break;
        case 'operator_subtract': break;
        case 'operator_multiply': break;
        case 'operator_divide': break;
        case 'operator_random': break;
        case 'operator_gt': break;
        case 'operator_lt': break;
        case 'operator_equals': break;
        case 'operator_and': break;
        case 'operator_or': break;
        case 'operator_not': break;
        case 'operator_length': break;
        case 'operator_mod': break;
        case 'operator_round': break;
        case 'operator_mathop': break;
        case '': break;
    }
}

function dealWithAHat (data = {}, hatID = '') {
    if (data === {} || hatID === '') return '';
    let next = hatID;
    let result = '';
    while (next !== null){
        result = result + dealWithABlock(data, next, 0);
    }
    return `${result}\n`;
}

const getCode = function (data = {}) {
    if (data === {}) return;
    const hats = getHats(data);
    let result = [defaultCodes];
    for (let id in hats){
        result.push(dealWithAHat(data, id));
    }
    result.push(starter);
    // let result = JSON.stringify(data);
    // fileWriter(result, 'data.txt');
};
export {getCode};
