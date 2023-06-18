/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 214:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

  // vim: set et sw=2 ts=2 sts=2 ff=unix fenc=utf8:
  // Author: Binux<i@binux.me>
  //         http://binux.me
  // Created on 2014-08-02 10:07:33
  var analyze_cookies, base, base1, containSpecial, exports, headers, jinja_globals, mime_type, post_data, replace_variables, rm_content, sort, utils, xhr,
  indexOf = [].indexOf;

window.jinja_globals = ['quote_chinese', 'int', 'float', 'bool', 'utf8', 'unicode', 'timestamp', 'date_time', 'is_num', 'add', 'sub', 'multiply', 'divide', 'Faker', 'b64decode', 'b64encode', 'to_uuid', 'md5', 'sha1', 'password_hash', 'hash', 'aes_encrypt', 'aes_decrypt', 'regex_replace', 'regex_escape', 'regex_search', 'regex_findall', 'ternary', 'random', 'shuffle', 'mandatory', 'type_debug', 'dict', 'lipsum', 'range', 'loop_length', 'loop_first', 'loop_last', 'loop_index', 'loop_index0', 'loop_depth', 'loop_depth0', 'loop_revindex', 'loop_revindex0'];

jinja_globals = window.jinja_globals;

if ((base = Array.prototype).some == null) {
  base.some = function(f) {
    var j, len, ref, x;
    ref = this;
    for (j = 0, len = ref.length; j < len; j++) {
      x = ref[j];
      if (f(x)) {
        return true;
      }
    }
    return false;
  };
}

if ((base1 = Array.prototype).every == null) {
  base1.every = function(f) {
    var j, len, ref, x;
    ref = this;
    for (j = 0, len = ref.length; j < len; j++) {
      x = ref[j];
      if (!f(x)) {
        return false;
      }
    }
    return true;
  };
}

utils = __webpack_require__(634);

containSpecial = RegExp(/[(\ )(\~)(\!)(\@)(\#)(\$)(\%)(\^)(\&)(\*)(\()(\))(\-)(\+)(\=)(\[)(\])(\{)(\})(\|)(\\)(\;)(\:)(\')(\")(\,)(\.)(\/)(\<)(\>)(\?)(\)]+/);

xhr = function(har) {
  var entry, h, j, len, ref;
  ref = har.log.entries;
  for (j = 0, len = ref.length; j < len; j++) {
    entry = ref[j];
    if (((function() {
      var l, len1, ref1, results;
      ref1 = entry.request.headers;
      results = [];
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        h = ref1[l];
        if (h.name === 'X-Requested-With' && h.value === 'XMLHttpRequest') {
          results.push(h);
        }
      }
      return results;
    })()).length > 0) {
      entry.filter_xhr = true;
    }
  }
  return har;
};

mime_type = function(har) {
  var entry, j, len, mt, ref, ref1, ref2;
  ref = har.log.entries;
  for (j = 0, len = ref.length; j < len; j++) {
    entry = ref[j];
    mt = (ref1 = entry.response) != null ? (ref2 = ref1.content) != null ? ref2.mimeType : void 0 : void 0;
    entry.filter_mimeType = (function() {
      switch (false) {
        case !!mt:
          return 'other';
        case mt.indexOf('audio') !== 0:
          return 'media';
        case mt.indexOf('image') !== 0:
          return 'image';
        case mt.indexOf('javascript') === -1:
          return 'javascript';
        case mt !== 'text/html':
          return 'document';
        case mt !== 'text/css' && mt !== 'application/x-pointplus':
          return 'style';
        // deepcode ignore DuplicateCaseBody: order is important
        case mt.indexOf('application') !== 0:
          return 'media';
        default:
          // deepcode ignore DuplicateCaseBody: order is important
          return 'other';
      }
    })();
  }
  return har;
};

analyze_cookies = function(har) {
  var cookie, cookie_jar, cookies, entry, error, h, header, j, l, len, len1, len2, len3, n, o, ref, ref1, ref2, ref3;
  // analyze where cookie from
  cookie_jar = new utils.CookieJar();
  ref = har.log.entries;
  for (j = 0, len = ref.length; j < len; j++) {
    entry = ref[j];
    cookies = {};
    ref1 = cookie_jar.getCookiesSync(entry.request.url, {
      now: new Date(entry.startedDateTime)
    });
    for (l = 0, len1 = ref1.length; l < len1; l++) {
      cookie = ref1[l];
      cookies[cookie.key] = cookie.value;
    }
    ref2 = entry.request.cookies;
    for (n = 0, len2 = ref2.length; n < len2; n++) {
      cookie = ref2[n];
      cookie.checked = false;
      if (cookie.name in cookies) {
        if (cookie.value === cookies[cookie.name]) {
          cookie.from_session = true;
          entry.filter_from_session = true;
        } else {
          cookie.cookie_changed = true;
          entry.filter_cookie_changed = true;
        }
      } else {
        //cookie_jar.setCookieSync(utils.Cookie.fromJSON(angular.toJson({
        //key: cookie.name
        //value: cookie.value
        //path: '/'
        //})), entry.request.url)
        cookie.cookie_added = true;
        entry.filter_cookie_added = true;
      }
    }
    ref3 = ((function() {
      var len3, p, ref3, ref4, results;
      ref4 = ((ref3 = entry.response) != null ? ref3.headers : void 0) || [];
      results = [];
      for (p = 0, len3 = ref4.length; p < len3; p++) {
        h = ref4[p];
        if (h.name.toLowerCase() === 'set-cookie') {
          results.push(h);
        }
      }
      return results;
    })()) || [];
    //cookie_jar.setCookieSync(utils.Cookie.fromJSON(angular.toJson({
    //key: cookie.name
    //value: cookie.value
    //path: '/'
    //})), entry.request.url)

    // update cookie from response
    for (o = 0, len3 = ref3.length; o < len3; o++) {
      header = ref3[o];
      entry.filter_set_cookie = true;
      try {
        cookie_jar.setCookieSync(header.value, entry.request.url, {
          now: new Date(entry.startedDateTime)
        });
      } catch (error1) {
        error = error1;
        console.error(error);
      }
    }
  }
  return har;
};

sort = function(har) {
  var ref;
  har.log.entries = (ref = har.log.entries) != null ? ref.sort(function(a, b) {
    if (a.pageref > b.pageref) {
      return 1;
    } else if (a.pageref < b.pageref) {
      return -1;
    } else if (a.startedDateTime > b.startedDateTime) {
      return 1;
    } else if (a.startedDateTime < b.startedDateTime) {
      return -1;
    } else {
      return 0;
    }
  }) : void 0;
  return har;
};

headers = function(har) {
  var entry, header, i, j, l, len, len1, ref, ref1, ref2, to_remove_headers;
  to_remove_headers = ['x-devtools-emulate-network-conditions-client-id', 'cookie', 'host', 'content-length'];
  ref = har.log.entries;
  for (j = 0, len = ref.length; j < len; j++) {
    entry = ref[j];
    ref1 = entry.request.headers;
    for (i = l = 0, len1 = ref1.length; l < len1; i = ++l) {
      header = ref1[i];
      if (ref2 = header.name.toLowerCase(), indexOf.call(to_remove_headers, ref2) < 0) {
        header.checked = true;
      } else {
        header.checked = false;
      }
    }
  }
  return har;
};

post_data = function(har) {
  var entry, error, j, key, len, ref, ref1, ref2, ref3, ref4, result, value;
  ref = har.log.entries;
  for (j = 0, len = ref.length; j < len; j++) {
    entry = ref[j];
    if (!((ref1 = entry.request.postData) != null ? ref1.text : void 0)) {
      continue;
    }
    if (!(((ref2 = entry.request.postData) != null ? (ref3 = ref2.mimeType) != null ? ref3.toLowerCase().indexOf("application/x-www-form-urlencoded") : void 0 : void 0) === 0)) {
      entry.request.postData.params = void 0;
      continue;
    }
    result = [];
    try {
      ref4 = utils.querystring_parse_with_variables(entry.request.postData.text);
      for (key in ref4) {
        value = ref4[key];
        result.push({
          name: key,
          value: value
        });
      }
      entry.request.postData.params = result;
    } catch (error1) {
      error = error1;
      console.error(error);
      entry.request.postData.params = void 0;
      continue;
    }
  }
  return har;
};

replace_variables = function(har, variables) {
  var changed, each, entry, error, j, k, key, l, len, len1, len2, n, obj, query, ref, ref1, ref2, ref3, ref4, url, v, value, variables_vk;
  variables_vk = {};
  for (k in variables) {
    v = variables[k];
    if ((k != null ? k.length : void 0) && (v != null ? v.length : void 0)) {
      variables_vk[v] = k;
    }
  }
  ref = har.log.entries;
  //console.log variables_vk, variables

  // url
  for (j = 0, len = ref.length; j < len; j++) {
    entry = ref[j];
    try {
      url = utils.url_parse(entry.request.url, true);
    } catch (error1) {
      error = error1;
      continue;
    }
    changed = false;
    ref1 = url.query;
    for (key in ref1) {
      value = ref1[key];
      if (value in variables_vk) {
        url.query[key] = `{{ ${variables_vk[value]} }}`;
        changed = true;
      }
    }
    if (changed) {
      query = utils.querystring_unparse_with_variables(url.query);
      if (query) {
        url.search = `?${query}`;
      } else {
        url.search = "";
      }
    }
    entry.request.url = utils.url_unparse(url);
    entry.request.queryString = utils.dict2list(url.query);
    ref2 = har.log.entries;
    // post data
    for (l = 0, len1 = ref2.length; l < len1; l++) {
      entry = ref2[l];
      if (((ref3 = entry.request.postData) != null ? ref3.params : void 0) == null) {
        continue;
      }
      changed = false;
      ref4 = entry.request.postData.params;
      for (n = 0, len2 = ref4.length; n < len2; n++) {
        each = ref4[n];
        if (each.value in variables_vk) {
          each.value = `{{ ${variables_vk[each.value]} }}`;
          changed = true;
        }
      }
      if (changed) {
        obj = utils.list2dict(entry.request.postData.params);
        entry.request.postData.text = utils.querystring_unparse_with_variables(obj);
      }
    }
  }
  return har;
};

rm_content = function(har) {
  var entry, j, len, ref, ref1, ref2, ref3;
  ref = har.log.entries;
  for (j = 0, len = ref.length; j < len; j++) {
    entry = ref[j];
    if (((ref1 = entry.response) != null ? (ref2 = ref1.content) != null ? ref2.text : void 0 : void 0) != null) {
      if ((ref3 = entry.response) != null) {
        ref3.content.text = void 0;
      }
    }
  }
  return har;
};

exports = {
  analyze: function(har, variables = {}) {
    if (har.log != null) {
      return replace_variables(xhr(mime_type(analyze_cookies(headers(sort(post_data(rm_content(har))))))), variables);
    } else {
      return har;
    }
  },
  recommend_default: function(har) {
    var domain, entry, j, len, ref, ref1, ref2, ref3, ref4;
    domain = null;
    ref = har.log.entries;
    for (j = 0, len = ref.length; j < len; j++) {
      entry = ref[j];
      if (!domain) {
        domain = utils.get_domain(entry.request.url);
      }
      if (exports.variables_in_entry(entry).length > 0) {
        entry.recommend = true;
      } else if (domain !== utils.get_domain(entry.request.url) || ((ref1 = (ref2 = entry.response) != null ? ref2.status : void 0) === 304 || ref1 === 0)) {
        entry.recommend = false;
      } else if (Math.floor(((ref3 = entry.response) != null ? ref3.status : void 0) / 100) === 3 || ((ref4 = entry.response.cookies) != null ? ref4.length : void 0) > 0 || entry.request.method === 'POST') {
        entry.recommend = true;
      } else {
        entry.recommend = false;
      }
    }
    return har;
  },
  recommend: function(har) {
    var _related_cookies, c, checked, cookie, e, entry, j, l, len, len1, len2, len3, n, o, p, ref, ref1, ref2, ref3, ref4, related_cookies, set_cookie, start_time, started;
    ref = har.log.entries;
    for (j = 0, len = ref.length; j < len; j++) {
      entry = ref[j];
      entry.recommend = entry.checked ? true : false;
    }
    checked = (function() {
      var l, len1, ref1, results;
      ref1 = har.log.entries;
      results = [];
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        e = ref1[l];
        if (e.checked) {
          results.push(e);
        }
      }
      return results;
    })();
    if (checked.length === 0) {
      return exports.recommend_default(har);
    }
    related_cookies = [];
    for (l = 0, len1 = checked.length; l < len1; l++) {
      entry = checked[l];
      ref1 = entry.request.cookies;
      for (n = 0, len2 = ref1.length; n < len2; n++) {
        cookie = ref1[n];
        related_cookies.push(cookie.name);
      }
    }
    started = false;
    ref2 = har.log.entries;
    for (o = ref2.length - 1; o >= 0; o += -1) {
      entry = ref2[o];
      if (!started) {
        started = entry.checked;
      }
      if (!started) {
        continue;
      }
      if (!((ref3 = entry.response) != null ? ref3.cookies : void 0)) {
        continue;
      }
      start_time = new Date(entry.startedDateTime);
      set_cookie = (function() {
        var len3, p, ref4, ref5, results;
        ref5 = (ref4 = entry.response) != null ? ref4.cookies : void 0;
        results = [];
        for (p = 0, len3 = ref5.length; p < len3; p++) {
          cookie = ref5[p];
          if (!cookie.expires || (new Date(cookie.expires)) > start_time) {
            results.push(cookie.name);
          }
        }
        return results;
      })();
      _related_cookies = (function() {
        var len3, p, results;
        results = [];
        for (p = 0, len3 = related_cookies.length; p < len3; p++) {
          c = related_cookies[p];
          if (indexOf.call(set_cookie, c) < 0) {
            results.push(c);
          }
        }
        return results;
      })();
      if (related_cookies.length > _related_cookies.length) {
        entry.recommend = true;
        related_cookies = _related_cookies;
        ref4 = entry.request.cookies;
        // add pre request cookie
        for (p = 0, len3 = ref4.length; p < len3; p++) {
          cookie = ref4[p];
          related_cookies.push(cookie.name);
        }
      }
    }
    return har;
  },
  variables: function(string) {
    var j, len, list_tmp, list_tmp_v, m, re, tmp, tmp1, tmp_v, variables_results;
    re = /{{\s*([\w]+)[^}]*?\s*}}/g;
    variables_results = [];
    while (m = re.exec(string)) {
      if (jQuery.inArray(m[1], jinja_globals) < 0) {
        variables_results.push(m[1]);
      } else {
        tmp = /{{\s*\w+\s*\((.*)\)[^}]*?\s*}}/;
        tmp = tmp.exec(m[0]);
        if ((tmp != null ? tmp.length : void 0) > 1) {
          list_tmp = tmp[1].split(",");
          for (j = 0, len = list_tmp.length; j < len; j++) {
            list_tmp_v = list_tmp[j];
            tmp1 = /(^[^\d\"\'][\w]+).*?/;
            tmp_v = tmp1.exec(list_tmp_v);
            if ((tmp_v != null) && !containSpecial.test(tmp_v[1]) && jQuery.inArray(tmp_v[1], jinja_globals) < 0) {
              variables_results.push(tmp_v[1]);
            }
          }
        }
      }
    }
    return variables_results;
  },
  variables_in_entry: function(entry) {
    var c, h, ref, result;
    result = [];
    [
      [entry.request.url],
      (function() {
        var j,
      len,
      ref,
      results;
        ref = entry.request.headers;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          h = ref[j];
          if (h.checked) {
            results.push(h.name);
          }
        }
        return results;
      })(),
      (function() {
        var j,
      len,
      ref,
      results;
        ref = entry.request.headers;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          h = ref[j];
          if (h.checked) {
            results.push(h.value);
          }
        }
        return results;
      })(),
      (function() {
        var j,
      len,
      ref,
      results;
        ref = entry.request.cookies;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          c = ref[j];
          if (c.checked) {
            results.push(c.name);
          }
        }
        return results;
      })(),
      (function() {
        var j,
      len,
      ref,
      results;
        ref = entry.request.cookies;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          c = ref[j];
          if (c.checked) {
            results.push(c.value);
          }
        }
        return results;
      })(),
      [(ref = entry.request.postData) != null ? ref.text : void 0]
    ].map(function(list) {
      var each, j, len, results, string;
      results = [];
      for (j = 0, len = list.length; j < len; j++) {
        string = list[j];
        results.push((function() {
          var l, len1, ref1, ref2, results1;
          ref1 = exports.variables(string);
          results1 = [];
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            each = ref1[l];
            if (ref2 = each != null, indexOf.call(result, ref2) < 0) {
              results1.push(result.push(each));
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        })());
      }
      return results;
    });
    if (result.length > 0) {
      entry.filter_variables = true;
    } else {
      entry.filter_variables = false;
    }
    return result;
  },
  find_variables: function(har) {
    var each, entry, j, l, len, len1, ref, ref1, result;
    result = [];
    ref = har.log.entries;
    for (j = 0, len = ref.length; j < len; j++) {
      entry = ref[j];
      ref1 = this.variables_in_entry(entry);
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        each = ref1[l];
        result.push(each);
      }
    }
    return result;
  }
};

