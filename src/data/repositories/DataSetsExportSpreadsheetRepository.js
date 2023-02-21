export class DataSetsExportSpreadsheetRepository {
    createFiles(dataSets) {
        const files$ = dataSets.flatMap(dataSet => {
            if (dataSet.formType === "SECTION" || dataSet.formType === "DEFAULT") {
                return [
                    {
                        name: `${dataSet.name.trim()}.xlsx`,
                        blob: XlsxPopulate.fromBlankAsync().then(workbook => exportDataSet(workbook, dataSet)),
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
    const length = Math.min(60, Math.max(..._.compact(values.flat()).map(s => s.length)));
    sheet.column("A").width(length);

    return workbook.outputAsync().then(buffer => {
        return new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
    });
}

const borderStyle = { style: "thin", color: "000000" };

const styles = {
    dataElementStyle: { fontSize: 10, wrapText: true },
    titleStyle: {
        bold: true,
        fontSize: 13.5,
    },
    categoryHeaderStyle: {
        bold: true,
        fontSize: 10,
        horizontalAlignment: "center",
        verticalAlignment: "center",
    },
    borders: {
        border: {
            left: borderStyle,
            right: borderStyle,
            top: borderStyle,
            bottom: borderStyle,
        },
    },
};

function populateHeaders(sheet, header) {
    sheet.cell("A1").value(header.healthFacility).style(styles.titleStyle);
    sheet.cell("A2").value(header.reportingPeriod).style({ bold: true, fontSize: 18 });
    sheet.cell("A3").value(header.dataSetName).style(styles.titleStyle);
}

function populateDefault(sheet, dataSet) {
    if (dataSet.headers) populateHeaders(sheet, dataSet.headers);
    sheet.cell("A4").value(dataSet.displayFormName).style(styles.titleStyle);
    sheet.cell("B6").value("Value");
    sheet.row(6).style(styles.categoryHeaderStyle);
    dataSet.dataSetElements.forEach((de, idx) =>
        sheet
            .row(7 + idx) //(6 + 1 cause idx starts on 0)
            .cell(1)
            .value(de.displayFormName)
            .style(styles.dataElementStyle)
    );

    const lastCell = sheet.row(dataSet.dataSetElements.length + 6).cell(2); //B = 2
    sheet.row(6).cell(1).rangeTo(lastCell).style(styles.borders);

    return dataSet.dataSetElements.length + 6;
}

function populateSections(sheet, dataSet) {
    if (dataSet.headers) populateHeaders(sheet, dataSet.headers);
    let row = 3;
    _.range(0, dataSet.sections.length).forEach(i => {
        const section = dataSet.sections[i];
        row = addSection(sheet, section, row);
    });

    return row - 1;
}

function addSection(sheet, section, row) {
    sheet.row(++row).cell(1).value(section.displayName).style(styles.titleStyle);
    if (section.description) sheet.row(++row).cell(1).value(section.description);
    ++row;

    section.categoryCombos.forEach(categoryCombo => {
        const combinations = categoryCombo.categories.map(cg => cg.length).reduce((a, b) => a * b);
        let categoryWidth = combinations;
        let loops = 1;
        const firstRow = row;
        categoryCombo.categories.forEach((categoryGroup, cgIdx) => {
            ++row;
            categoryWidth = categoryWidth / categoryGroup.length;
            loops = loops * categoryGroup.length;
            categoryCombo.categoryOptionCombos.forEach((categoryOptionCombo, idx) => {
                const value = _.first(_.at(categoryOptionCombo.categories, cgIdx)) ?? "";
                sheet
                    .row(row)
                    .cell(idx + 2) //(1 + 1) starts at B and starts from 1 not 0
                    .value(value === "default" ? "Value" : value);
            });
            if (categoryWidth > 1) {
                _.range(0, loops).map(i => {
                    const start = i * categoryWidth + 2; //(1 + 1) starts at B and starts from 1 not 0
                    const end = start + categoryWidth - 1;
                    const startCell = sheet.row(row).cell(start);
                    const endCell = sheet.row(row).cell(end);
                    const range = startCell.rangeTo(endCell);
                    range.merged(true);
                });
            }
            sheet.row(row).style(styles.categoryHeaderStyle);
        });

        const cocIds = categoryCombo.categoryOptionCombos.map(({ id }) => id);

        categoryCombo.dataElements.forEach(de => {
            sheet.row(++row).cell(1).value(de.displayFormName).style(styles.dataElementStyle);

            if (!_.isEmpty(categoryCombo.greyedFields)) {
                const applicableGF = section.greyedFields.filter(gf => gf.dataElement.id === de.id);
                applicableGF.forEach(gf => {
                    const idx = cocIds.indexOf(gf.categoryOptionCombo.id);
                    if (idx >= 0)
                        sheet
                            .row(row)
                            .cell(idx + 2) //(1 + 1)
                            .value("X");
                });
            }
        });

        const lastCell = sheet.row(row).cell(combinations + 1);
        sheet
            .row(firstRow + 1)
            .cell(1)
            .rangeTo(lastCell)
            .style(styles.borders);

        ++row;
    });

    return row;
}
