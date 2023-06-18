
export function check() {
  var pwd = document.getElementById('adminpwd');
  var md5pwd = document.getElementById('md5-password');
  md5pwd.value = md5(pwd.value);
  //return false 会阻止提交
  return true;
}