module.exports = exports;


/***/ }),

/***/ 765:
/***/ (() => {

  // vim: set et sw=2 ts=2 sts=2 ff=unix fenc=utf8:
  // Author: Binux<i@binux.me>
  //         http://binux.me
  // Created on 2014-08-04 19:34:02
angular.module('contenteditable', []).directive('contenteditable', [
  '$timeout',
  function($timeout) {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function(scope,
  element,
  attrs,
  ngModel) {
        var oldRender;
        if (!ngModel) {
          return;
        }
        element.bind('input',
  function(e) {
          return scope.$apply(function() {
            var text;
            text = element.text();
            ngModel.$setViewValue(text);
            if (text === '') {
              return $timeout(function() {
                if (element.prev().hasClass('contentedit-wrapper')) {
                  return element.prev().click();
                } else {
                  element[0].blur();
                  return element[0].focus();
                }
              });
            }
          });
        });
        element.bind('blur',
  function(e) {
          var text;
          text = element.text();
          if (ngModel.$viewValue !== text) {
            return ngModel.$render();
          }
        });
        oldRender = ngModel.$render;
        return ngModel.$render = function() {
          if (!!oldRender) {
            oldRender();
          }
          if (!element.is(':focus')) {
            return element.text(ngModel.$viewValue || '');
          }
        };
      }
    };
  }
]);


/***/ }),

/***/ 76:
/***/ (() => {

// vim: set et sw=2 ts=2 sts=2 ff=unix fenc=utf8:
// Author: Binux<i@binux.me>
//         http://binux.me
// Created on 2014-08-05 14:47:55
angular.module('editablelist', []).directive('editablelist', function() {
  return {
    restrict: 'A',
    scope: true,
    templateUrl: '/static/har/editablelist.html',
    link: function($scope, $element, $attr, ctrl, $transclude) {
      $scope.$filter = $scope.$eval($attr.filter);
      return $scope.$watch($attr.editablelist, function(value) {
        return $scope.$list = value;
      });
    }
  };
});


/***/ }),

/***/ 875:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

// vim: set et sw=2 ts=2 sts=2 ff=unix fenc=utf8:
// Author: Binux<i@binux.me>
//         http://binux.me
// Created on 2014-08-06 21:16:15
var api_host, utils;

__webpack_require__(765);

__webpack_require__(76);

