const judge_WhileOrBlack = 'function LedIsOn(ledval)\n' +
    '\tif (colorCase == 1) then\n' +
    '\t\tledval = 255 - ledval\n' +
    '\tend\n' +
    '\n' +
    '\tif(ledval > threshold) then\n' +
    '\t\treturn true\n' +
    '\telse\n' +
    '\t\treturn false\n' +
    '\tend\n' +
    'end\n\n';

export default judge_WhileOrBlack;
