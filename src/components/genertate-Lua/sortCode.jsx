import saveAs from './FileSaver.js';
import defaultCodes from './sources/seperate/default_codes.js';
import starter from './sources/seperate/starter.js';

/**
 * 写文件
 * @param {string} data 要写的数据
 * @param {string} fileName 文件名
 */
function fileWriter (data = '', fileName = ' ') {
    const file = new File([data], {type: 'text/plain;charset=utf-8'});
    saveAs(file, fileName);
}

/**
 * 获得blocks链首
 * @param {JSON} data blocks输入的Json对象
 * @return {Array} 链表队首block
 */
function getHats (data = {}) {
    if (data === {}) return [];
    let hats = [];
    for (let id in data){
        if (data[id].topLevel === true) {
            hats.push(id);
        }
    }
    return hats;
}

/**
 * 获取缩进
 * @param {number} depth 缩进深度
 * @return {string} 缩进字符串
 */
function getIndent (depth) {
    let result = '';
    for (let i = 0; i < depth; i++) result = `${result}\t`;
    return result;
}

/**
 * 处理输入不全的情况
 * @param {JSON} data 输入数据的Json对象
 * @param {JSON} blockPart 下一个要处理的block的Json对象域
 * @param {number} depth 缩进深度
 * @param {function} func 生成代码的方法
 * @return {string} 下一部分lua代码
 */
function nextCode (data, blockPart, depth, func) {
    return (blockPart == null) ? (getIndent(depth) + 'missing block' + func()) : func(data, blockPart.block, depth);
}

// 以下方法都是按block种类生成对应lua代码
/**
 * @param {JSON} data 输入数据的Json对象
 * @param {JSON} block 要处理block的Json对象
 * @param {number} depth 缩进深度
 * @return {string} 相应的lua代码
 */
function handleControlForever (data, block, depth) {
    const indent = getIndent(depth);
    const result = indent + 'while(true)\n' +
        indent + 'do\n' +
        nextCode(data, block.inputs.SUBSTACK, depth + 1, dealWithAHat) +
        indent + 'end\n';
    return result;
}

function handleControlIf (data, block, depth) {
    const indent = getIndent(depth);
    // maybe should change it with function 'dealWithCondition'
    const result = indent + 'if ' + nextCode(data, block.inputs.CONDITION, 0, dealWithABlock) + ' then\n'+
        nextCode(data, block.inputs.SUBSTACK, depth + 1, dealWithAHat) +
        indent + 'end\n';
    return result;
}

function handleControlIfElse (data, block, depth) {
    const indent = getIndent(depth);
    // maybe should change it with function 'dealWithCondition'
    const result = indent + 'if ' + nextCode(data, block.inputs.CONDITION, 0, dealWithABlock) + ' then\n'+
        nextCode(data, block.inputs.SUBSTACK, depth + 1, dealWithAHat) +
        indent + 'else\n' +
        nextCode(data, block.inputs.SUBSTACK2, depth + 1, dealWithAHat) +
        indent + 'end\n';
    return result;
}

function handControlReapeatUntil (data, block, depth) {
    const indent = getIndent(depth);
    const result = indent + 'repeat\n' +
        nextCode(data, block.inputs.SUBSTACK, depth + 1, dealWithAHat) +
        indent + 'until ' + nextCode(data, block.inputs.CONDITION, 0, dealWithABlock) + '\n';
    return result;
}

// 统一处理四则运算
// opcodes 为运算操作符(String)
function handNumOperation (data, block, depth, opcodes) {
    const indent = getIndent(depth);
    const result = indent + '( ' + nextCode(data, block.inputs.NUM1, 0, dealWithABlock) +
        ' ' + opcodes + ' ' +
        nextCode(data, block.inputs.NUM2, 0, dealWithABlock) + ' )';
    return result;
}

// 统一处理布尔值判断（取反除外）
function handBooleanOperation (data, block, depth, opcodes) {
    const indent = getIndent(depth);
    const result = indent + '( ' + nextCode(data, block.inputs.OPERAND1, 0, dealWithABlock) +
        ' ' + opcodes + ' ' +
        nextCode(data, block.inputs.OPERAND2, 0, dealWithABlock) + ' )';
    return result;
}

// 处理布尔取反
function handOperatiorNot (data, block, depth) {
    const indent = getIndent(depth);
    return indent + '( not' + nextCode(data, block.inputs.OPERAND, 0, dealWithABlock) + ' )';
}

// 获取input中的数字
function handNumbers (block) {
    return (block.fields.NUM == null) ? '' : block.fields.NUM.value;
}

// 获取text中的字符
function handTexts (block) {
    return (block.fields.TEXT == null) ? '' : block.fields.TEXT.value;
}

// 判断block种类，调用相应的函数
function dealWithABlock (data = {}, blockID = '', depth = 0) {
    if (data === {} || blockID === '') return '';
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
        case 'control_forever': return handleControlForever(data, data[blockID], depth);
        case 'control_if': return handleControlIf(data, data[blockID], depth);
        case 'control_if_else': return handleControlIfElse(data, data[blockID], depth);
        case 'control_repeat_until': return handControlReapeatUntil(data, data[blockID], depth);
        case 'control_stop': break;
        // sensing
        case '': break;
        // operate
        case 'operator_add': return handNumOperation(data, data[blockID], depth, '+');
        case 'operator_subtract': return handNumOperation(data, data[blockID], depth, '-');
        case 'operator_multiply': return handNumOperation(data, data[blockID], depth, '*');
        case 'operator_divide': return handNumOperation(data, data[blockID], depth, '/');
        case 'operator_random': break;
        case 'operator_gt': return handBooleanOperation(data, data[blockID], depth, '>');
        case 'operator_lt': return handBooleanOperation(data, data[blockID], depth, '<');
        case 'operator_equals': return handBooleanOperation(data, data[blockID], depth, '==');
        case 'operator_and': return handBooleanOperation(data, data[blockID], depth, 'and');
        case 'operator_or': return handBooleanOperation(data, data[blockID], depth, 'or');
        case 'operator_not': return handOperatiorNot(data, data[blockID], depth, 'not');
        case 'operator_length': break;
        case 'operator_mod': return handNumOperation(data, data[blockID], depth, '%');
        case 'operator_round': break;
        case 'operator_mathop': break;
        // others
        case 'math_number': return handNumbers(data[blockID]);
        case 'text': return handTexts(data[blockID]);
        default: return '';
    }
}

/**
 * 生成一个blocks链对应的lua代码
 * @param data {JSON} 输入blocks的JSON对象
 * @param hatID {String} 队首block的id
 * @param depth {number} 代码深度
 * @return {string} 队列对应的lua代码
 */
function dealWithAHat (data = {}, hatID = '', depth = 0) {
    if (data === {} || hatID === '') return '\n';
    let next = hatID;
    let result = '';
    while (next !== null){
        result = result + dealWithABlock(data, next, depth);
        next = data[next].next;
    }
    return result;
}

/**
 * 获取lua代码根函数
 * @param data {JSON} 输入blocks的JSON对象
 */
const getCode = function (data = {}) {
    if (data === {}) return;
    const hats = getHats(data);
    let result = [defaultCodes];
    for (let id in hats){
        result.push(dealWithAHat(data, hats[id]));
    }
    result.push(starter);
    const result2 = JSON.stringify(data);
    fileWriter(result2, 'data.txt');
    fileWriter(result.join('\n'), 'luaCode.lua');
};
export {getCode};
