-- Main loop
--3
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
		end
	end

	sum = sum * basekp
	SetSpd(basespd - sum, basespd + sum)
end