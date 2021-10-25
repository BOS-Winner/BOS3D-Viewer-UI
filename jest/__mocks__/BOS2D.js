class Viewer2D {
  addView(modelKey, projKey) {
    return { modelKey, projKey };
  }

  removeView(modelKey) {
    return { modelKey };
  }

  resize(x, y) {
    return { x, y };
  }

  setOnSelectComponentCallback() {}

  addOnSelectComponentCallback() {}

  restoreCameraStatus() {}
}

export default {
  Viewer2D,
};