utils = __webpack_require__(634);

// local_protocol = window.location.protocol
// local_host = window.location.host
api_host = "api:/";

angular.module('entry_editor', ['contenteditable']).controller('EntryCtrl', function($scope, $rootScope, $sce, $http) {
  var changing;
  // init
  $scope.panel = 'request';
  $scope.copy_entry = null;
  // on edit event
  $scope.$on('edit-entry', function(ev, entry) {
    var base, base1, base2;
    console.info(entry);
    $scope.entry = entry;
    if ((base = $scope.entry).success_asserts == null) {
      base.success_asserts = [
        {
          re: '' + $scope.entry.response.status,
          from: 'status'
        }
      ];
    }
    if ((base1 = $scope.entry).failed_asserts == null) {
      base1.failed_asserts = [];
    }
    if ((base2 = $scope.entry).extract_variables == null) {
      base2.extract_variables = [];
    }
    $scope.copy_entry = JSON.parse(utils.storage.get('copy_request'));
    angular.element('#edit-entry').modal('show');
    return $scope.alert_hide();
  });
  // on show event
  // angular.element('#edit-entry').on('show.bs.modal', (ev) ->
  //   $rootScope.$broadcast('har-change')
  // )

  // on saved event
  angular.element('#edit-entry').on('hidden.bs.modal', function(ev) {
    var ref;
    if ((ref = $scope.panel) === 'preview-headers' || ref === 'preview') {
      $scope.$apply(function() {
        var env, i, len, ref1, ret, rule;
        $scope.panel = 'test';
        // update env from extract_variables
        env = utils.list2dict($scope.env);
        ref1 = $scope.entry.extract_variables;
        for (i = 0, len = ref1.length; i < len; i++) {
          rule = ref1[i];
          if (ret = typeof $scope.preview_match === "function" ? $scope.preview_match(rule.re, rule.from) : void 0) {
            env[rule.name] = ret;
          }
        }
        return $scope.env = utils.dict2list(env);
      });
    }
    $scope.$apply(function() {
      return $scope.preview = void 0;
    });
    console.debug('har-change');
    return $rootScope.$broadcast('har-change');
  });
  // alert message for test panel
  $scope.alert = function(message) {
    return angular.element('.panel-test .alert').text(message).show();
  };
  $scope.alert_hide = function() {
    return angular.element('.panel-test .alert').hide();
  };
  // sync url with query string
  changing = '';
  $scope.$watch('entry.request.url', function() {
    var error, queryString;
    if (changing && changing !== 'url') {
      changing = '';
      return;
    }
    if ($scope.entry == null) {
      return;
    }
    if ($scope.entry.request.url.substring(0, 2) === "{%") {
      return;
    }
    try {
      queryString = utils.dict2list(utils.querystring_parse_with_variables(utils.url_parse($scope.entry.request.url).query));
    } catch (error1) {
      error = error1;
      queryString = [];
    }
    if (!changing && !angular.equals(queryString, $scope.entry.request.queryString)) {
      $scope.entry.request.queryString = queryString;
      return changing = 'url';
    }
  });
  // sync query string with url
  $scope.$watch('entry.request.queryString', (function() {
    var query, url;
    if (changing && changing !== 'qs') {
      changing = '';
      return;
    }
    if ($scope.entry == null) {
      return;
    }
    if ($scope.entry.request.url.substring(0, 2) === "{%") {
      return;
    }
    url = utils.url_parse($scope.entry.request.url);
    if ((url != null) && url.path.indexOf('%7B%7B') > -1) {
      url.path = utils.path_unparse_with_variables(url.path);
      url.pathname = utils.path_unparse_with_variables(url.pathname);
    }
    url.path = url.path.replace('https:///', 'https://');
    query = utils.list2dict($scope.entry.request.queryString);
    query = utils.querystring_unparse_with_variables(query);
    if (query) {
      url.search = `?${query}`;
    } else {
      url.search = "";
    }
    url = utils.url_unparse(url);
    if (!changing && url !== $scope.entry.request.url) {
      $scope.entry.request.url = url;
      return changing = 'qs';
    }
  }), true);
  // sync params with text
  $scope.$watch('entry.request.postData.params', (function() {
    var obj, ref, ref1, ref2, ref3;
    if (((ref = $scope.entry) != null ? (ref1 = ref.request) != null ? ref1.postData : void 0 : void 0) == null) {
      return;
    }
    if (!(((ref2 = $scope.entry.request.postData) != null ? (ref3 = ref2.mimeType) != null ? ref3.toLowerCase().indexOf("application/x-www-form-urlencoded") : void 0 : void 0) === 0)) {
      return;
    }
    obj = utils.list2dict($scope.entry.request.postData.params);
    return $scope.entry.request.postData.text = utils.querystring_unparse_with_variables(obj);
  }), true);
  // $scope.$watch('entry.request.postData.text', (function() {
  //   var obj, ref, ref1;
  //   if (((ref = $scope.entry) != null ? (ref1 = ref.request) != null ? ref1.postData : void 0 : void 0) == null) {
  //     return;
  //   }
  //   obj = utils.querystring_parse($scope.entry.request.postData.text);
  //   return $scope.entry.request.postData.params = utils.dict2list(obj);
  // }), true);

  // helper for delete item from array
  $scope.delete = function(hashKey, array) {
    var each, i, index, len;
    for (index = i = 0, len = array.length; i < len; index = ++i) {
      each = array[index];
      if (each.$$hashKey === hashKey) {
        array.splice(index, 1);
        return;
      }
    }
  };
  // variables template
  $scope.variables_wrapper = function(string, place_holder = '') {
    var re;
    string = (string || place_holder).toString();
    re = /{{\s*([\w]+)[^}]*?\s*}}/g;
    return $sce.trustAsHtml(string.replace(re, '<span class="label label-primary">$&</span>'));
  };
  $scope.insert_request = function(pos, entry) {
    var current_pos;
    if (pos == null) {
      pos = 1;
    }
    if ((current_pos = $scope.$parent.har.log.entries.indexOf($scope.entry)) === -1) {
      $scope.alert("can't find position to add request");
      return;
    }
    current_pos += pos;
    $scope.$parent.har.log.entries.splice(current_pos, 0, entry);
    $rootScope.$broadcast('har-change');
    angular.element('#edit-entry').modal('hide');
    return true;
  };
  $scope.add_request = function(pos) {
    return $scope.insert_request(pos, {
      checked: false,
      pageref: $scope.entry.pageref,
      recommend: true,
      request: {
        method: 'GET',
        url: '',
        postData: {
          text: ''
        },
        headers: [],
        cookies: []
      },
      response: {}
    });
  };
  $scope.add_for_start = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: '循环开始',
      request: {
        method: 'GET',
        url: '{% for variable in variables %}',
        postData: {
          text: ''
        },
        headers: [],
        cookies: []
      },
      response: {},
      success_asserts: []
    });
  };
  $scope.add_for_end = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: '循环块结束',
      request: {
        method: 'GET',
        url: '{% endfor %}',
        postData: {
          text: ''
        },
        headers: [],
        cookies: []
      },
      response: {},
      success_asserts: []
    });
  };
  $scope.add_if_start = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: '判断条件成立',
      request: {
        method: 'GET',
        url: '{% if Conditional_Expression %}',
        postData: {
          text: ''
        },
        headers: [],
        cookies: []
      },
      response: {},
      success_asserts: []
    });
  };
  $scope.add_if_else = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: '判断条件不成立',
      request: {
        method: 'GET',
        url: '{% else %}',
        postData: {
          text: ''
        },
        headers: [],
        cookies: []
      },
      response: {},
      success_asserts: []
    });
  };
  $scope.add_if_end = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: '判断块结束',
      request: {
        method: 'GET',
        url: '{% endif %}',
        postData: {
          text: ''
        },
        headers: [],
        cookies: []
      },
      response: {},
      success_asserts: []
    });
  };
  $scope.add_timestamp_request = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: '返回当前时间戳和时间',
      request: {
        method: 'GET',
        url: [api_host, '/util/timestamp'].join(''),
        postData: {
          text: ''
        },
        headers: [],
        cookies: []
      },
      response: {},
      success_asserts: [
        {
          re: "200",
          from: "status"
        }
      ]
    });
  };
  $scope.add_delay_request = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: '延时3秒',
      request: {
        method: 'GET',
        url: [api_host, '/util/delay/3'].join(''),
        postData: {
          text: ''
        },
        headers: [],
        cookies: []
      },
      response: {},
      success_asserts: [
        {
          re: "200",
          from: "status"
        }
      ]
    });
  };
  $scope.add_unicode_request = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: 'Unicode转换',
      request: {
        method: 'POST',
        url: [api_host, '/util/unicode'].join(''),
        headers: [],
        cookies: [],
        postData: {
          text: "content="
        }
      },
      response: {},
      success_asserts: [
        {
          re: "200",
          from: "status"
        },
        {
          re: "\"状态\": \"200\"",
          from: "content"
        }
      ],
      extract_variables: [
        {
          name: '',
          re: '"转换后": "(.*)"',
          from: 'content'
        }
      ]
    });
  };
  $scope.add_urldecode_request = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: 'URL解码',
      request: {
        method: 'POST',
        url: [api_host, '/util/urldecode'].join(''),
        headers: [],
        cookies: [],
        postData: {
          text: "content="
        }
      },
      response: {},
      success_asserts: [
        {
          re: "200",
          from: "status"
        },
        {
          re: "\"状态\": \"200\"",
          from: "content"
        }
      ],
      extract_variables: [
        {
          name: '',
          re: '"转换后": "(.*)"',
          from: 'content'
        }
      ]
    });
  };
  $scope.add_gb2312_request = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: 'GB2312编码',
      request: {
        method: 'POST',
        url: [api_host, '/util/gb2312'].join(''),
        headers: [],
        cookies: [],
        postData: {
          text: "content="
        }
      },
      response: {},
      success_asserts: [
        {
          re: "200",
          from: "status"
        },
        {
          re: "\"状态\": \"200\"",
          from: "content"
        }
      ],
      extract_variables: [
        {
          name: '',
          re: '"转换后": "(.*)"',
          from: 'content'
        }
      ]
    });
  };
  $scope.add_regex_request = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: '正则提取',
      request: {
        method: 'POST',
        url: [api_host, '/util/regex'].join(''),
        headers: [],
        cookies: [],
        postData: {
          text: "p=&data="
        }
      },
      response: {},
      success_asserts: [
        {
          re: "200",
          from: "status"
        },
        {
          re: "\"状态\": \"OK\"",
          from: "content"
        }
      ],
      extract_variables: [
        {
          name: '',
          re: '"1": "(.*)"',
          from: 'content'
        }
      ]
    });
  };
  $scope.add_string_replace_request = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: '字符串替换',
      request: {
        method: 'POST',
        url: [api_host, '/util/string/replace'].join(''),
        headers: [],
        cookies: [],
        postData: {
          text: "r=json&p=&s=&t="
        }
      },
      response: {},
      success_asserts: [
        {
          re: "200",
          from: "status"
        },
        {
          re: "\"状态\": \"OK\"",
          from: "content"
        }
      ],
      extract_variables: [
        {
          name: '',
          re: '"处理后字符串": "(.*)"',
          from: 'content'
        }
      ]
    });
  };
  $scope.add_RSA_Encrypt_request = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: 'RSA加密',
      request: {
        method: 'POST',
        url: [api_host, '/util/rsa'].join(''),
        headers: [],
        cookies: [],
        postData: {
          text: "f=encode&key=&data="
        }
      },
      response: {},
      success_asserts: [
        {
          re: "200",
          from: "status"
        }
      ],
      extract_variables: [
        {
          name: '',
          re: '(.*)',
          from: 'content'
        }
      ]
    });
  };
  $scope.add_RSA_Decrypt_request = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: 'RSA解密',
      request: {
        method: 'POST',
        url: [api_host, '/util/rsa'].join(''),
        headers: [],
        cookies: [],
        postData: {
          text: "f=decode&key=&data="
        }
      },
      response: {},
      success_asserts: [
        {
          re: "200",
          from: "status"
        }
      ],
      extract_variables: [
        {
          name: '',
          re: '(.*)',
          from: 'content'
        }
      ]
    });
  };
  $scope.add_read_notepad_request = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: '读取记事本',
      variables: {
        qd_email: "",
        qd_pwd: ""
      },
      request: {
        method: 'POST',
        url: [api_host, '/util/toolbox/notepad'].join(''),
        headers: [],
        cookies: [],
        postData: {
          text: "email={{qd_email|urlencode}}&pwd={{md5(qd_pwd)|urlencode}}&id_notepad=1&f=read"
        }
      },
      response: {},
      success_asserts: [
        {
          re: "200",
          from: "status"
        }
      ],
      extract_variables: [
        {
          name: '',
          re: '([\s\S]*)',
          from: 'content'
        }
      ]
    });
  };
  $scope.add_append_notepad_request = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: '追加记事本',
      request: {
        method: 'POST',
        url: [api_host, '/util/toolbox/notepad'].join(''),
        headers: [],
        cookies: [],
        postData: {
          text: "email={{qd_email|urlencode}}&pwd={{md5(qd_pwd)|urlencode}}&id_notepad=1&f=append&data={{notebook_content|urlencode}}"
        }
      },
      response: {},
      success_asserts: [
        {
          re: "200",
          from: "status"
        }
      ],
      extract_variables: [
        {
          name: '',
          re: '([\s\S]*)',
          from: 'content'
        }
      ]
    });
  };
  $scope.add_dddd_OCR_request = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: 'OCR识别',
      request: {
        method: 'POST',
        url: [api_host, '/util/dddd/ocr'].join(''),
        headers: [
          {
            "name": "Content-Type",
            "value": "application/json",
            "checked": true
          }
        ],
        cookies: [],
        postData: {
          text: "{\"img\":\"\",\"imgurl\":\"\",\"old\":\"False\",\"extra_onnx_name\":\"\"}"
        }
      },
      response: {},
      success_asserts: [
        {
          re: "200",
          from: "status"
        },
        {
          re: "\"状态\": \"OK\"",
          from: "content"
        }
      ],
      extract_variables: [
        {
          name: '',
          re: '"Result": "(.*)"',
          from: 'content'
        }
      ]
    });
  };
  $scope.add_dddd_DET_request = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: '目标检测',
      request: {
        method: 'POST',
        url: [api_host, '/util/dddd/det'].join(''),
        headers: [
          {
            "name": "Content-Type",
            "value": "application/json",
            "checked": true
          }
        ],
        cookies: [],
        postData: {
          text: "{\"img\":\"\",\"imgurl\":\"\"}"
        }
      },
      response: {},
      success_asserts: [
        {
          re: "200",
          from: "status"
        },
        {
          re: "\"状态\": \"OK\"",
          from: "content"
        }
      ],
      extract_variables: [
        {
          name: '',
          re: '(\\d+, \\d+, \\d+, \\d+)',
          from: 'content'
        },
        {
          name: '',
          re: '/(\\d+, \\d+, \\d+, \\d+)/g',
          from: 'content'
        }
      ]
    });
  };
  $scope.add_dddd_SLIDE_request = function() {
    return $scope.insert_request(1, {
      checked: true,
      pageref: $scope.entry.pageref,
      recommend: true,
      comment: '滑块识别',
      request: {
        method: 'POST',
        url: [api_host, '/util/dddd/slide'].join(''),
        headers: [
          {
            "name": "Content-Type",
            "value": "application/json",
            "checked": true
          }
        ],
        cookies: [],
        postData: {
          text: "{\"imgtarget\":\"\",\"imgbg\":\"\",\"comparison\":\"False\",\"simple_target\":\"False\"}"
        }
      },
      response: {},
      success_asserts: [
        {
          re: "200",
          from: "status"
        },
        {
          re: "\"状态\": \"OK\"",
          from: "content"
        }
      ],
      extract_variables: [
        {
          name: '',
          re: '(\\d+, \\d+)',
          from: 'content'
        },
        {
          name: '',
          re: '/(\\d+, \\d+)/g',
          from: 'content'
        }
      ]
    });
  };
  $scope.copy_request = function() {
    if (!$scope.entry) {
      $scope.alert("can't find position to paste request");
      return;
    }
    $scope.copy_entry = angular.copy($scope.entry);
    return utils.storage.set('copy_request', angular.toJson($scope.copy_entry));
  };
  $scope.paste_request = function(pos) {
    var base;
    if ((base = $scope.copy_entry).comment == null) {
      base.comment = '';
    }
    $scope.copy_entry.comment = 'Copy_' + $scope.copy_entry.comment;
    $scope.copy_entry.pageref = $scope.entry.pageref;
    return $scope.insert_request(pos, $scope.copy_entry);
  };
  $scope.del_request = function(pos) {
    var current_pos;
    if (pos === null) {
      pos = 1;
    }
    if ((current_pos = $scope.$parent.har.log.entries.indexOf($scope.entry)) === -1) {
      $scope.alert("can't find position to add request");
      return;
    }
    current_pos += pos;
    $scope.$parent.har.log.entries.splice(current_pos, 1);
    $rootScope.$broadcast('har-change');
    return angular.element('#edit-entry').modal('hide');
  };
  // fetch test
  return $scope.do_test = function() {
    var c, h, ref, ref1;
    NProgress.start();
    angular.element('.do-test').button('loading');
    NProgress.inc();
    $http.post('/har/test', {
      request: {
        method: $scope.entry.request.method,
        url: $scope.entry.request.url,
        headers: (function() {
          var i, len, ref, results;
          ref = $scope.entry.request.headers;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            h = ref[i];
            if (h.checked) {
              results.push({
                name: h.name,
                value: h.value
              });
            }
          }
          return results;
        })(),
        cookies: (function() {
          var i, len, ref, results;
          ref = $scope.entry.request.cookies;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            c = ref[i];
            if (c.checked) {
              results.push({
                name: c.name,
                value: c.value
              });
            }
          }
          return results;
        })(),
        data: (ref = $scope.entry.request.postData) != null ? ref.text : void 0,
        mimeType: (ref1 = $scope.entry.request.postData) != null ? ref1.mimeType : void 0
      },
      rule: {
        success_asserts: $scope.entry.success_asserts,
        failed_asserts: $scope.entry.failed_asserts,
        extract_variables: $scope.entry.extract_variables
      },
      env: {
        variables: utils.list2dict($scope.env),
        session: $scope.session
      }
    }).then(function(res) {
      var config, data, headers, ref2, ref3, status;
      NProgress.inc();
      data = res.data;
      status = res.status;
      headers = res.headers;
      config = res.config;
      angular.element('.do-test').button('reset');
      if (status !== 200) {
        $scope.alert(data);
        return;
      }
      $scope.preview = data.har;
      $scope.preview.success = data.success;
      $scope.env = utils.dict2list(data.env.variables);
      $scope.session = data.env.session;
      $scope.panel = 'preview';
      if (((ref2 = data.har.response) != null ? (ref3 = ref2.content) != null ? ref3.text : void 0 : void 0) != null) {
        setTimeout((function() {
          return angular.element('.panel-preview iframe').attr("src", `data:${data.har.response.content.mimeType};base64,${data.har.response.content.text}`);
        }), 0);
      }
      return NProgress.done();
    }, function(res) {
      var config, data, headers, status;
      data = res.data;
      status = res.status;
      headers = res.headers;
      config = res.config;
      angular.element('.do-test').button('reset');
      console.error('Error_Message', res);
      $scope.alert(data || res.statusText || 'net::ERR_CONNECTION_REFUSED');
      return NProgress.done();
    });
    NProgress.inc();
    $scope.preview_match = function(re, from) {
      var content, data, error, header, i, len, m, match, ref2, ref3, result, tmp;
      data = null;
      if (!from) {
        return null;
      } else if (from === 'content') {
        if (typeof $scope.preview === 'undefined') {
          return false;
        }
        content = (ref2 = $scope.preview.response) != null ? ref2.content : void 0;
        if ((content == null) || (content.text == null)) {
          return null;
        }
        if (!content.decoded) {
          content.decoded = atob(content.text);
        }
        data = content.decoded;
      } else if (from === 'status' & $scope.preview !== void 0) {
        data = '' + $scope.preview.response.status;
      } else if (from.indexOf('header-') === 0) {
        from = from.slice(7);
        ref3 = $scope.preview.response.headers;
        for (i = 0, len = ref3.length; i < len; i++) {
          header = ref3[i];
          if (header.name.toLowerCase() === from) {
            data = header.value;
          }
        }
      } else if (from === 'header') {
        data = ((function() {
          var j, len1, ref4, results;
          ref4 = $scope.preview.response.headers;
          results = [];
          for (j = 0, len1 = ref4.length; j < len1; j++) {
            h = ref4[j];
            results.push(h.name + ': ' + h.value);
          }
          return results;
        })()).join("\n");
      }
      if (!data) {
        return null;
      }
      try {
        if (match = re.match(/^\/(.*?)\/([gimsu]*)$/)) {
          if (match[1]) {
            re = new RegExp(match[1], match[2]);
          } else {
            throw new Error(match[0](+' is not allowed!'));
          }
        } else {
          re = new RegExp(re);
        }
      } catch (error1) {
        error = error1;
        console.error(error.message);
        return error.message;
      }
      if (re.global) {
        try {
          result = [];
          tmp = re.lastIndex;
          while (m = re.exec(data)) {
            result.push(m[1] ? m[1] : m[0]);
            if (m[0] === '') {
              re.lastIndex++;
            }
          }
        } catch (error1) {
          // throw new Error('the RegExp "' + re.toString() +'" has caused a loop error! Try using stringObject.match(regexp) method on this stringobject...' )
          error = error1;
          console.error(error.message);
          result = data.match(re);
        }
        console.log('The original result is ', result);
        console.log('The result of toString() is ' + result.toString());
        return result;
      } else {
        if (m = data.match(re)) {
          if (m[1]) {
            return m[1];
          } else {
            return m[0];
          }
        }
        // return m[1]
        return null;
      }
    };
    return NProgress.inc();
  };
});

