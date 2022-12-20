import { ExportDatasetsUseCase } from "./domain/usecases/ExportDatasetsUseCase.js";
import { DHISRepository } from "./data/repositories/DHISRepository.js";
import { XLSXRepository } from "./data/repositories/XLSXRepository.js";

export function getCompositionRoot() {
	const dhisRepository = new DHISRepository();
	const xlsxRepository = new XLSXRepository();

	return {
		exportToXlsx: new ExportDatasetsUseCase(dhisRepository, xlsxRepository),
	};
}
