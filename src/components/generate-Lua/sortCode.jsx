import saveAs from './FileSaver.js';
import defaultCodes from './sources/seperate/default_codes.js';

/**
 * @author LASTiMP
 */
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
 * 若添加了新的基础输入快，需要添加进hat黑名单
 * @param {JSON} data blocks输入的Json对象
 * @return {Array} 链表队首block
 */
function getHats (data = {}) {
    if (data === {}) return [];
    let hats = [];
    for (let id in data){
        if (data[id].topLevel === true &&
            data[id].opcode != 'math_positive_number' &&
            data[id].opcode != 'math_whole_number' &&
            data[id].opcode != 'math_number' &&
            data[id].opcode != 'math_integer' &&
            data[id].opcode != 'text') {
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

function handleInit (data, block) {
    return nextCode(data, block.next, 0, dealWithAHat);
}

function handleWait (data, block, depth) {
    const indent = getIndent(depth);
    return indent + 'delay_ms(' + nextCode(data, block.inputs.DURATION, 0, dealWithABlock) + ')\n';
}

function handleRepeat (data, block, depth){
    const indent = getIndent(depth);
    const result = indent + 'for( LASTIMP = 1, ' + nextCode(data, block.inputs.TIMES, 0, dealWithABlock) + ', 1) do\n' +
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
    const result = indent + 'if ' + nextCode(data, block.inputs.CONDITION, 0, dealWithABlock) + ' then\n'+
        nextCode(data, block.inputs.SUBSTACK, depth + 1, dealWithAHat) +
        indent + 'else\n' +
        nextCode(data, block.inputs.SUBSTACK2, depth + 1, dealWithAHat) +
        indent + 'end\n';
    return result;
}

function handleControlReapeatUntil (data, block, depth) {
    const indent = getIndent(depth);
    const result = indent + 'repeat\n' +
        nextCode(data, block.inputs.SUBSTACK, depth + 1, dealWithAHat) +
        indent + 'until ' + nextCode(data, block.inputs.CONDITION, 0, dealWithABlock) + '\n';
    return result;
}

function handleControlForLoop (data, block, depth) {
    const indent = getIndent(depth);
    const result = indent + 'for ' + block.fields.VARIABLE.value +
        '=' + nextCode(data, block.inputs.NUM, 0, dealWithABlock) +
        ', ' + nextCode(data, block.inputs.NUM1, 0, dealWithABlock) +
        ', ' + nextCode(data, block.inputs.NUM2, 0, dealWithABlock) + ' do\n' +
        nextCode(data, block.inputs.SUBSTACK, depth + 1, dealWithAHat) +
        indent + 'end\n';
    return result;
}

function handleTimer () {
    return 'HAL_GetTick()';
}

// 统一处理四则运算
// opcodes 为运算操作符(String)
function handleNumOperation (data, block, depth, opcodes) {
    const indent = getIndent(depth);
    const result = indent + '( ' + nextCode(data, block.inputs.NUM1, 0, dealWithABlock) +
        ' ' + opcodes + ' ' +
        nextCode(data, block.inputs.NUM2, 0, dealWithABlock) + ' )';
    return result;
}

// 统一处理布尔值判断（取反除外）
function handleBooleanOperation (data, block, depth, opcodes) {
    const indent = getIndent(depth);
    const result = indent + '( ' + nextCode(data, block.inputs.OPERAND1, 0, dealWithABlock) +
        ' ' + opcodes + ' ' +
        nextCode(data, block.inputs.OPERAND2, 0, dealWithABlock) + ' )';
    return result;
}

// 处理布尔取反
function handleOperatiorNot (data, block, depth) {
    const indent = getIndent(depth);
    return indent + '( not' + nextCode(data, block.inputs.OPERAND, 0, dealWithABlock) + ' )';
}

// 处理设置变量
function handleSetVariable (data, block, depth) {
    const indent = getIndent(depth);
    const result = indent + block.fields.VARIABLE.value + ' = '+
        nextCode(data, block.inputs.VALUE, 0, dealWithABlock) + '\n';
    return result;
}

// 处理修改变量
function handleChangeVariable (data, block, depth) {
    const indent = getIndent(depth);
    const variable = block.fields.VARIABLE.value;
    const result = indent + variable + ' = ' + variable + ' + ' +
        nextCode(data, block.inputs.VALUE, 0, dealWithABlock) + '\n';
    return result;
}

function handleGetVariable (data, block, depth) {
    return getIndent(depth) + block.fields.VARIABLE.value;
}

function handleGetList (data, block, depth) {
    return getIndent(depth) + block.fields.LIST.value;
}

function handleReplaceItemOfList (data, block, depth) {
    const index = nextCode(data, block.inputs.INDEX, 0, dealWithABlock);
    return getIndent(depth) + block.fields.LIST.value +
        ((index == 'all')? '' : '[' + index + ']') +
        ' = ' + ((index == 'all')? '{' : '') + nextCode(data, block.inputs.ITEM, 0, dealWithABlock) + ((index == 'all')? '}' : '') + '\n';
}

function handleItemOfList (data, block, depth) {
    return getIndent(depth) + block.fields.LIST.value + '[' + nextCode(data, block.inputs.INDEX, 0, dealWithABlock) + ']';
}

function handleDeleteAllOfList (data, block, depth) {
    return getIndent(depth) + block.fields.LIST.value + ' = {}\n';
}

function handleGetData (data, block, depth) {
    const indent = getIndent(depth);
    let sensorId;
    switch (block.fields.SENSORTYPE.value) {
        case 'Infrared': sensorId = '15'; break;
        default: sensorId = 'undefind sensor'; break;
    }
    const result = indent + 'sendCanMsg(' + sensorId + ')';
    return result;
}

function handleTransferData (data, block, depth) {
    const indent = getIndent(depth);
    let sensorId;
    switch (block.fields.SENSORTYPE.value) {
        case 'led': sensorId = '12'; break;
        case 'digi': sensorId = '11'; break;
        case 'zxm digi': sensorId = '13'; break;
        case 'Wheel': sensorId = '18'; break;
        default: sensorId = 'undefind sensor'; break;
    }
    return indent + 'sendCanMsg(' + sensorId + ', ' + nextCode(data, block.inputs.NUM1, 0, dealWithABlock) + ')\n';
}

function handleForIter (data, block, depth) {
    const indent = getIndent(depth);
    const list = block.fields.LIST.value;
    const result = indent + 'for ' + nextCode(data, block.inputs.VALUE, 0, dealWithABlock) +
        ', ' + nextCode(data, block.inputs.ITEM, 0, dealWithABlock) +
        ' in pairs(' + list + ') do\n' +
        nextCode(data, block.inputs.SUBSTACK, depth+1, dealWithAHat) +
        indent + 'end\n';
    return result;
}
// 从传感器获取数据

// 获取input中的数字
// eslint-disable-next-line func-style,require-jsdoc
function handleNumbers (block) {
    return (block.fields.NUM == null) ? '' : block.fields.NUM.value;
}

// 获取text中的字符
// eslint-disable-next-line func-style,require-jsdoc
function handleTexts (block) {
    return (block.fields.TEXT == null) ? '' : block.fields.TEXT.value;
}

function handleFunctionCall (data, block, depth) {
    const indent = getIndent(depth);
    const result = indent + getFunctionName(data, block.id) +
        '( ' + getCallingParams(data, block.id) + ')\n';
    return result;
}

function handleArgumentReporter (data, block, depth, isBool) {
    if (isBool){
        return getIndent(depth) + '( ' + block.fields.VALUE.value + ')';
    }
    return getIndent(depth) + block.fields.VALUE.value;
}

// 判断block种类，调用相应的函数
// eslint-disable-next-line func-style,require-jsdoc
function dealWithABlock (data = {}, blockID = '', depth = 0) {
    if (data === {} || blockID === '') return '';
    const opcode = data[blockID].opcode;
    switch (opcode) {
        // motions
        case 'motion_movesteps': break;
        case 'motion_turnright': break;
        case 'motion_turnleft': break;
        // events
        case 'event_initial': return handleInit(data, data[blockID], depth);
        // control
        case 'control_wait': return handleWait(data, data[blockID], depth);
        case 'control_repeat': return handleRepeat(data, data[blockID], depth);
        case 'control_forever': return handleControlForever(data, data[blockID], depth);
        case 'control_if': return handleControlIf(data, data[blockID], depth);
        case 'control_if_else': return handleControlIfElse(data, data[blockID], depth);
        case 'control_repeat_until': return handleControlReapeatUntil(data, data[blockID], depth);
        case 'control_for_loop': return handleControlForLoop(data, data[blockID], depth);
        case 'control_stop': return getIndent(depth) + 'return\n';
        // sensing
        case 'sensing_timer': return handleTimer();
        // operate
        case 'operator_add': return handleNumOperation(data, data[blockID], depth, '+');
        case 'operator_subtract': return handleNumOperation(data, data[blockID], depth, '-');
        case 'operator_multiply': return handleNumOperation(data, data[blockID], depth, '*');
        case 'operator_divide': return handleNumOperation(data, data[blockID], depth, '/');
        case 'operator_random': break;
        case 'operator_gt': return handleBooleanOperation(data, data[blockID], depth, '>');
        case 'operator_lt': return handleBooleanOperation(data, data[blockID], depth, '<');
        case 'operator_equals': return handleBooleanOperation(data, data[blockID], depth, '==');
        case 'operator_and': return handleBooleanOperation(data, data[blockID], depth, 'and');
        case 'operator_or': return handleBooleanOperation(data, data[blockID], depth, 'or');
        case 'operator_not': return handleOperatiorNot(data, data[blockID], depth);
        case 'operator_length': break;
        case 'operator_mod': return handleNumOperation(data, data[blockID], depth, '%');
        case 'operator_round': break;
        case 'operator_mathop': break;
        // data
        case 'data_setvariableto': return handleSetVariable(data, data[blockID], depth);
        case 'data_changevariableby': return handleChangeVariable(data, data[blockID], depth);
        case 'data_for_iter': return handleForIter(data, data[blockID], depth);
        case 'data_variable': return handleGetVariable(data, data[blockID], depth);
        case 'data_listcontents': return handleGetList(data, data[blockID], depth);
        case 'data_replaceitemoflist': return handleReplaceItemOfList(data, data[blockID], depth);
        case 'data_itemoflist': return handleItemOfList(data, data[blockID], depth);
        case 'data_deletealloflist': return handleDeleteAllOfList(data, data[blockID], depth);
        // sensors
        case 'sensors_getData': return handleGetData(data, data[blockID], depth);
        case 'sensors_transferData': return handleTransferData(data, data[blockID], depth);
        // others
        case 'math_positive_number': return handleNumbers(data[blockID]);
        case 'math_whole_number': return handleNumbers(data[blockID]);
        case 'math_number': return handleNumbers(data[blockID]);
        case 'math_integer': return handleNumbers(data[blockID]);
        case 'text': return handleTexts(data[blockID]);
        case 'procedures_call': return handleFunctionCall(data, data[blockID], depth);
        case 'argument_reporter_string_number': return handleArgumentReporter(data, data[blockID], depth, false);
        case 'argument_reporter_boolean': return handleArgumentReporter(data, data[blockID], depth, true);
        default: alert(`cannot determine block type ${opcode}`); return '';
    }
}

/**
 * 生成一个blocks链对应的lua代码
 * @param data {JSON} 输入blocks的JSON对象
 * @param hatID {String} 队首block的id
 * @param depth {number} 代码深度
 * @return {string} 队列对应的lua代码
 */
// eslint-disable-next-line func-style,require-jsdoc
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

function getFunctionName (data, blockID) {
    return data[blockID].mutation.proccode.split(' ')[0];
}

function getProtoParams (data, blockID) {
    let result = data[blockID].mutation.argumentnames.replace('["', '');
    result = result.replace('"]', '');
    result = result.replace(/","/g, ', ');
    if (result == '[]') return '';
    return result;
}

function getCallingParams (data, blockID) {
    const block = data[blockID];
    const inputs = block.inputs;
    let result = [];
    for (let id in inputs) {
        result.push(dealWithABlock(data, inputs[id].block, 0));
    }
    return result.join(', ');
}

function funcDefinitions (data, definitionId) {
    const functionId = data[definitionId].inputs.custom_block.block
    const result = 'function ' + getFunctionName(data, functionId) +
        ' ( ' + getProtoParams(data, functionId) + ' )\n' +
        dealWithAHat(data, data[definitionId].next, 1) +
        'end\n';
    return result;
}

/**
 * 获取lua代码根函数
 * @param data {JSON} 输入blocks的JSON对象
 */
const getCode = function (data = {}) {
    if (data === {}) return;
    const hats = getHats(data);
    let funtionDefinitions = [];
    let result = [];
    let initial = [];
    for (let id in hats){
        if (data[hats[id]].opcode === 'procedures_definition') {
            funtionDefinitions.push(funcDefinitions(data, hats[id]));
        } else if (data[hats[id]].opcode === 'event_initial') {
            initial.push(dealWithAHat(data, hats[id]));
        } else {
            result.push(dealWithAHat(data, hats[id]));
        }
    }
    const result2 = JSON.stringify(data);
    fileWriter(result2, 'data.txt');
    fileWriter(defaultCodes + initial.join('\n') +
        '\n' + funtionDefinitions.join('\n') + '\n' + result.join('\n'), 'luaCode.lua');
};
export {getCode};
