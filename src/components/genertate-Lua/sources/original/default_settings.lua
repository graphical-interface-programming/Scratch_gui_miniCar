quanzhi = {-4, -6, -8, -10, 10, 8, 6, 4}
basespd = 350
basekp = 42

colorCase = 1		-- 1: 白底黑线	0：黑底白线
threshold = 127		-- 黑白之间的阈值

function HAL_GetTick()
	return 0	-- body
end

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
	sendCanMsg(18, spd)
end