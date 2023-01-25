import { TallySheets } from "../TallySheets.js";

export const formDatasetController = TallySheets.controller("formDatasetCtrl", [
	"$scope",
	"$sce",
	($scope, $sce) => {
		$scope.deliberatelyTrustDangerousSnippet = () =>
			$sce.trustAsHtml($scope.outputHtml);

		$scope.formatForm = (e) => {
			const j = $(e[0]);

			//PREVIOUS CODE, NOT CHECKED BUT REMOVED SOME COMMENTED CODE
			// Remove section filters
			j.find(".sectionFilter")
				.parent()
				.replaceWith("<th class='no-border'></th>");

			// Remove categoryoptions headers
			j.find(".hidden").remove();
			j.find(".indicatorArea").remove();

			// Replace empty cells in header
			j.find(".sectionTable tbody th")
				.parent()
				.find("td")
				.replaceWith("<th class='no-border'></th>");

			// Set entryfields as readonly
			j.find(".entryfield").prop("readonly", true);

			// Remove "Total" rows
			j.find(".sectionTable tr td:contains('Total')")
				.parent("tr")
				.remove();

			// Modify titles of sections to place them as section header
			const sectionLinks = j.find("div[id^='tabs-'] > ul > li > a");
			sectionLinks.each(function () {
				let sectionId = $(this).attr("href");
				if (sectionId.startsWith("#")) {
					sectionId = sectionId.substring(1);
				}

				// Add a Section Header at the beginning of the table
				// Also, if the dataset has sections, add a 'delete' button to allow removing the section
				j.find(`#${sectionId}`).prepend(
					`<h3>
						<button class='remove-section btn btn-default btn-sm hidden-print' sectionId=${sectionId}>
							<span class='glyphicon glyphicon-remove'></span>
						</button> ${$(this).html()}
					</h3>`
				);

				$(this).parent().remove();
			});

			// Remove "Total" columns
			const headerSections = j.find(".sectionTable thead");
			const tableWithTotal = j
				.find(".sectionTable thead tr")
				.find("th:contains('Total')")
				.parent()
				.parent()
				.parent();
			tableWithTotal.find("tbody tr").each(function () {
				if (headerSections.find("tr").find("th:contains('Total')")[0])
					$(this).find("td").last().remove();
			});

			headerSections.find("tr").find("th:contains('Total')").remove();

			$("h3")
				.filter(function () {
					return (
						this.innerHTML.indexOf("Comments") > -1 ||
						this.innerHTML.indexOf("Comentarios") > -1 ||
						this.innerHTML.indexOf("Commentaires") > -1 ||
						this.innerHTML.indexOf("Comentários") > -1 ||
						this.innerHTML.indexOf("Notas") > -1
					);
				})
				.parent("div")
				.remove();

			// Make rows resizable
			j.find(".sectionTable tr").each(function () {
				$(this).find("td").last().resizable();
			});

			// Add class "greyfield" to cells (td object)
			j.find(".sectionTable input:disabled")
				.closest("td")
				.addClass("greyfield");

			// Delete commentlinks for Watsan
			j.find(".commentlink").remove();

			// Delete entryfields
			j.find(".sectionTable input").remove();

			// Write an "X" in greyfields to represent that they are blocked
			j.find(".sectionTable td.greyfield").html("X");

			// Put section in a panel
			j.find(".formSection").addClass("panel panel-default");

			// Add listeners
			j.on("click", ".remove-section", function (event) {
				const sectionId = $(this).attr("sectionId");
				j.find("#" + sectionId).hide(400, function () {
					j.find("#" + sectionId).remove();
				});
			});
		};
	},
]);
