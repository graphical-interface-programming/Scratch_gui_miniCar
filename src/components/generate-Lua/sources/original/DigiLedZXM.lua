-- 字形码模式数码管接受信号
--1
function SetDigiLedZXM(dispArr)
	sendCanMsg(13, dispArr)	-- id, len, data{}
end