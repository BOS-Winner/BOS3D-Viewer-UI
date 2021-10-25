const path = require('path');

module.exports = (props) => ({
  extensions: ['.js', '.jsx'],
  alias: {
    Base: path.resolve(props.dirname, 'src/UI/Base'),
    UIutils: path.resolve(props.dirname, 'src/UI/utils'),
    THREE: path.resolve(props.dirname, "src/Libs/THREE"),
    Libs: path.resolve(props.dirname, "src/Libs"),
    IconImg: path.resolve(props.dirname, "src/UI/Icon/img"),
    customToastr: path.resolve(props.dirname, "src/UI/toastr"),
    MeasureTool: path.resolve(props.dirname, "src/UI/Icon/Measure"),
    InfoTable: path.resolve(props.dirname, "src/UI/ComponentInfo"),
    AnnotationUI: path.resolve(props.dirname, 'src/UI/AnnotationUI'),
  },
});
