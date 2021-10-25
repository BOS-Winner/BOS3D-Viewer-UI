var NEAR_ZERO = 1e-14;

let transformPoint = function (x, y, m) {
    return { x: m.a * x + m.c * y + m.e,
        y: m.b * x + m.d * y + m.f };
};

let matrixMultiply = function () {
    let args = arguments;
    let i = args.length;
    let m = args[i - 1];
    i -= 1;
    while (i > 0) {
        let m1 = args[i - 1];
        m = m1.multiply(m);
        i -= 1;
    }
    if (Math.abs(m.a) < NEAR_ZERO) {
        m.a = 0; 
    }
    if (Math.abs(m.b) < NEAR_ZERO) {
        m.b = 0;
    }
    if (Math.abs(m.c) < NEAR_ZERO) {
        m.c = 0; 
    }
    if (Math.abs(m.d) < NEAR_ZERO) {
        m.d = 0; 
    }
    if (Math.abs(m.e) < NEAR_ZERO) {
        m.e = 0;
    }
    if (Math.abs(m.f) < NEAR_ZERO) {
        m.f = 0;
    }

    return m;
};

let transformBBox = function (bbox, m) {
    let p1 = transformPoint(bbox.x, bbox.y, m);
    let p2 = transformPoint(bbox.x + bbox.width, bbox.y + bbox.height, m);
    return {
        x: p1.x,
        y: p1.y,
        width: p2.x - p1.x,
        height: p2.y - p1.y
    };
}

let crossVectors = function (vector1, vector2) {
    let ax = vector1.x, ay = vector1.y, az = vector1.z;
    let bx = vector2.x, by = vector2.y, bz = vector2.z;

    let x = ay * bz - az * by;
    let y = az * bx - ax * bz;
    let z = ax * by - ay * bx;
    return {x, y, z};
}


let lengthOfVector = function (vector) {
    return Math.sqrt( vector.x * vector.x + vector.y * vector.y + vector.z * vector.z );
}

let normalizeVector = function (vector) {
    let length = lengthOfVector(vector);
    length = length || 1;
    return {
        x: vector.x / length,
        y: vector.y / length,
        z: vector.z / length
    };
}

export { transformPoint, matrixMultiply, transformBBox, crossVectors, normalizeVector, lengthOfVector };
