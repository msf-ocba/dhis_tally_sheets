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
	sheet.column("A").width(57);
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
	sheet
		.cell("A1")
		.value([
			[header.healthFacility],
			[header.reportingPeriod],
			[header.dataSetName],
		]);
}

function populateDefault(sheet, dataSet) {
	if (dataSet.headers) populateHeaders(sheet, dataSet.headers);
	sheet.cell("A4").value(dataSet.displayFormName);
	sheet.cell("B6").value("Value");
	_.orderBy(
		dataSet.dataSetElements,
		({ displayFormName }) => displayFormName
	).forEach((de, idx) =>
		sheet
			.row(7 + idx)
			.cell(1)
			.value(de.displayFormName)
	);
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
	if (section.displayName)
		sheet.row(++row).cell(1).value(section.displayName);
	if (section.description)
		sheet.row(++row).cell(1).value(section.description);
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
				(categoryOptionCombo, column) => {
					const value =
						_.first(_.at(categoryOptionCombo.categories, cgIdx)) ??
						"";
					sheet
						.row(row)
						.cell(column + 2) //(1 + 1) starts at B and starts from 1 not 0
						.value(value === "default" ? "Value" : value);
				}
			);
			if (categoryWidth > 1) {
				_.range(0, loops).map((i) => {
					const start = i * categoryWidth + 2; //(1 + 1) starts at B and starts from 1 not 0
					const end = start + categoryWidth - 1;
					const startCell = sheet.row(row).cell(start);
					const endCell = sheet.row(row).cell(end);
					const range = startCell.rangeTo(endCell);
					range.merged(true);
				});
			}
		});
		_.orderBy(
			categoryCombo.dataElements,
			({ displayFormName }) => displayFormName
		).forEach((de) => sheet.row(++row).cell(1).value(de.displayFormName));
		++row;
	});
	return row;
}
