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
	sheet.name("MSF-OCBA HMIS");

	const { formType } = dataSet;

	const finalRow =
		formType === "DEFAULT"
			? populateDefault(sheet, dataSet)
			: formType === "SECTION"
			? populateSections(sheet, dataSet)
			: 1;
	const values = sheet.range(`A1:A${finalRow}`).value();
	const length = Math.min(
		60,
		Math.max(..._.compact(values.flat()).map((s) => s.length))
	);
	sheet.column("A").width(length);

	return workbook.outputAsync().then((buffer) => {
		return new Blob([buffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});
	});
}

const titleStyle = {
	bold: true,
	fontSize: 13.5,
};

const categoryHeaderStyle = {
	bold: true,
	fontSize: 10,
	horizontalAlignment: "center",
	verticalAlignment: "center",
};
const dataElementStyle = { fontSize: 10, wrapText: true };

function populateHeaders(sheet, header) {
	sheet.cell("A1").value(header.healthFacility).style(titleStyle);
	sheet
		.cell("A2")
		.value(header.reportingPeriod)
		.style({ bold: true, fontSize: 18 });
	sheet.cell("A3").value(header.dataSetName).style(titleStyle);
}

function populateDefault(sheet, dataSet) {
	if (dataSet.headers) populateHeaders(sheet, dataSet.headers);
	sheet.cell("A4").value(dataSet.displayFormName).style(titleStyle);
	sheet.cell("B6").value("Value");
	sheet.row(6).style(categoryHeaderStyle);
	_.orderBy(
		dataSet.dataSetElements,
		({ displayFormName }) => displayFormName
	).forEach((de, idx) =>
		sheet
			.row(7 + idx) //(6 + 1 cause idx starts on 0)
			.cell(1)
			.value(de.displayFormName)
			.style(dataElementStyle)
	);

	return dataSet.dataSetElements.length + 6;
}

function populateSections(sheet, dataSet) {
	if (dataSet.headers) populateHeaders(sheet, dataSet.headers);
	let row = 3;
	_.range(0, dataSet.sections.length).map((i) => {
		const section = dataSet.sections[i];
		row = addSection(sheet, section, row);
	});

	return row - 1;
}

function addSection(sheet, section, row) {
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
		).forEach((de) =>
			sheet
				.row(++row)
				.cell(1)
				.value(de.displayFormName)
				.style(dataElementStyle)
		);
		++row;
	});

	return row;
}
