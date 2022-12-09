export class CreateXlsxFilesUseCase {
	constructor() {}

	execute(dataSets) {
		const files$ = dataSets.flatMap((dataSet) => {
			if (
				dataSet.formType === "SECTION" ||
				dataSet.formType === "DEFAULT"
			) {
				return [
					{
						name: `${dataSet.name}.xlsx`,
						blob: XlsxPopulate.fromBlankAsync().then((workbook) =>
							exportDataSet(workbook, dataSet)
						),
					},
				];
			} else return [];
		});
		return Promise.all(files$);
	}
}

function exportDataSet(workbook, dataSet) {
	const sheet = workbook.sheet(0);
	sheet.name("MSF-OCBA HMIS");
	console.log(dataSet);
	if (dataSet.formType === "DEFAULT") populateDefault(sheet, dataSet);
	else if (dataSet.formType === "SECTION") populateSections(sheet, dataSet);

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

function populateDefault(sheet, dataSet) {
	if (dataSet.headers) populateHeaders(sheet, dataSet.headers);
	sheet.cell("A4").value(dataSet.displayFormName);
	sheet.cell("B6").value("Value");
	_.orderBy(
		dataSet.dataElements,
		({ displayFormName }) => displayFormName
	).forEach((de, idx) => sheet.cell(`A${7 + idx}`).value(de.displayFormName));
}

function populateSections(sheet, dataSet) {
	if (dataSet.headers) populateHeaders(sheet, dataSet.headers);
	let row = 3;
	_.range(0, dataSet.sections.length).map((i) => {
		const section = dataSet.sections[i];
		row = addSection(sheet, section, row);
	});
}

function addSection(sheet, section, row) {
	sheet.cell(`A${++row}`).value(section.displayName);
	if (section.description) sheet.cell(`A${++row}`).value(section.description);
	++row;
	section.categoryCombos.forEach((categoryCombo) => {
		categoryCombo.categories.forEach((category) => {
			++row;
			categoryCombo.categoryOptionCombo.forEach(
				(categoryOptionCombo, idx) => {
					const column = String.fromCharCode(idx + 66);
					// sheet.cell(`${column}${row}`).value(categoryOptionCombo.categories??"");
				}
			);
		});
	});
	// _.orderBy(
	// 	dataSet.dataElements,
	// 	({ displayFormName }) => displayFormName
	// ).forEach((de, idx) => sheet.cell(`A${7 + idx}`).value(de.displayFormName));
	return row;
}
