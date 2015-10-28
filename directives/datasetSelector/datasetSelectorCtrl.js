TallySheets.directive('datasetSelector', function(){
    return{
        restrict: 'E',
        templateUrl: 'directives/datasetSelector/datasetSelectorView.html',
        scope: {
            selectorId: '=',
            bindToDataset: '='
        }
    };
});

TallySheets.controller('datasetSelectorCtrl', ['$scope', '$rootScope', 'DataSetsUID', function($scope, $rootScope, DataSetsUID){

    $scope.id = "dsSelector" + $scope.selectorId;

    DataSetsUID.get().$promise.then(function(result){
        $scope.dataSetList = result.dataSets;
    });

    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        // Refresh bootstrap-select
        $('.selectpicker').selectpicker('refresh');
        $('.selectpicker').selectpicker('render');
    });

    $(document).on('change', '#' + $scope.id ,function(){
        var dsId = $("option:selected", this).val();
        var dsName = $("option:selected", this).html().trim();

        $scope.bindToDataset.id = dsId;
        $scope.bindToDataset.name = dsName;

        $rootScope.$apply();
    });

}]);
