import $ from 'jquery';

// script
module.exports = {
  AjaxPosSaveFile: function (response, state, xhr) {
    //result:请求到的结果数据
    //state:请求状态（success）
    //xhr:XMLHttpRequest对象

    // 从Response Headers中获取fileName
    let fileName = xhr.getResponseHeader('Content-Disposition').split(';')[1].split('=')[1].replace(/\"/g, '')
    //获取下载文件的类型
    let type = xhr.getResponseHeader("content-type")
    //结果数据类型处理
    let blob = new Blob([response], { type: type })

    //对于<a>标签，只有 Firefox 和 Chrome（内核）支持 download 属性
    //IE10以上支持blob，但是依然不支持download
    if ('download' in document.createElement('a')) {//支持a标签download的浏览器
      //通过创建a标签实现
      let link = document.createElement("a");
      //文件名
      link.download = fileName;
      link.style.display = "none"
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();//执行下载
      URL.revokeObjectURL(link.href);//释放url
      document.body.removeChild(link);//释放标签
    } else {//不支持
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, fileName)
      }
    }
  }
}


$(function () {
  $('#recoverytpls').on('click', function () {
    var fileObj = document.getElementById("recfile").files[0];
    if (fileObj == undefined) {
      $('#run-result').html('<h1 class="alert alert-danger text-center">恢复失败</h1><div class="well">请选择文件</div>').show()
      $('#recoverytpls').button('reset');
      return false;
    } else {
      var env = new FormData();
      env.append("adminpwd", md5($('#adminpwd')[0].value));
      env.append("adminmail", $('#adminmail')[0].value);
      env.append("recoverytplsbtn", "");
      env.append("recfile", fileObj);
      // 判断文件类型
      var fileName = fileObj.name;
      var suffixIndex = fileName.lastIndexOf(".");
      var suffix = fileName.substring(suffixIndex + 1).toUpperCase();
      if (suffix == 'DB') {
        var r = confirm("请确认用于恢复的文件为SQLite数据库文件, 是否继续?");
        if (r == false) {
          $('#recoverytpls').button('reset');
          return false;
        }
        var r = confirm("恢复SQLite数据库将覆盖原始数据库, 是否覆盖?");
        if (r == false) {
          $('#recoverytpls').button('reset');
          return false;
        }
      }
      var $this = $('#recoverytpls')
      $this.button('loading');
      $.ajax("/user/" + userid + "/database", {
        type: 'POST',
        data: env,
        processData: false,
        contentType: false,
        cache: false,
        timeout: 600000,
      })
        .fail(function (jxhr) {
          var msg = jxhr.getResponseHeader('error-message');
          if (msg) {
            msg = Base64.decode(msg);
            $('#run-result').html('<h1 class="alert alert-danger text-center">恢复失败</h1><div class="well"></div>').show().find('div').text(msg);
            return;
          }
          $('#run-result').html('<h1 class="alert alert-danger text-center">恢复失败</h1><div class="well"></div>').show().find('div').text(decodeURIComponent(escape(jxhr.statusText)));
        })
        .done(function (data) {
          $('#run-result').html(data).show()
        })
        .always(function () {
          $this.button('reset');
        });
      return false;
    }
  });
})

$(function () {
  // run test
  $('#backuptpls,#backup').on('click', function () {
    var env = {};
    env["adminpwd"] = md5($('#adminpwd')[0].value);
    env["adminmail"] = $('#adminmail')[0].value;
    if (this.name == "backupbtn") {
      env['backupbtn'] = "";
    } else {
      env['backuptplsbtn'] = "";
    }
    var $this = $(this);
    $this.button('loading');
    $.ajax("/user/" + userid + "/database", {
      type: 'POST',
      data: env,
      xhrFields: {
        responseType: "arraybuffer",
      },
    })
      .fail(function (jxhr) {
        var msg = jxhr.getResponseHeader('error-message');
        if (msg) {
          msg = Base64.decode(msg);
          $('#run-result').html('<h1 class="alert alert-danger text-center">备份失败</h1><div class="well"></div>').show().find('div').text(msg);
          return;
        }
        $('#run-result').html('<h1 class="alert alert-danger text-center">备份失败</h1><div class="well"></div>').show().find('div').text(decodeURIComponent(escape(jxhr.statusText)));
      })
      .done(function (response, status, xhr) {
        AjaxPosSaveFile(response, status, xhr)
        $('#run-result').html('<h1 class="alert alert-success text-center">备份成功</h1>').show()
      })
      .always(function () {
        $this.button('reset');
      });

    return false;
  });
})