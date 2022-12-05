class XLSXRepository {
	static test() {
		// Load a new blank workbook
		return XlsxPopulate.fromBlankAsync().then((workbook) => {
			const sheet = workbook.sheet(0);
			sheet.name("MSF-OCBA HMIS");
			return workbook.outputAsync().then((buffer) => {
				return new Blob([buffer], {
					type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				});
			});
		});
	}
}
