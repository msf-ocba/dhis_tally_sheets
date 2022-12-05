export class CreateXlsxFilesUseCase {
	constructor() {}

	execute(dataSets) {
		const files$ = dataSets.flatMap((dataSet) => {
			switch (dataSet.formType) {
				case "DEFAULT":
					return [
						XlsxPopulate.fromBlankAsync().then(
							exportDefaultDataSet
						),
					];
				default:
					return [];
			}
		});
		return Promise.all(files$);
	}
}

function exportDefaultDataSet(workbook) {
	const sheet = workbook.sheet(0);
	sheet.name("MSF-OCBA HMIS");

	return workbook.outputAsync().then((buffer) => {
		return new Blob([buffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});
	});
}
