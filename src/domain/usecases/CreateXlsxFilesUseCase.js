export class CreateXlsxFilesUseCase {
	constructor() {}

	//TODO WHEN IS SECTION BUT IS DEFAULT IN REALITY

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
	sheet.column("A").width(40);
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
		dataSet.dataSetElements,
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
		let combinations = categoryCombo.categories
			.map((cg) => cg.length)
			.reduce((a, b) => a * b);
		let categoryWidth = combinations;
		let loops = 1;
		categoryCombo.categories.forEach((categoryGroup, cgIdx) => {
			++row;
			categoryWidth = categoryWidth / categoryGroup.length;
			loops = loops * categoryGroup.length;
			categoryCombo.categoryOptionCombos.forEach(
				(categoryOptionCombo, cocIdx) => {
					const range = _.range(0, Math.max(1, cocIdx) / 24);
					const column = range
						.map((idx) =>
							idx === range.length - 1
								? range.length === 1
									? String.fromCharCode((cocIdx % 25) + 66)
									: String.fromCharCode((cocIdx % 25) + 65)
								: String.fromCharCode(idx + 65)
						)
						.join(""); //B is 66
					console.log(column);
					console.log(`idx: ${cocIdx}, column: ${column}`);
					sheet
						.cell(`${column}${row}`)
						.value(
							_.first(
								_.at(categoryOptionCombo.categories, cgIdx)
							) ?? ""
						);
				}
			);
			if (categoryWidth > 1) {
				_.range(0, loops).map((i) => {
					const start = i * categoryWidth + 66; //B is 66
					const end = start + categoryWidth - 1; //B is 66
					const range = sheet.range(
						`${String.fromCharCode(
							start
						)}${row}:${String.fromCharCode(end)}${row}`
					);
					range.merged(true);
				});
			}
		});
		_.orderBy(
			categoryCombo.dataElements,
			({ displayFormName }) => displayFormName
		).forEach((de) => sheet.cell(`A${++row}`).value(de.displayFormName));
		++row;
	});
	return row;
}