//# eof


/***/ }),

/***/ 426:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

  // vim: set et sw=2 ts=2 sts=2 ff=unix fenc=utf8:
  // Author: Binux<i@binux.me>
  //         http://binux.me
  // Created on 2014-08-06 21:14:54
var analysis, utils,
  indexOf = [].indexOf;

analysis = __webpack_require__(214);

utils = __webpack_require__(634);

angular.module('entry_list', []).controller('EntryList', function($scope, $rootScope, $http) {
  var har2tpl;
  $scope.filter = {};
  // on uploaded event
  $rootScope.$on('har-loaded', function(ev, data) {
    var x;
    console.info(data);
    $scope.data = data;
    window.global_har = $scope.data;
    $scope.filename = data.filename;
    $scope.har = data.har;
    $scope.init_env = data.env;
    $scope.env = utils.dict2list(data.env);
    $scope.session = [];
    $scope.setting = data.setting;
    $scope.readonly = data.readonly || !HASUSER;
    $scope.is_check_all = false;
    $scope.update_checked_status();
    $scope.recommend();
    if (((function() {
      var i, len, ref, results;
      ref = $scope.har.log.entries;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        x = ref[i];
        if (x.recommend) {
          results.push(x);
        }
      }
      return results;
    })()).length > 0) {
      $scope.filter.recommend = true;
    }
    if (!$scope.readonly) {
      utils.storage.set('har_filename', $scope.filename);
      utils.storage.set('har_env', $scope.env);
      if (data.upload) {
        return utils.storage.set('har_har', $scope.har);
      } else {
        return utils.storage.del('har_har');
      }
    }
  });
  $scope.$on('har-change', function() {
    return $scope.save_change();
  });
  $scope.save_change_storage = utils.debounce((function() {
    if ($scope.filename && !$scope.readonly) {
      console.debug('local saved');
      resortEntryList();
      sortRequest($('#sortBtn')[0]);
      return utils.storage.set('har_har', $scope.har);
    }
  }), 1);
  $scope.save_change = function() {
    $scope.update_checked_status();
    return $scope.save_change_storage();
  };
  $scope.update_checked_status = utils.debounce((function() {
    var no_checked;
    no_checked = (function() {
      var e, i, len, ref;
      ref = $scope.har.log.entries;
      for (i = 0, len = ref.length; i < len; i++) {
        e = ref[i];
        if (!e.checked) {
          return e;
        }
      }
    })();
    $scope.is_check_all = no_checked === void 0;
    return $scope.$apply();
  }), 1);
  $scope.check_all = function() {
    var entry, i, len, ref;
    $scope.is_check_all = !$scope.is_check_all;
    ref = $scope.har.log.entries;
    for (i = 0, len = ref.length; i < len; i++) {
      entry = ref[i];
      if (entry.checked !== $scope.is_check_all) {
        entry.checked = $scope.is_check_all;
      }
    }
    return $scope.save_change_storage();
  };
  $scope.inverse = function() {
    var entry, i, len, ref;
    ref = $scope.har.log.entries;
    for (i = 0, len = ref.length; i < len; i++) {
      entry = ref[i];
      entry.checked = !entry.checked;
    }
    return $scope.save_change_storage();
  };
  $scope.status_label = function(status) {
    if (Math.floor(status / 100) === 2) {
      return 'label-success';
    } else if (Math.floor(status / 100) === 3) {
      return 'label-info';
    } else if (status === 0) {
      return 'label-danger';
    } else {
      return 'label-warning';
    }
  };
  $scope.variables_in_entry = analysis.variables_in_entry;
  $scope.badge_filter = function(update) {
    var filter, key, value;
    filter = angular.copy($scope.filter);
    for (key in update) {
      value = update[key];
      filter[key] = value;
    }
    return filter;
  };
  $scope.track_item = function() {
    $scope.filted = [];
    return function(item) {
      $scope.filted.push(item);
      return true;
    };
  };
  $scope.edit = function(entry) {
    $scope.$broadcast('edit-entry', entry);
    return false;
  };
  $scope.recommend = function() {
    return analysis.recommend($scope.har);
  };
  $scope.download = function() {
    $scope.pre_save();
    // tpl = btoa(unescape(encodeURIComponent(angular.toJson(har2tpl($scope.har)))))
    // angular.element('#download-har').attr('download', $scope.setting.sitename+'.har').attr('href', 'data:application/json;base64,'+tpl)
    $scope.export_add($scope.setting.sitename + '.har', decodeURIComponent(encodeURIComponent(angular.toJson(har2tpl($scope.har)))));
    return true;
  };
  $scope.ev_click = function(obj) {
    var ev;
    ev = document.createEvent("MouseEvents");
    ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    return obj.dispatchEvent(ev);
  };
  $scope.export_add = function(name, data) {
    var export_blob, save_link, urlObject;
    urlObject = window.URL || window.webkitURL || window;
    export_blob = new Blob([data], {
      type: "application/json"
    });
    save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    return $scope.ev_click(save_link);
  };
  $scope.pre_save = function() {
    var alert_elem, alert_info_elem, base, base1, base2, error, first_entry, parsed_url;
    alert_elem = angular.element('#save-har .alert-danger').hide();
    alert_info_elem = angular.element('#save-har .alert-info').hide();
    first_entry = (function() {
      var entry, i, len, ref, ref1, ref2, variables;
      ref = $scope.har.log.entries;
      for (i = 0, len = ref.length; i < len; i++) {
        entry = ref[i];
        if (!(entry.checked && ((ref1 = entry.request.url) != null ? ref1.indexOf('://') : void 0) !== -1 && ((ref2 = utils.url_parse(entry.request.url).protocol) != null ? ref2.indexOf('api:') : void 0) === -1)) {
          continue;
        }
        variables = analysis.variables_in_entry(entry);
        if (indexOf.call(variables, 'cookies') >= 0 || indexOf.call(variables, 'cookie') >= 0) {
          return entry;
        }
      }
    })();
    if (!first_entry) {
      if (first_entry == null) {
        first_entry = (function() {
          var entry, i, len, ref, ref1, ref2;
          ref = $scope.har.log.entries;
          for (i = 0, len = ref.length; i < len; i++) {
            entry = ref[i];
            if (entry.checked && ((ref1 = entry.request.url) != null ? ref1.indexOf('://') : void 0) !== -1 && ((ref2 = utils.url_parse(entry.request.url).protocol) != null ? ref2.indexOf('api:') : void 0) === -1) {
              return entry;
            }
          }
        })();
      }
    }
    try {
      if ($scope.setting == null) {
        $scope.setting = {};
      }
      if ((base = $scope.setting).sitename == null) {
        base.sitename = first_entry && utils.get_domain(first_entry.request.url).split('.')[0];
      }
      parsed_url = first_entry && utils.url_parse(first_entry.request.url);
      if (parsed_url) {
        if ((base1 = $scope.setting).siteurl == null) {
          base1.siteurl = parsed_url.protocol === 'https:' && `${parsed_url.protocol}//${parsed_url.host}` || parsed_url.host;
        }
      }
      if (HARNOTE !== "") {
        if ((base2 = $scope.setting).note == null) {
          base2.note = HARNOTE.replaceAll("&lt;br&gt;", "\r\n");
        }
      }
    } catch (error1) {
      error = error1;
      return console.error(error);
    }
  };
  har2tpl = function(har) {
    var c, entry, h;
    return (function() {
      var i, len, ref, ref1, ref2, results;
      ref = har.log.entries;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        entry = ref[i];
        if (entry.checked) {
          results.push({
            comment: entry.comment,
            request: {
              method: entry.request.method,
              url: entry.request.url,
              headers: (function() {
                var j, len1, ref1, results1;
                ref1 = entry.request.headers;
                results1 = [];
                for (j = 0, len1 = ref1.length; j < len1; j++) {
                  h = ref1[j];
                  if (h.checked) {
                    results1.push({
                      name: h.name,
                      value: h.value
                    });
                  }
                }
                return results1;
              })(),
              cookies: (function() {
                var j, len1, ref1, results1;
                ref1 = entry.request.cookies;
                results1 = [];
                for (j = 0, len1 = ref1.length; j < len1; j++) {
                  c = ref1[j];
                  if (c.checked) {
                    results1.push({
                      name: c.name,
                      value: c.value
                    });
                  }
                }
                return results1;
              })(),
              data: (ref1 = entry.request.postData) != null ? ref1.text : void 0,
              mimeType: (ref2 = entry.request.postData) != null ? ref2.mimeType : void 0
            },
            rule: {
              success_asserts: entry.success_asserts,
              failed_asserts: entry.failed_asserts,
              extract_variables: entry.extract_variables
            }
          });
        }
      }
      return results;
    })();
  };
  $scope.save = function() {
    var alert_elem, alert_info_elem, data, replace_text, save_btn;
    // 十六委托偷天修改，主要是HAR保存页面对自定义时间的支持
    $scope.setting.interval = angular.element('#jiange_second').val();
    // End
    data = {
      id: $scope.id,
      har: $scope.har,
      tpl: har2tpl($scope.har),
      setting: $scope.setting
    };
    save_btn = angular.element('#save-har .btn').button('loading');
    alert_elem = angular.element('#save-har .alert-danger').hide();
    alert_info_elem = angular.element('#save-har .alert-info').hide();
    replace_text = 'save?reponame=' + HARPATH + '&' + 'name=' + HARNAME;
    return $http.post(location.pathname.replace('edit', replace_text), data).then(function(res) {
      var config, headers, pathname, status;
      data = res.data;
      status = res.status;
      headers = res.headers;
      config = res.config;
      utils.storage.del('har_filename');
      utils.storage.del('har_har');
      utils.storage.del('har_env');
      save_btn.button('reset');
      pathname = `/tpl/${data.id}/edit`;
      if (pathname !== location.pathname) {
        location.pathname = pathname;
      }
      return alert_info_elem.text('保存成功').show();
    }, function(res) {
      var config, headers, status;
      data = res.data;
      status = res.status;
      headers = res.headers;
      config = res.config;
      alert_elem.text(data).show();
      return save_btn.button('reset');
    });
  };
  return $scope.test = function() {
    var btn, data, result;
    data = {
      env: {
        variables: utils.list2dict($scope.env),
        session: []
      },
      tpl: har2tpl($scope.har)
    };
    result = angular.element('#test-har .result').hide();
    btn = angular.element('#test-har .btn').button('loading');
    return $http.post('/tpl/run', data).then(function(res) {
      result.html(res.data).show();
      return btn.button('reset');
    }, function(res) {
      result.html('<h1 class="alert alert-danger text-center">运行失败</h1><div class="well"></div>').show().find('div').text(res.data);
      return btn.button('reset');
    });
  };
});


