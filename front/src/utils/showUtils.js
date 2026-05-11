export function elipsys(s) {
	if (s)
 		return s.length > 10 ? s.substring(0, 10) + '...' : s
	else
		return ""
}