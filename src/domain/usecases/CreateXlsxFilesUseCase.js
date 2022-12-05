export class CreateXlsxFilesUseCase {
	constructor() {}

	execute(dataSets) {
		const files$ = dataSets.flatMap((dataSet) => {
			switch (dataSet.formType) {
				case "DEFAULT":
					return [
						{
							name: `${dataSet.title}.xlsx`,
							blob: XlsxPopulate.fromBlankAsync().then(
								(workbook) =>
									exportDefaultDataSet(workbook, dataSet)
							),
						},
					];
				default:
					return [];
			}
		});
		return Promise.all(files$);
	}
}

function exportDefaultDataSet(workbook, dataSet) {
	const sheet = workbook.sheet(0);
	sheet.name("MSF-OCBA HMIS");
	if (dataSet.headers) populateHeaders(sheet, dataSet.headers);

	return workbook.outputAsync().then((buffer) => {
		return new Blob([buffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});
	});
}

function populateHeaders(sheet, header) {
	sheet.cell("A1").value(header.healthFacility);
	sheet.cell("A2").value(header.reportingPeriod);
	sheet.cell("A3").value(header.dataSetName);
}
