const hariArr = ["senin", "selasa", "rabu", "kamis", "jumat"];
const validateInsertTimeSchedule = (start_time, end_time, hari) => {
	const regex = /^\d{2}:\d{2}$/;
	if (regex.test(start_time) && regex.test(end_time)) {
		const timeStart = new Date("1970-01-01 " + start_time).getTime();
		const timeEnd = new Date("1970-01-01 " + end_time).getTime();
		if (timeEnd > timeStart && hariArr.includes(hari)) {
			return true;
		}
	}
	return false;
};
const isTimeInRange = (
	newTimeStart,
	newTimeEnd,
	hari_choosen,
	start_time,
	end_time,
	hari
) => {
	const timeStart = new Date("1970-01-01 " + start_time).getTime();
	const timeEnd = new Date("1970-01-01 " + end_time).getTime();
	const timenewStart = new Date("1970-01-01 " + newTimeStart).getTime();
	const timenewEnd = new Date("1970-01-01 " + newTimeEnd).getTime();
	return (
		((timenewStart >= timeStart && timenewStart <= timeEnd) ||
			(timenewEnd >= timeStart && timenewEnd <= timeEnd)) &&
		hari_choosen.toLowerCase() == hari.toLowerCase()
	);
};
const isSksCountAvailable = (Mahasiswa, sks) => {
	const ipk = Mahasiswa.getDataValue("ipk");
	const total_krs = Mahasiswa.getDataValue("total_krs");
	if (ipk < 2) {
		return total_krs + sks < 40;
	} else if (ipk <= 3) {
		return total_krs + sks < 50;
	} else if (ipk > 3) {
		return total_krs + sks < 80;
	}
	return false;
};
const isMatkulSelected = (selectedMatkul, matkul) => {
	const selectedMatkulKrs = selectedMatkul.split("-")[0];
	const arrVal = matkul.map(
		(el) => el.dataValues.MataKuliahKodeKelas.split("-")[0]
	);
	for (let i = 0; i < arrVal.length; i++) {
		if (arrVal[i] == selectedMatkulKrs) {
			return true;
		}
	}
	return false;
};
const isCapacityBenchFulfilled = (matkul, ruangKelas, kapasitas) => {
	const kapasitasMatkul = matkul.getDataValue("kapasitas");
	const kapasitasRuangKelas = ruangKelas.getDataValue("kapasitas");
	if (kapasitas) {
		return kapasitas <= kapasitasRuangKelas;
	}
	return kapasitasMatkul <= kapasitasRuangKelas;
};
module.exports = {
	validateInsertTimeSchedule,
	isTimeInRange,
	isSksCountAvailable,
	isMatkulSelected,
	isCapacityBenchFulfilled,
};
