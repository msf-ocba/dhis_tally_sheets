import { DHISRepository } from "./data/repositories/DHISRepository.js";
import { GetSelectedDataSetsUseCase } from "./domain/usecases/GetSelectedDataSetsUseCase.js";
import { CreateXlsxFilesUseCase } from "./domain/usecases/CreateXlsxFilesUseCase.js";

export function getCompositionRoot() {
	const dhisRepository = new DHISRepository();

	return {
		dataSets: {
			getSelected: new GetSelectedDataSetsUseCase(dhisRepository),
		},
		export: {
			createFiles: new CreateXlsxFilesUseCase(),
		},
	};
}
