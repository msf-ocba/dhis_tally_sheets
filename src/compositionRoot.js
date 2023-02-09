import { ExportDatasetsUseCase } from "./domain/usecases/ExportDatasetsUseCase.js";
import { DataSetsDhis2Repository } from "./data/repositories/DataSetsDhis2Repository.js";
import { DataSetsExportSpreadsheetRepository } from "./data/repositories/DataSetsExportSpreadsheetRepository.js";

export function getCompositionRoot() {
    const dataSetsDhis2Repository = new DataSetsDhis2Repository();
    const dataSetsExportSpreadsheetRepository = new DataSetsExportSpreadsheetRepository();

    return {
        exportToXlsx: new ExportDatasetsUseCase(dataSetsDhis2Repository, dataSetsExportSpreadsheetRepository),
    };
}
