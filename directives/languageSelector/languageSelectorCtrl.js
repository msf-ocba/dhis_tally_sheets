TallySheets.directive("languageSelector", function () {
  return {
    restrict: "E",
    templateUrl: "directives/languageSelector/languageSelectorView.html",
    scope: {
      selectorId: "=",
      bindToDataset: "=",
    },
  };
});
