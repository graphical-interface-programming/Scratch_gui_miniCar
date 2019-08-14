-- LED点阵接受信号
--1
function SetLedArr(dispArr)
	sendCanMsg(12, dispArr)	-- id, len, data{}
end