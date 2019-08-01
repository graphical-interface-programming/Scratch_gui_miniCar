--判断黑白区
--1
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