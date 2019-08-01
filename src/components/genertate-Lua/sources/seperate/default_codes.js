const defaultCodes = 'quanzhi = {-4, -6, -8, -10, 10, 8, 6, 4}\n' +
    'basespd = 350\n' +
    'basekp = 42\n' +
    '\n' +
    'colorCase = 1\t\t-- 1: 白底黑线\t0：黑底白线\n' +
    'threshold = 127\t\t-- 黑白之间的阈值\n' +
    '\n' +
    'function HAL_GetTick()\n' +
    '\treturn 0\t-- body\n' +
    'end\n' +
    '\n' +
    'function SetSpd(spdLeft, spdRight)\n' +
    '\tlocal lk = 0\n' +
    '\tlocal rk = 0\n' +
    '\n' +
    '\tif(spdLeft > 0) then\n' +
    '\t\tlk  = 1\n' +
    '\telseif spdLeft < 0 then\n' +
    '\t\tlk = -1\n' +
    '\telse\n' +
    '\t\tlk = 0\n' +
    '\tend\n' +
    '\n' +
    '\tif(spdRight > 0) then\n' +
    '\t\trk  = 1\n' +
    '\telseif spdRight < 0 then\n' +
    '\t\trk = -1\n' +
    '\telse\n' +
    '\t\trk = 0\n' +
    '\tend\n' +
    '\n' +
    '\tspd = {(spdLeft >> 8) & 0xFF, spdLeft & 0xFF, \n' +
    '\t\t(spdRight >> 8) & 0xFF, spdRight & 0xFF}\n' +
    '\tsendCanMsg(18, spd)\n' +
    'end\n\n';

export default defaultCodes;