/***/ }),

/***/ 977:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

// vim: set et sw=2 ts=2 sts=2 ff=unix fenc=utf8:
// Author: Binux<i@binux.me>
//         http://binux.me
// Created on 2014-08-06 21:12:48
var analysis, remoteload, utils;

analysis = __webpack_require__(214);

utils = __webpack_require__(634);

remoteload = function() {
  var each, i, len, ref1;
  ref1 = [/\/har\/edit\/(\d+)/, /\/push\/\d+\/view/, /\/tpl\/\d+\/edit/];
  for (i = 0, len = ref1.length; i < len; i++) {
    each = ref1[i];
    if (location.pathname.match(each)) {
      return true;
    }
  }
  return false;
};

angular.module('upload_ctrl', []).controller('UploadCtrl', function($scope, $rootScope, $http) {
  var data, element, reader;
  element = angular.element('#upload-har');
  element.modal('show').on('hide.bs.modal', function() {
    return $scope.is_loaded != null;
  });
  element.find('input[type=file]').on('change', function(ev) {
    return $scope.file = this.files[0];
  });
  if (utils.storage.get('har_har') != null) {
    $scope.local_har = utils.storage.get('har_filename');
  }
  $scope.alert = function(message) {
    return element.find('.alert-danger').text(message).show();
  };
  $scope.loaded = function(loaded) {
    $scope.is_loaded = true;
    $rootScope.$emit('har-loaded', loaded);
    angular.element('#upload-har').modal('hide');
    return true;
  };
  $scope.load_remote = function(url) {
    element.find('button').button('loading');
    return $http.post(url).then(function(res) {
      var config, data, headers, status;
      data = res.data;
      status = res.status;
      headers = res.headers;
      config = res.config;
      element.find('button').button('reset');
      return $scope.loaded(data);
    }, function(res) {
      var config, data, headers, status;
      data = res.data;
      status = res.status;
      headers = res.headers;
      config = res.config;
      $scope.alert(data);
      return element.find('button').button('reset');
    });
  };
  $scope.load_file = function(data) {
    var each, i, len, loaded, name, ref1, ref2;
    console.log(data);
    name = "";
    if (HARPATH !== "") {
      name = HARNAME;
    } else if (($scope.file == null) && ((ref1 = $scope.curl) != null ? ref1.length : void 0) > 0) {
      name = "curl2har";
    } else {
      name = $scope.file.name;
    }
    if (data.log) {
      loaded = {
        filename: name,
        har: analysis.analyze(data, {
          username: $scope.username,
          password: $scope.password
        }),
        upload: true
      };
    } else {
      loaded = {
        filename: name,
        har: utils.tpl2har(data),
        upload: true
      };
    }
    loaded.env = {};
    ref2 = analysis.find_variables(loaded.har);
    for (i = 0, len = ref2.length; i < len; i++) {
      each = ref2[i];
      loaded.env[each] = "";
    }
    console.log(analysis.find_variables(loaded.har));
    return $scope.loaded(loaded);
  };
  $scope.load_local_har = function() {
    var loaded;
    loaded = {
      filename: utils.storage.get('har_filename'),
      har: utils.storage.get('har_har'),
      env: utils.storage.get('har_env'),
      upload: true
    };
    return $scope.loaded(loaded);
  };
  $scope.delete_local = function() {
    utils.storage.del('har_har');
    utils.storage.del('har_env');
    utils.storage.del('har_filename');
    $scope.local_har = void 0;
    if (!$scope.local_har && remoteload()) {
      return $scope.load_remote(location.href);
    }
  };
  $scope.add_local = function() {
    var e, each, filename, har_file_upload, i, j, k, key, len, len1, len2, new_har, new_har_log_entry, old_har, reader, ref, ref1, ref2, ref3, ref4, target_har;
    if (($scope.file == null) && (((ref1 = $scope.curl) != null ? ref1.length : void 0) != null) > 0) {
      element.find('button').button('loading');
      old_har = {
        filename: utils.storage.get('har_filename'),
        har: utils.storage.get('har_har'),
        env: utils.storage.get('har_env'),
        upload: true
      };
      if (!old_har.har && typeof old_har.har !== "undefined" && old_har.har !== 0) {
        // if !old_har.har && typeof(old_har.har)!="undefined" && old_har.har != 0
        // 优先读取本地保存的，如果没有则读取全局的
        old_har = window.global_har;
      }
      try {
        har_file_upload = utils.curl2har($scope.curl);
      } catch (error1) {
        e = error1;
        console.error(e);
        $scope.alert('错误的 Curl 命令');
        return element.find('button').button('reset');
      }
      filename = "";
      if (HARPATH !== "") {
        filename = HARNAME;
      } else if (($scope.file == null) && (((ref2 = $scope.curl) != null ? ref2.length : void 0) != null) > 0) {
        filename = "curl2har";
      } else if (((ref3 = $scope.file) != null ? ref3.name : void 0) != null) {
        // deepcode ignore AttrAccessOnNull: filename is not null
        filename = $scope.file.name;
      }
      new_har = {
        filename: filename,
        har: analysis.analyze(har_file_upload, {
          username: $scope.username,
          password: $scope.password
        }),
        upload: true
      };
      new_har.env = {};
      ref = analysis.find_variables(new_har.har);
      for (i = 0, len = ref.length; i < len; i++) {
        each = ref[i];
        new_har.env[each] = "";
      }
      if ($scope.is_loaded) {
        target_har = old_har;
        for (j = 0, len1 = new_har.length; j < len1; j++) {
          key = new_har[j];
          if (new_har.hasOwnProperty(key) === true) {
            target_har.env[key] = new_har.env[key];
          }
        }
        ref4 = new_har.har.log.entries;
        for (k = 0, len2 = ref4.length; k < len2; k++) {
          new_har_log_entry = ref4[k];
          target_har.har.log.entries.push(new_har_log_entry);
        }
      } else {
        target_har = new_har;
      }
      $scope.uploaded = true;
      $scope.loaded(target_har);
      return element.find('button').button('reset');
    }
    if ($scope.file == null) {
      $scope.alert('还没选择文件啊，亲');
      return false;
    }
    if ($scope.file.size > 50 * 1024 * 1024) {
      $scope.alert('文件大小超过50M');
      return false;
    }
    element.find('button').button('loading');
    reader = new FileReader();
    reader.onload = function(ev) {
      return $scope.$apply(function() {
        var l, len3, len4, len5, m, n, ref5;
        old_har = {
          filename: utils.storage.get('har_filename'),
          har: utils.storage.get('har_har'),
          env: utils.storage.get('har_env'),
          upload: true
        };
        if (!old_har.har && typeof old_har.har !== "undefined" && old_har.har !== 0) {
          // if !old_har.har && typeof(old_har.har)!="undefined" && old_har.har != 0
          // 优先读取本地保存的，如果没有则读取全局的
          old_har = window.global_har;
        }
        har_file_upload = angular.fromJson(ev.target.result);
        new_har = {};
        if (har_file_upload.log) {
          new_har = {
            filename: $scope.file.name,
            har: analysis.analyze(har_file_upload, {
              username: $scope.username,
              password: $scope.password
            }),
            upload: true
          };
        } else {
          new_har = {
            filename: $scope.file.name,
            har: utils.tpl2har(har_file_upload),
            upload: true
          };
        }
        new_har.env = {};
        ref = analysis.find_variables(new_har.har);
        for (l = 0, len3 = ref.length; l < len3; l++) {
          each = ref[l];
          new_har.env[each] = "";
        }
        if ($scope.is_loaded) {
          target_har = old_har;
          for (m = 0, len4 = new_har.length; m < len4; m++) {
            key = new_har[m];
            if (new_har.hasOwnProperty(key) === true) {
              target_har.env[key] = new_har.env[key];
            }
          }
          ref5 = new_har.har.log.entries;
          for (n = 0, len5 = ref5.length; n < len5; n++) {
            new_har_log_entry = ref5[n];
            target_har.har.log.entries.push(new_har_log_entry);
          }
        } else {
          target_har = new_har;
        }
        $scope.uploaded = true;
        $scope.loaded(target_har);
        return element.find('button').button('reset');
      });
    };
    return reader.readAsText($scope.file);
  };
  if (HARDATA !== "") {
    element.find('button').button('loading');
    reader = new FileReader();
    data = Base64.decode(HARDATA); // 解码
    $scope.load_file(angular.fromJson(data));
    if (utils.storage.get('har_har') != null) {
      $scope.local_har = utils.storage.get('har_filename');
    }
    element.find('button').button('reset');
    return true;
  } else {
    if (!$scope.local_har && remoteload()) {
      $scope.load_remote(location.href);
    }
    return $scope.upload = function() {
      var error, ref1;
      if (($scope.file == null) && (((ref1 = $scope.curl) != null ? ref1.length : void 0) != null) > 0) {
        element.find('button').button('loading');
        try {
          $scope.load_file(utils.curl2har($scope.curl));
        } catch (error1) {
          error = error1;
          console.error(error);
          $scope.alert('错误的 Curl 命令');
        }
        return element.find('button').button('reset');
      }
      if ($scope.file == null) {
        $scope.alert('还没选择文件啊，亲');
        return false;
      }
      if ($scope.file.size > 50 * 1024 * 1024) {
        $scope.alert('文件大小超过50M');
        return false;
      }
      element.find('button').button('loading');
      reader = new FileReader();
      reader.onload = function(ev) {
        return $scope.$apply(function() {
          $scope.uploaded = true;
          try {
            $scope.load_file(angular.fromJson(ev.target.result));
          } catch (error1) {
            error = error1;
            console.error(error);
            $scope.alert('错误的 HAR 文件');
          }
          return element.find('button').button('reset');
        });
      };
      return reader.readAsText($scope.file);
    };
  }
});


