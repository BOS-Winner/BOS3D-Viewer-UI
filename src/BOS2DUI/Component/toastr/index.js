/**
 * 提供默认的toastr配置
 * 文档&样例 https://codeseven.github.io/toastr/demo.html
 */
import "toastr/build/toastr.min.css";
import toastr from "toastr";
import "./toastr.less";

toastr.options = {
  "closeButton": false,
  "progressBar": false,
  "positionClass": "toast-top-center",
  "showDuration": 300,
  "hideDuration": 300,
  "timeOut": 3000,
  "extendedTimeOut": 1000,
  "preventDuplicates": true,
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut",
};

export default toastr;
