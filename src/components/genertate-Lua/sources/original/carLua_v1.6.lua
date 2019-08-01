
-- quanzhi = {-4, -6, -8, -10, 10, 8, 6, 4}
quanzhi = {-4, -6, -8, -10, 10, 8, 6, 4}
basespd = 350	-- 350
basekp = 42		-- 42

colorCase = 1		-- 1: 白底黑线	0：黑底白线
threshold = 127		-- 黑白之间的阈值

--控制LED灯
-- Judge led-state, on the white area or black area
function LedIsOn(ledval)
	if (colorCase == 1) then
		ledval = 255 - ledval
	end

	if(ledval > threshold) then
		return true
	else
		return false
	end
end

-- 设定速度值
-- @params: 左侧电机速度值、右侧电机速度值, 0~1000
-- @return: nil
-- @usage: 
function SetSpd(spdLeft, spdRight)
	local lk = 0
	local rk = 0

	if(spdLeft > 0) then
		lk  = 1
	elseif spdLeft < 0 then
		lk = -1
	else
		lk = 0
	end

	if(spdRight > 0) then
		rk  = 1
	elseif spdRight < 0 then
		rk = -1
	else
		rk = 0
	end

	spd = {(spdLeft >> 8) & 0xFF, spdLeft & 0xFF, 
		(spdRight >> 8) & 0xFF, spdRight & 0xFF}
	sendCanMsg(18, spd)	-- id = 0x12, len, data{}
end

-- 设定数码管显示
-- @params: array
-- @return: nil
-- @usage: 
function SetDigiLed(dispArr)
	sendCanMsg(11, dispArr)	-- id, len, data{}
end

-- 设定数码管显示,字形码模式
-- @params: array
-- @return: nil
-- @usage: 
function SetDigiLedZXM(dispArr)
	sendCanMsg(13, dispArr)	-- id, len, data{}
end

-- 设定LED点阵显示
-- @params: array
-- @return: nil
-- @usage: 
function SetLedArr(dispArr)
	sendCanMsg(12, dispArr)	-- id, len, data{}
end

-- 兼容STM32的HAL库中的HAL_GetTick()
function HAL_GetTick()
	return 0	-- body
end

-- 发送红外数据
function readCan()
	return readCanBuf(15)
end

-- Main loop
-- @params: 不同红外对应的权重值
-- @return: nil
-- @usage: readCanbuf()
-- @usage: SetSpd()
-- @usage: GetTime()
obstacleState = 0	-- 障碍状态
ultraIgnoreCnt = 0	-- 超声波屏蔽计数器，以便超声波每次重新启动后都能重新屏蔽超声波一段时间
function Loop(qz)
	ledData = readCan(15)	-- 读取红外数据
	SetLedArr(ledData)
	runState = 1 --readValue(1)	-- read bluetooth cmd

	-- 加权算法
	sum = 0
	for i,d in pairs(ledData) do
		if LedIsOn(d) then
			--print(i,d)
			sum = sum + qz[i]
		end
	end

	-- 停车状态处理
	if(runState == 0) then
		SetSpd(0, 0)		-- 速度复位
		obstacleState = 0	-- 障碍状态复位
		ultraIgnoreCnt = 0	-- 超声波屏蔽计数复位，以便再次启动后能重新屏蔽超声波一段时间
		
		return
	elseif(obstacleMode == 1 and obstacleStop == 1) then
		SetSpd(0, 0)
		return
	end

	-- 已检测到障碍，关闭超声波检测，盲拐
	obstacleStartTime = 0
	if(obstacleState == 1) then
		obstacleStartTime = HAL_GetTick()
		obstacleState = obstacleState + 1
		
		-- UltraSonicStop()
	end
	if(obstacleState == 2) then
		sum = 10
	end
	if(HAL_GetTick() - obstacleStartTime > 900) then
		obstacleState = obstacleState + 1
	end
	if(obstacleState == 3) then
		sum = 7
		if(HAL_GetTick() - obstacleStartTime > 1400) then
			obstacleState = obstacleState + 1
		end
	end
	if(obstacleState == 4) then
		sum = -7
		if(HAL_GetTick() - obstacleStartTime > 2000) then
			obstacleState = obstacleState + 1
		end
	end
	if(obstacleState == 5) then
		sum = -10
		if(HAL_GetTick() - obstacleStartTime > 2500) then
			obstacleState = 0
			--UltraSonicStart()
		end
	end

	sum = sum * basekp
	SetSpd(basespd - sum, basespd + sum)
end

while(true) 
do 
	Loop(quanzhi)
	delay_ms(25)
end 