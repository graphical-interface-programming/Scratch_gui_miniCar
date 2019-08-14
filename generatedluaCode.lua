function HAL_GetTick()
	return 0	-- body
end


quanzhi[1] = -4
quanzhi[2] = -6
quanzhi[3] = -8
quanzhi[4] = -10
quanzhi[5] = 10
quanzhi[6] = 8
quanzhi[7] = 6
quanzhi[8] = 4
ledOn = false
colorCase = 1
threshold = 127
basespd = 350
basekp = 42
ultraIgnoreCnt = 0
obstacleState = 0

function LedIsOn ( ledval )
	if ( ( ( colorCase == 1 ) and ( ( 255 - ledval ) > threshold ) ) or ( ( colorCase == 1 ) and ( ledval > threshold ) ) ) then
		ledOn = true
	else
		ledOn = false
	end
end

function SetSpd ( spdLeft, spdRight )
	lk = 0
	rk = 0
	if ( spdLeft > 0 ) then
		lk = 1
	else
		if ( spdLeft < 0 ) then
			lk = -1
		else
			lk = 0
		end
	end
	if ( spdRight > 0 ) then
		rk = 1
	else
		if ( spdRight < 0 ) then
			rk = -1
		else
			rk = 0
		end
	end
	spd[1] = (spdLeft >> 8) & 0xFF
	spd[2] = spdLeft & 0xFF
	spd[3] = (spdRight >> 8) & 0xFF
	spd[4] = spdRight & 0xFF
	sendCanMsg(18, spd)
end

function GetLedData (  )
	ledData = sendCanMsg(undefind sensor)
	sendCanMsg(12, ledData)
end

function Loop (  )
	GetLedData( )
	runState = 1
	sum = 0
	for key, element in pairs(ledData) do
		LedIsOn( element)
		if ( ledOn == true ) then
			sum = sum + quanzhi[key]
		end
	end
	if ( runState == 0 ) then
		SetSpd( 0, 0)
		obstacleState = 0
		ultraIgnoreCnt = 0
		return
	end
	if ( ( obstacleMode == 1 ) and ( obstacleStop == 1 ) ) then
		SetSpd( 0, 0)
		return
	end
	obstacleStartTime = 0
	if ( obstacleState == 1 ) then
		obstacleStartTime = HAL_GetTick()
		obstacleState = obstacleState + 1
	end
	if ( obstacleState == 2 ) then
		sum = 10
	end
	if ( ( HAL_GetTick() - obstacleStartTime ) > 900 ) then
		obstacleState = obstacleState + 1
	end
	if ( obstacleState == 3 ) then
		sum = 7
		if ( ( HAL_GetTick() - obstacleStartTime ) > 1400 ) then
			obstacleState = obstacleState + 1
		end
	end
	if ( obstacleState == 4 ) then
		sum = -7
		if ( ( HAL_GetTick() - obstacleStartTime ) > 2000 ) then
			obstacleState = obstacleState + 1
		end
	end
	if ( obstacleState == 5 ) then
		sum = -10
		if ( ( HAL_GetTick() - obstacleStartTime ) > 2500 ) then
			obstacleState = 0
		end
	end
	sum = ( sum * basekp )
	SetSpd( ( basespd - sum ), ( basespd + sum ))
end

while(true)
do
	Loop( )
	delay_ms(25)
end