/***/ }),

/***/ 634:
/***/ ((module) => {

// vim: set et sw=2 ts=2 sts=2 ff=unix fenc=utf8:
// Author: Binux<i@binux.me>
//         http://binux.me
// Created on 2014-08-03 07:42:45

// require('.//static/components/node_components') # TODO
var curl2har, exports, fix_encodeURIComponent, querystring, tough, url;

RegExp.escape = function(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

url = node_url;

tough = node_tough;

querystring = node_querystring;

curl2har = node_curl2har;

fix_encodeURIComponent = function(obj) {
  return encodeURIComponent(obj).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
};

exports = {
  cookie_parse: function(cookie_string) {
    var cookie, each, index, j, key, len, ref, value;
    cookie = {};
    ref = cookie_string != null ? cookie_string.split(';') : void 0;
    for (j = 0, len = ref.length; j < len; j++) {
      each = ref[j];
      index = each.indexOf('=');
      index = index < 0 ? each.length : index;
      key = each.slice(0, +index + 1 || 9e9);
      value = each.slice(index + 1);
      cookie[decodeURIComponent(key)] = decodeURIComponent(value);
    }
    return cookie;
  },
  cookie_unparse: function(cookie) {
    var key, value;
    return ((function() {
      var j, len, results;
      results = [];
      for (value = j = 0, len = cookie.length; j < len; value = ++j) {
        key = cookie[value];
        results.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
      }
      return results;
    })()).join(';');
  },
  url_parse: node_url.parse,
  url_unparse: node_url.format,
  path_unparse_with_variables: function(path) {
    var _path, key, m, re, replace_list, value;
    _path = decodeURIComponent(path);
    replace_list = {};
    re = /{{\s*([\w]+)[^}]*?\s*}}/g;
    while (m = re.exec(_path)) {
      replace_list[fix_encodeURIComponent(m[0])] = m[0];
    }
    for (key in replace_list) {
      value = replace_list[key];
      path = path.replace(new RegExp(RegExp.escape(key), 'g'), value);
    }
    return path;
  },
  querystring_parse: node_querystring.parse,
  querystring_unparse: node_querystring.stringify,
  querystring_unparse_with_variables: function(obj) {
    var key, m, query, re, replace_list, value;
    query = node_querystring.stringify(obj, {
      indices: false
    });
    replace_list = {};
    for (key in obj) {
      value = obj[key];
      re = /{{\s*([\w]+)[^}]*?\s*}}/g;
      while (m = re.exec(key)) {
        if (m[0].slice(-12) !== '|urlencode}}') {
          replace_list[fix_encodeURIComponent(m[0])] = m[0].slice(0, -2) + '|urlencode}}';
        } else {
          replace_list[fix_encodeURIComponent(m[0])] = m[0];
        }
      }
      re = /{{\s*([\w]+)[^}]*?\s*}}/g;
      while (m = re.exec(value)) {
        if (m[0].slice(-12) !== '|urlencode}}') {
          replace_list[fix_encodeURIComponent(m[0])] = m[0].slice(0, -2) + '|urlencode}}';
        } else {
          replace_list[fix_encodeURIComponent(m[0])] = m[0];
        }
      }
    }
    if (node_querystring.stringify(replace_list, {
      indices: false
    })) {
      console.log('The replace_list is', replace_list);
    }
    for (key in replace_list) {
      value = replace_list[key];
      query = query.replace(new RegExp(RegExp.escape(key), 'g'), value);
    }
    return query;
  },
  querystring_parse_with_variables: function(query) {
    var _query, key, m, re, replace_list, value;
    replace_list = {};
    re = /{{\s*([\w]+)[^}]*?\s*\|urlencode}}/g;
    _query = decodeURIComponent(query);
    while (m = re.exec(_query)) {
      replace_list[encodeURIComponent(m[0])] = m[0].slice(0, -12) + '}}';
    }
    for (key in replace_list) {
      value = replace_list[key];
      query = query.replace(new RegExp(RegExp.escape(key), 'g'), value);
    }
    return exports.querystring_parse(query);
  },
  CookieJar: node_tough.CookieJar,
  Cookie: node_tough.Cookie,
  dict2list: function(dict) {
    var k, results, v;
    results = [];
    for (k in dict) {
      v = dict[k];
      results.push({
        name: k,
        value: v
      });
    }
    return results;
  },
  list2dict: function(list) {
    var dict, each, j, len;
    dict = {};
    if (list) {
      for (j = 0, len = list.length; j < len; j++) {
        each = list[j];
        dict[each.name] = each.value;
      }
    }
    return dict;
  },
  get_public_suffix: node_tough.getPublicSuffix,
  get_domain: function(url) {
    return exports.get_public_suffix(exports.url_parse(url).hostname);
  },
  debounce: function(func, wait, immediate) {
    var timeout, timestamp;
    timestamp = 0;
    timeout = 0;
    return function() {
      var args, callNow, context, later, result;
      context = this;
      args = arguments;
      timestamp = new Date().getTime();
      later = function() {
        var last, result;
        last = (new Date().getTime()) - timestamp;
        if ((0 < last && last < wait)) {
          return timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) {
            result = func.apply(context, args);
            if (!timeout) {
              return context = args = null;
            }
          }
        }
      };
      callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }
      return result;
    };
  },
  storage: {
    set: function(key, value) {
      var error;
      if (window.localStorage == null) {
        return false;
      }
      try {
        return window.localStorage.setItem(key, angular.toJson(value));
      } catch (error1) {
        error = error1;
        return null;
      }
    },
    get: function(key) {
      var error;
      if (window.localStorage == null) {
        return null;
      }
      try {
        return angular.fromJson(window.localStorage.getItem(key));
      } catch (error1) {
        error = error1;
        return null;
      }
    },
    del: function(key) {
      var error;
      if (window.localStorage == null) {
        return false;
      }
      try {
        return window.localStorage.removeItem(key);
      } catch (error1) {
        error = error1;
        return null;
      }
    }
  },
  tpl2har: function(tpl) {
    var en, x;
    return {
      log: {
        creator: {
          name: 'binux',
          version: 'QD'
        },
        entries: (function() {
          var j, len, ref, ref1, ref2, results;
          results = [];
          for (j = 0, len = tpl.length; j < len; j++) {
            en = tpl[j];
            results.push({
              comment: en.comment,
              checked: true,
              startedDateTime: (new Date()).toISOString(),
              time: 1,
              request: {
                method: en.request.method,
                url: en.request.url,
                headers: (function() {
                  var l, len1, ref, results1;
                  ref = en.request.headers || [];
                  results1 = [];
                  for (l = 0, len1 = ref.length; l < len1; l++) {
                    x = ref[l];
                    results1.push({
                      name: x.name,
                      value: x.value,
                      checked: true
                    });
                  }
                  return results1;
                })(),
                queryString: [],
                cookies: (function() {
                  var l, len1, ref, results1;
                  ref = en.request.cookies || [];
                  results1 = [];
                  for (l = 0, len1 = ref.length; l < len1; l++) {
                    x = ref[l];
                    results1.push({
                      name: x.name,
                      value: x.value,
                      checked: true
                    });
                  }
                  return results1;
                })(),
                headersSize: -1,
                bodySize: en.request.data ? en.request.data.length : 0,
                postData: {
                  mimeType: en.request.mimeType,
                  text: en.request.data
                }
              },
              response: {},
              cache: {},
              timings: {},
              connections: "0",
              pageref: "page_0",
              success_asserts: (ref = en.rule) != null ? ref.success_asserts : void 0,
              failed_asserts: (ref1 = en.rule) != null ? ref1.failed_asserts : void 0,
              extract_variables: (ref2 = en.rule) != null ? ref2.extract_variables : void 0
            });
          }
          return results;
        })(),
        pages: [],
        version: '1.2'
      }
    };
  },
  curl2har: function(curl) {
    var en, i, str_curl, tmp, x;
    if (((curl != null ? curl.length : void 0) != null) === 0) {
      console.error("Curl 命令为空");
    }
    str_curl = curl.split(/(?=curl )/g);
    tmp = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = str_curl.length; j < len; j++) {
        i = str_curl[j];
        results.push(curl2har(i));
      }
      return results;
    })();
    return {
      log: {
        creator: {
          name: 'curl',
          version: 'QD'
        },
        entries: (function() {
          var j, len, results;
          results = [];
          for (j = 0, len = tmp.length; j < len; j++) {
            en = tmp[j];
            if (en.status !== 'error') {
              results.push({
                comment: '',
                checked: true,
                startedDateTime: (new Date()).toISOString(),
                time: 1,
                request: {
                  method: en.data.method,
                  url: en.data.url,
                  headers: (function() {
                    var l, len1, ref, results1;
                    ref = en.data.headers || [];
                    results1 = [];
                    for (l = 0, len1 = ref.length; l < len1; l++) {
                      x = ref[l];
                      results1.push({
                        name: x.name,
                        value: x.value,
                        checked: true
                      });
                    }
                    return results1;
                  })(),
                  queryString: [],
                  cookies: (function() {
                    var l, len1, ref, results1;
                    ref = en.data.cookies || [];
                    results1 = [];
                    for (l = 0, len1 = ref.length; l < len1; l++) {
                      x = ref[l];
                      results1.push({
                        name: x.name,
                        value: x.value,
                        checked: true
                      });
                    }
                    return results1;
                  })(),
                  headersSize: -1,
                  bodySize: en.data.postData.text ? en.data.postData.text.length : 0,
                  postData: en.data.postData || {}
                },
                response: {},
                cache: {},
                timings: {},
                connections: "0",
                pageref: "page_0",
                success_asserts: [],
                failed_asserts: [],
                extract_variables: []
              });
            }
          }
          return results;
        })(),
        pages: [],
        version: '1.2'
      }
    };
  }
};

