// Localizations
function formatDuration(seconds) {
	seconds = Math.floor(seconds);
	if(!seconds){
		return "---";
	}
	let curSecs = seconds;
	let out = "";
	if (curSecs > 60 * 60) {
		out += Math.floor(curSecs / (60 * 60)) + ":";
		curSecs = curSecs % (60 * 60);
	}
	out +=
		Math.floor(curSecs / 60)
			.toString()
			.padStart(2, "0") +
		":" +
		(curSecs % 60).toString().padStart(2, "0");
	return out;
}
const localizedFuncs = {
    "en":{
        formatDuration: formatDuration
    }
}
export {localizedFuncs};