# vim: set et sw=2 ts=2 sts=2 ff=unix fenc=utf8:
# Author: Binux<i@binux.me>
#         http://binux.me
# Created on 2014-08-05 14:47:55
import template from '/src/html/editablelist.html'

angular.module('editablelist', [])
  .directive('editablelist', () -> {
    restrict: 'A'
    scope: true
    templateUrl: template
    link: ($scope, $element, $attr, ctrl, $transclude) ->
      $scope.$filter = $scope.$eval($attr.filter)
      $scope.$watch($attr.editablelist, (value) ->
        $scope.$list = value
      )
  })
