export function elipsys(s) {
	if (s)
 		return s.length > 16 ? s.substring(0, 16) + '...' : s
	else
		return ""
}