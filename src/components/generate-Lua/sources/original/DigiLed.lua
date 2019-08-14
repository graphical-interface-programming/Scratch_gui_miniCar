-- 数码管接受信号
--1
function SetDigiLed(dispArr)
	sendCanMsg(11, dispArr)	-- id, len, data{}
end