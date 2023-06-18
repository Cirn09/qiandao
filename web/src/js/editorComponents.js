// editor.coffee 编译开了 minimize 后，angular.bootstrap 会报错
// 所以第三方依赖暂且分开编译

import 'angular';
import 'draggable-polyfill';

window.node_url = require('url');
window.node_tough = require('tough-cookie');
window.node_querystring = require('qs');
window.node_curl2har = require('curl2har');
