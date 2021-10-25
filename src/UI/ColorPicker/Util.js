function convertHexColorToRGB(hex) {
  const reg = /^#([A-Fa-f0-9]{3,4}){1,2}$/;
  const rgba = {
    r: 0, g: 0, b: 0, a: 1.0
  };
  if (reg.test(hex)) {
    if (hex.length === 9 || hex.length === 7) {
      rgba.r = parseInt(hex.substring(1, 3), 16);
      rgba.g = parseInt(hex.substring(3, 5), 16);
      rgba.b = parseInt(hex.substring(5, 7), 16);
      if (hex.length === 9) {
        rgba.a = parseInt(hex.substring(7), 16) / 255;
      }
    } else if (hex.length === 4 || hex.length === 5) {
      rgba.r = parseInt(hex[1] + hex[1], 16);
      rgba.g = parseInt(hex[2] + hex[2], 16);
      rgba.b = parseInt(hex[3] + hex[3], 16);
      if (hex.length === 5) {
        rgba.a = parseInt(hex[4] + hex[4], 16) / 255;
      }
    }
  }
  return rgba;
}

function convertRGBColorToHex(rgb) {
  const hex = [
    rgb.r.toString(16),
    rgb.g.toString(16),
    rgb.b.toString(16)
  ];
  hex.map((str, i) => {
    if (str.length === 1) {
      hex[i] = `0${str}`;
    }
    return hex[i];
  });

  return `#${hex.join('')}`;
}

function convertRGBColorToHSV(rgb) {
  const hsb = { h: 0, s: 0, v: 0 };
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const delta = max - min;
  hsb.v = max;
  hsb.s = max !== 0 ? 255 * delta / max : 0;
  if (hsb.s !== 0) {
    if (rgb.r === max) hsb.h = (rgb.g - rgb.b) / delta;
    else if (rgb.g === max) hsb.h = 2 + (rgb.b - rgb.r) / delta;
    else hsb.h = 4 + (rgb.r - rgb.g) / delta;
  } else hsb.h = -1;
  hsb.h *= 60;
  if (hsb.h < 0) hsb.h += 360;
  hsb.s *= 100 / 255;
  hsb.v *= 100 / 255;
  return hsb;
}

function convertHexColorToHSV(hex) {
  const rgb = convertHexColorToRGB(hex);
  return convertRGBColorToHSV(rgb);
}

function convertHSVColorToRGB(hsv) {
  const rgb = {};
  let h = Math.round(hsv.h);
  const s = Math.round(hsv.s * 255 / 100);
  const v = Math.round(hsv.v * 255 / 100);

  if (s === 0) {
    rgb.r = v;
    rgb.g = v;
    rgb.b = v;
  } else {
    const t1 = v;
    const t2 = (255 - s) * v / 255;
    const t3 = (t1 - t2) * (h % 60) / 60;

    if (h === 360) h = 0;

    if (h < 60) {
      rgb.r = t1; rgb.b = t2; rgb.g = t2 + t3;
    } else if (h < 120) {
      rgb.g = t1; rgb.b = t2; rgb.r = t1 - t3;
    } else if (h < 180) {
      rgb.g = t1; rgb.r = t2; rgb.b = t2 + t3;
    } else if (h < 240) {
      rgb.b = t1; rgb.r = t2; rgb.g = t1 - t3;
    } else if (h < 300) {
      rgb.b = t1; rgb.g = t2; rgb.r = t2 + t3;
    } else if (h < 360) {
      rgb.r = t1; rgb.g = t2; rgb.b = t1 - t3;
    } else {
      rgb.r = 0; rgb.g = 0; rgb.b = 0;
    }
  }

  return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b) };
}

export {
  convertHexColorToHSV,
  convertHexColorToRGB,
  convertRGBColorToHex,
  convertHSVColorToRGB,
  convertRGBColorToHSV
};
