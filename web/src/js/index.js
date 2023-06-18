// less
import '/src/less/index.less'

import $ from 'jquery'

$(function() {
  $('#run').data('data-callback', function() {
    var tplid = $('select[name=_binux_tplid]').val();
    var env = {};
    for (var _env=$('form').serializeArray(), i=_env.length-1; i>=0; i--) {
      env[_env[i].name] = _env[i].value;
    }
    return {
      env: JSON.stringify(env),
      _binux_tplid: tplid,
    }
  });
})