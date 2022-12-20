export class ExportDatasetsUseCase {
	constructor(dhisRepository, xlsxRepository) {
		this.dhisRepository = dhisRepository;
		this.xlsxRepository = xlsxRepository;
	}

	execute($resource, dataSetsIds, headers) {
		return this.dhisRepository
			.get($resource, dataSetsIds)
			.$promise.then(({ dataSets }) => {
				const mappedDatasets =
					this.dhisRepository.getDataSets(dataSets);
				const dataSetsWithHeaders = mappedDatasets.map((dataSet) => ({
					...dataSet,
					headers: headers.find(({ id }) => id === dataSet.id),
				}));
				return this.xlsxRepository.createFiles(dataSetsWithHeaders);
			})
			.then((blobFiles) => {
				if (blobFiles.length > 1) {
					const zip = new JSZip();
					blobFiles.forEach((file) =>
						zip.file(
							file.name
								.replaceAll("<", "less than")
								.replaceAll(">", "greater than")
								.replaceAll(/[\\/]/g, "_")
								.replace(
									/[^\p{L}\s\d\-_~,;\[\]\(\).'{}]/gisu,
									""
								),
							file.blob
						)
					);
					return zip.generateAsync({ type: "blob" }).then((blob) => {
						saveAs(blob, "MSF-OCBA HMIS.zip");
					});
				} else if (blobFiles.length === 1) {
					const file = blobFiles[0];
					return file?.blob.then((blob) => saveAs(blob, file.name));
				}
			});
	}
}
