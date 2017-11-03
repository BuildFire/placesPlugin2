!function(e){function t(n){if(o[n])return o[n].exports;var r=o[n]={i:n,l:!1,exports:{}};return e[n].call(r.exports,r,r.exports,t),r.l=!0,r.exports}var o={};t.m=e,t.c=o,t.d=function(e,o,n){t.o(e,o)||Object.defineProperty(e,o,{configurable:!1,enumerable:!0,get:n})},t.n=function(e){var o=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(o,"a",o),o},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t,o){"use strict";o(1);var n=function(e){return e&&e.__esModule?e:{default:e}}(o(2));n.default.module("places2Controller",["ui.sortable"]).controller("contentController",function(e){var t;e.list=[],e.sortBy="manual",e.defaultView="map",e.categories=["restaurant","park","site"],buildfire.datastore.get("places",function(o,n){if(o)return void console.error("datastore.get error",o);t=n.id,e.list=n.data.places,e.$apply()});var o=function(e){e.places.forEach(function(e,t){e.sort=t}),console.error("saving data",e),buildfire.datastore.save(e,"places",function(e){if(e)return void console.error(e)})};e.changeDefaultView=function(){r()},e.changeSortOrder=function(){r()};var r=function(){var t=n.default.copy(e.list),r=n.default.copy(e.sortBy),a=n.default.copy(e.categories),l=n.default.copy(e.defaultView);o({places:t,sortBy:r,categories:a,defaultView:l})};e.sortableOptions={update:function(){setTimeout(function(){r()},200)}};var a=document.getElementById("pac-input"),l=new google.maps.places.Autocomplete(a);l.addListener("place_changed",function(){var t,r,a=l.getPlace(),i=a.formatted_address,u=a.geometry;if(u){t={lng:u.location.lng(),lat:u.location.lat()},r={title:e.title,address:{name:i,lat:t.lat,lng:t.lng}},e.list?e.list.push(r):e.list=[r],e.title="",e.location="",e.$apply();var s=n.default.copy(e.list);n.default.copy(e.sortBy),o(s)}})})},function(e,t){function o(e){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}angular.module("ui.sortable",[]).value("uiSortableConfig",{items:"> [ng-repeat],> [data-ng-repeat],> [x-ng-repeat]"}).directive("uiSortable",["uiSortableConfig","$timeout","$log",function(e,t,n){return{require:"?ngModel",scope:{ngModel:"=",uiSortable:"=",create:"&uiSortableCreate",start:"&uiSortableStart",activate:"&uiSortableActivate",beforeStop:"&uiSortableBeforeStop",update:"&uiSortableUpdate",remove:"&uiSortableRemove",receive:"&uiSortableReceive",deactivate:"&uiSortableDeactivate",stop:"&uiSortableStop"},link:function(r,a,l,i){function u(e,t){var o="function"==typeof e,n="function"==typeof t;return o&&n?function(){e.apply(this,arguments),t.apply(this,arguments)}:n?t:e}function s(e){var t=e.data("ui-sortable");return t&&"object"===o(t)&&"ui-sortable"===t.widgetFullName?t:null}function c(t,o){return w[t]?("stop"===t&&(o=u(o,function(){r.$apply()}),o=u(o,y)),o=u(w[t],o)):M[t]&&(o=M[t](o)),o||"items"!==t&&"ui-model-items"!==t||(o=e.items),o}function f(e,t,o){function n(e,t){t in E||(E[t]=null)}angular.forEach(w,n);var r=null;if(t){var a;angular.forEach(t,function(t,o){if(!(e&&o in e)){if(o in V)return void(E[o]="ui-floating"===o?"auto":c(o,void 0));a||(a=angular.element.ui.sortable().options);var n=a[o];n=c(o,n),r||(r={}),r[o]=n,E[o]=n}})}return angular.forEach(e,function(e,t){if(t in V)return"ui-floating"!==t||!1!==e&&!0!==e||!o||(o.floating=e),void(E[t]=c(t,e));e=c(t,e),r||(r={}),r[t]=e,E[t]=e}),r}function d(e){var t=e.sortable("option","placeholder");if(t&&t.element&&"function"==typeof t.element){var o=t.element();return o=angular.element(o)}return null}function p(e,t){var o=E["ui-model-items"].replace(/[^,]*>/g,"");return e.find('[class="'+t.attr("class")+'"]:not('+o+")")}function m(e,t){var o=e.sortable("option","helper");return"clone"===o||"function"==typeof o&&t.item.sortable.isCustomHelperUsed()}function b(e,t){var o=null;return m(e,t)&&"parent"===e.sortable("option","appendTo")&&(o=$),o}function v(e){return/left|right/.test(e.css("float"))||/inline|table-cell/.test(e.css("display"))}function g(e,t){for(var o=0;o<e.length;o++){var n=e[o];if(n.element[0]===t[0])return n}}function y(e,t){t.item.sortable._destroy()}function h(e){return e.parent().find(E["ui-model-items"]).index(e)}function S(){r.$watchCollection("ngModel",function(){t(function(){s(a)&&a.sortable("refresh")},0,!1)}),w.start=function(e,t){if("auto"===E["ui-floating"]){var o=t.item.siblings();s(angular.element(e.target)).floating=v(o)}var n=h(t.item);t.item.sortable={model:i.$modelValue[n],index:n,source:a,sourceList:t.item.parent(),sourceModel:i.$modelValue,cancel:function(){t.item.sortable._isCanceled=!0},isCanceled:function(){return t.item.sortable._isCanceled},isCustomHelperUsed:function(){return!!t.item.sortable._isCustomHelperUsed},_isCanceled:!1,_isCustomHelperUsed:t.item.sortable._isCustomHelperUsed,_destroy:function(){angular.forEach(t.item.sortable,function(e,o){t.item.sortable[o]=void 0})},_connectedSortables:[],_getElementContext:function(e){return g(this._connectedSortables,e)}}},w.activate=function(e,t){var o=t.item.sortable.source===a,n=o?t.item.sortable.sourceList:a,l={element:a,scope:r,isSourceContext:o,savedNodesOrigin:n};t.item.sortable._connectedSortables.push(l),_=n.contents(),$=t.helper;var i=d(a);if(i&&i.length){var u=p(a,i);_=_.not(u)}},w.update=function(e,t){if(!t.item.sortable.received){t.item.sortable.dropindex=h(t.item);var o=t.item.parent().closest("[ui-sortable], [data-ui-sortable], [x-ui-sortable]");t.item.sortable.droptarget=o,t.item.sortable.droptargetList=t.item.parent();var n=t.item.sortable._getElementContext(o);t.item.sortable.droptargetModel=n.scope.ngModel,a.sortable("cancel")}var l=!t.item.sortable.received&&b(a,t,_);l&&l.length&&(_=_.not(l));var u=t.item.sortable._getElementContext(a);_.appendTo(u.savedNodesOrigin),t.item.sortable.received&&(_=null),t.item.sortable.received&&!t.item.sortable.isCanceled()&&(r.$apply(function(){i.$modelValue.splice(t.item.sortable.dropindex,0,t.item.sortable.moved)}),r.$emit("ui-sortable:moved",t))},w.stop=function(e,t){var o="dropindex"in t.item.sortable&&!t.item.sortable.isCanceled();if(o&&!t.item.sortable.received)r.$apply(function(){i.$modelValue.splice(t.item.sortable.dropindex,0,i.$modelValue.splice(t.item.sortable.index,1)[0])}),r.$emit("ui-sortable:moved",t);else if(!o&&!angular.equals(a.contents().toArray(),_.toArray())){var n=b(a,t,_);n&&n.length&&(_=_.not(n));var l=t.item.sortable._getElementContext(a);_.appendTo(l.savedNodesOrigin)}_=null,$=null},w.receive=function(e,t){t.item.sortable.received=!0},w.remove=function(e,t){"dropindex"in t.item.sortable||(a.sortable("cancel"),t.item.sortable.cancel()),t.item.sortable.isCanceled()||r.$apply(function(){t.item.sortable.moved=i.$modelValue.splice(t.item.sortable.index,1)[0]})},angular.forEach(w,function(e,t){w[t]=u(w[t],function(){var e,o=r[t];"function"==typeof o&&("uiSortable"+t.substring(0,1).toUpperCase()+t.substring(1)).length&&"function"==typeof(e=o())&&e.apply(this,arguments)})}),M.helper=function(e){return e&&"function"==typeof e?function(t,o){var n=o.sortable,r=h(o);o.sortable={model:i.$modelValue[r],index:r,source:a,sourceList:o.parent(),sourceModel:i.$modelValue,_restore:function(){angular.forEach(o.sortable,function(e,t){o.sortable[t]=void 0}),o.sortable=n}};var l=e.apply(this,arguments);return o.sortable._restore(),o.sortable._isCustomHelperUsed=o!==l,l}:e},r.$watchCollection("uiSortable",function(e,t){var o=s(a);if(o){var n=f(e,t,o);n&&a.sortable("option",n)}},!0),f(E)}function C(){i?S():n.info("ui.sortable: ngModel not provided!",a),a.sortable(E)}function x(){return(!r.uiSortable||!r.uiSortable.disabled)&&(C(),x.cancelWatcher(),x.cancelWatcher=angular.noop,!0)}var _,$,E={},V={"ui-floating":void 0,"ui-model-items":e.items},w={create:null,start:null,activate:null,beforeStop:null,update:null,remove:null,receive:null,deactivate:null,stop:null},M={helper:null};if(angular.extend(E,V,e,r.uiSortable),!angular.element.fn||!angular.element.fn.jquery)return void n.error("ui.sortable: jQuery should be included before AngularJS!");x.cancelWatcher=angular.noop,x()||(x.cancelWatcher=r.$watch("uiSortable.disabled",x))}}}])},function(e,t){e.exports=angular}]);