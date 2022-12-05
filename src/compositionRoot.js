import { DHISRepository } from "./data/repositories/DHISRepository.js";
import { GetSelectedDataSetsUseCase } from "./domain/usecases/GetSelectedDataSetsUseCase.js";

export function getCompositionRoot() {
	const dhisRepository = new DHISRepository();

	return {
		dataSets: {
			getSelected: new GetSelectedDataSetsUseCase(dhisRepository),
		},
	};
}