module.exports = exports;


/***/ }),

/***/ 251:
/***/ ((module) => {


var currentDragItem = null;
var StartY = 0;
var startIndex = 0;
var offsetY = 0;
var maxIndex = 0;

module.exports = {
    reserve_check: function () {
        document.querySelectorAll('#droplist>a.list-group-item.entry').forEach(function (el) {
            var tmp = el.getElementsByClassName('entry-checked')[0].getElementsByTagName('input')[0]
            tmp.checked = !tmp.checked
        });
        entries = window.global_har.har.log.entries
        for (i = 0; i < entries.length; i++) {
            entries[i].checked = !entries[i].checked
        }
    },
    sortRequest: function (checkbox) {
        var RequestIndex = 1;
        document.querySelectorAll('#droplist>a.list-group-item.entry').forEach(function (el) {
            var tmp = el.getElementsByClassName('entry-checked')[0]
            if (tmp.getElementsByTagName('input')[0].checked) {
                if (checkbox.checked) {
                    tmp.childNodes[2].data = RequestIndex.toString();
                    RequestIndex += 1;
                }
                else {
                    tmp.childNodes[2].data = ""
                }
            }
            else {
                tmp.childNodes[2].data = ""
            }
        });
    },
    resortEntryList: function () {
        DragIndex = 0;
        document.querySelectorAll('#droplist>a.list-group-item.entry').forEach(function (el) {
            el.setAttribute('dragid', DragIndex);
            DragIndex += 1;
        });
        maxIndex = DragIndex;
    },
    dragstartFunc: function (ev) {
        resortEntryList();
        StartY = parseInt(ev.clientY);
        startIndex = parseInt(ev.srcElement.getAttribute('dragid'));
        currentDragItem = ev.srcElement;
        offsetY = ev.offsetY;
    },

    dragendFunc: function (ev) {
        var C_height = parseInt(ev.srcElement.clientHeight);
        var EndY = parseInt(ev.clientY)
        var EndIndex = 0;
        if (EndY > StartY) {
            EndIndex = (parseInt(startIndex + ((EndY - StartY) / C_height)));
        }
        else {
            EndIndex = (parseInt(startIndex + ((EndY - StartY) / C_height) + 1));
        }
        var tmp = window.global_har.har.log.entries[startIndex];
        if (EndIndex > startIndex) {
            window.global_har.har.log.entries.splice(EndIndex + 1, 0, tmp);
            window.global_har.har.log.entries.splice(startIndex, 1);
        }
        else {
            window.global_har.har.log.entries.splice(EndIndex, 0, tmp);
            window.global_har.har.log.entries.splice(startIndex + 1, 1);
        }


        resortEntryList();
        sortRequest($('#sortBtn')[0]);
        currentDragItem = null;
    },

    droplistFunc: function (ev) {
        ev.preventDefault();
        if (!currentDragItem) { return }
        var dragitem = ev.target.closest('.list-group-item.entry');
        if (dragitem) {
            if (ev.offsetY > offsetY) {
                tmp = ev.srcElement.getAttribute('dragid')
                if (tmp) {
                    dragitem.after(currentDragItem);
                }
            } else {
                dragitem.before(currentDragItem);
            }
        }
    }
}

$(function () {
    $('#Delete_seleted_Btn').on('click', function () {
        var RequestIndex = 0;
        var Indexs = new Array();
        var es = document.querySelectorAll('#droplist>a.list-group-item.entry');
        window.global_har.har.log.entries.forEach(function (entry) {
            if (entry.checked) {
                es[RequestIndex].parentNode.removeChild(es[RequestIndex]);
                Indexs.splice(0, 0, entry);
            }
            RequestIndex += 1;
        });
        Indexs.forEach(function (entry) {
            window.global_har.har.log.entries.splice(window.global_har.har.log.entries.indexOf(entry), 1)
        });
    });
})

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
// vim: set et sw=2 ts=2 sts=2 ff=unix fenc=utf8:
// Author: Binux<i@binux.me>
//         http://binux.me
// Created on 2014-08-01 11:02:45
var cookie_input, editor;

__webpack_require__(765);

__webpack_require__(977);

__webpack_require__(426);

__webpack_require__(875);

// contentedit-wrapper
$(document).on('click', '.contentedit-wrapper', function(ev) {
  var editable;
  return editable = $(this).hide().next('[contenteditable]').show().focus();
});

$(document).on('blur', '.contentedit-wrapper + [contenteditable]', function(ev) {
  return $(this).hide().prev('.contentedit-wrapper').show();
});

$(document).on('focus', '[contenteditable]', function(ev) {
  var range, sel;
  if (this.childNodes[0]) {
    range = document.createRange();
    sel = window.getSelection();
    range.setStartBefore(this.childNodes[0]);
    range.setEndAfter(this);
    sel.removeAllRanges();
    return sel.addRange(range);
  }
});

// $(() ->
//   if $('body').attr('get-cookie') == 'true'
//     $('[data-toggle=get-cookie][disabled]').attr('disabled', false)
//   return
// )

// get cookie helper
cookie_input = null;

$(document).on('click', "[data-toggle=get-cookie]", function(ev) {
  var $this;
  $this = $(this);
  // if $this.attr('disabled')
  //   return
  cookie_input = angular.element($this.parent().find('input'));
  if ($('body').attr('get-cookie') !== 'true') {
    // $this.html('没有插件，详情F12')
    // console.log('如需要插件请访问 https://github.com/qd-today/get-cookies/ 下载并手动安装插件')
    if ($this.attr('getmod') === 1) {
      $this.attr('href', 'https://github.com/qd-today/get-cookies/').attr('target', '_blank').html('安装插件后请刷新');
    } else {
      $this.attr('getmod', 1).html('再次点击前往安装 Get-Cookies 插件');
    }
  }
});

// deepcode ignore InsufficientPostmessageValidation: the event.origin is checked
window.addEventListener("message", function(ev) {
  var cookie, cookie_str, key, value;
  if (event.origin !== window.location.origin) {
    return;
  }
  cookie = ev.data;
  cookie_str = "";
  for (key in cookie) {
    value = cookie[key];
    cookie_str += key + '=' + value + '; ';
  }
  if (cookie_str === '') {
    console.log('没有获得cookie, 您是否已经登录?');
    return;
  }
  if (cookie_input != null) {
    cookie_input.val(cookie_str);
  }
  return cookie_input != null ? cookie_input.scope().$parent.var.value = cookie_str : void 0;
});

editor = angular.module('HAREditor', ['editablelist', 'upload_ctrl', 'entry_list', 'entry_editor']);

angular.bootstrap(document.body, ['HAREditor']);

__webpack_require__(251);

})();

/******/ })()
;