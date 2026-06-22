"use strict";

const STORAGE_KEYS = {
  highScore: "galaxyDefenderHighScore",
  leaderboard: "galaxyDefenderLeaderboard",
  settings: "galaxyDefenderSettings",
};

const ASSET_PATHS = {
  startVideo: "design/images/video/game_start.mp4",
  heroEnterVideo: "design/images/video/hero_enter.mp4",
  heroStayVideo: "design/images/video/hero_stay.mp4",
  heroExplosionVideo: "design/images/video/hero_explotion.mp4",
  enemyExplosionVideo: "design/images/video/enemy_explotion.mp4",
  roundBackground1: "assets/round-backgrounds/round-1.svg",
  roundBackground2: "assets/round-backgrounds/round-2.svg",
  roundBackground3: "assets/round-backgrounds/round-3.svg",
  roundBackground4: "assets/round-backgrounds/round-4.svg",
  roundBackground5: "assets/round-backgrounds/round-5.svg",
  heroModel: "design/images/3d-model/hero.glb",
  enemyModel: "design/images/3d-model/enemy.glb",
  heroPreview: "design/images/hero/3-4_orthographic_view.png",
  heroWelcome: "design/images/hero/hero_right_view.png",
  enemyWelcome: "design/images/enemy/Ememy_left_view.png",
  heroTop: "design/images/hero/hero_top_view.png",
  enemyTop: "design/images/enemy/Ememy_top_view.png",
  subEnemyTop: "design/images/sub_enemy/sub_enemy_top_view.png",
  heroFlames: "design/images/Player_Spaceship.png",
  background: "design/images/Background Layer.png",
};

const ROUND_THEMES = [
  ["#081943", "#050818", "#02030a"],
  ["#042340", "#04131f", "#010409"],
  ["#2a123a", "#13071e", "#05010a"],
  ["#3a1912", "#1b0a06", "#060102"],
  ["#0f2f1d", "#07170f", "#010503"],
];

const POWER_UPS = {
  shield: { label: "Shield", color: "#53eaff", duration: 8000 },
  rapid: { label: "Rapid Fire", color: "#ffe96b", duration: 10000 },
  life: { label: "Extra Life", color: "#66ff99", duration: 0 },
  double: { label: "Double Bullet", color: "#ff72dd", duration: 10000 },
  score: { label: "Score Boost", color: "#b78cff", duration: 10000 },
};

const DIFFICULTY = {
  easy: { enemyRate: 0.82, enemySpeed: 0.9, enemyFire: 0.85, lives: 4, damage: 18 },
  normal: { enemyRate: 1, enemySpeed: 1, enemyFire: 1, lives: 3, damage: 24 },
  hard: { enemyRate: 1.22, enemySpeed: 1.15, enemyFire: 1.2, lives: 2, damage: 30 },
};

const SPRITES = {
  heroTop: { source: "heroTop", x: 0.05, y: 0.015, w: 0.9, h: 0.965 },
  bossTop: { source: "enemyTop", x: 0.08, y: 0.0, w: 0.8, h: 0.97 },
  subEnemyTop: { source: "subEnemyTop", x: 0.1, y: 0.0, w: 0.74, h: 0.96 },
  heroFlameA: { source: "heroFlames", x: 0.288, y: 0.61, w: 0.037, h: 0.125 },
  heroFlameB: { source: "heroFlames", x: 0.328, y: 0.61, w: 0.037, h: 0.125 },
  heroFlameC: { source: "heroFlames", x: 0.288, y: 0.728, w: 0.037, h: 0.125 },
  heroFlameD: { source: "heroFlames", x: 0.328, y: 0.728, w: 0.037, h: 0.125 },
};

const ROUND_BACKGROUND_KEYS = ["roundBackground1", "roundBackground2", "roundBackground3", "roundBackground4", "roundBackground5"];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const randomBetween = (min, max) => min + Math.random() * (max - min);
const rectsOverlap = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

function getSpriteFrame(image, region) {
  return {
    sx: Math.round(image.width * region.x),
    sy: Math.round(image.height * region.y),
    sw: Math.round(image.width * region.w),
    sh: Math.round(image.height * region.h),
  };
}

function shouldTreatAsBackground(data, offset, threshold, rangeThreshold) {
  const alpha = data[offset + 3];
  if (alpha < 8) return true;
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < threshold && max - min < rangeThreshold;
}

function removeEdgeBackground(ctx, width, height, options = {}) {
  const threshold = options.threshold ?? 72;
  const rangeThreshold = options.rangeThreshold ?? 34;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  function enqueue(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const offset = idx * 4;
    if (!shouldTreatAsBackground(data, offset, threshold, rangeThreshold)) return;
    visited[idx] = 1;
    queue[tail] = idx;
    tail += 1;
  }

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (head < tail) {
    const idx = queue[head];
    head += 1;
    const x = idx % width;
    const y = Math.floor(idx / width);
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  for (let i = 0; i < visited.length; i += 1) {
    if (!visited[i]) continue;
    data[i * 4 + 3] = 0;
  }

  ctx.putImageData(imageData, 0, 0);
}

function drawSprite(ctx, image, x, y, w, h, options = {}) {
  if (!image) return false;
  ctx.save();
  ctx.globalAlpha = options.alpha ?? 1;
  if (options.composite) ctx.globalCompositeOperation = options.composite;
  if (options.shadowColor) {
    ctx.shadowColor = options.shadowColor;
    ctx.shadowBlur = options.shadowBlur ?? 0;
  }
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(options.rotation ?? 0);
  ctx.scale(options.flipX ? -1 : 1, options.flipY ? -1 : 1);
  ctx.drawImage(image, -w / 2, -h / 2, w, h);
  ctx.restore();
  return true;
}

function drawPowerBadge(ctx, type, x, y, size, time) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const glowColor = POWER_UPS[type].color;
  const pulse = 0.86 + Math.sin(time * 0.006) * 0.08;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = "screen";
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 16;
  ctx.strokeStyle = `${glowColor}bb`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.45 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.rotate(time * 0.001);
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = "rgba(8, 14, 34, 0.88)";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 12;

  if (type === "shield") {
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.16);
    ctx.lineTo(size * 0.14, -size * 0.06);
    ctx.lineTo(size * 0.1, size * 0.16);
    ctx.lineTo(0, size * 0.22);
    ctx.lineTo(-size * 0.1, size * 0.16);
    ctx.lineTo(-size * 0.14, -size * 0.06);
    ctx.closePath();
    ctx.stroke();
  } else if (type === "rapid") {
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.moveTo(size * 0.06, -size * 0.18);
    ctx.lineTo(-size * 0.08, -size * 0.01);
    ctx.lineTo(size * 0.01, -size * 0.01);
    ctx.lineTo(-size * 0.06, size * 0.18);
    ctx.lineTo(size * 0.11, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
  } else if (type === "life") {
    ctx.fillStyle = glowColor;
    ctx.fillRect(-size * 0.045, -size * 0.16, size * 0.09, size * 0.32);
    ctx.fillRect(-size * 0.16, -size * 0.045, size * 0.32, size * 0.09);
  } else if (type === "double") {
    ctx.beginPath();
    ctx.moveTo(-size * 0.12, -size * 0.16);
    ctx.lineTo(-size * 0.02, -size * 0.02);
    ctx.lineTo(-size * 0.12, size * 0.14);
    ctx.moveTo(size * 0.04, -size * 0.16);
    ctx.lineTo(size * 0.14, -size * 0.02);
    ctx.lineTo(size * 0.04, size * 0.14);
    ctx.stroke();
  } else {
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const outer = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const inner = outer + Math.PI / 5;
      if (i === 0) ctx.moveTo(Math.cos(outer) * size * 0.17, Math.sin(outer) * size * 0.17);
      else ctx.lineTo(Math.cos(outer) * size * 0.17, Math.sin(outer) * size * 0.17);
      ctx.lineTo(Math.cos(inner) * size * 0.08, Math.sin(inner) * size * 0.08);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = glowColor;
    ctx.font = `bold ${Math.round(size * 0.18)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("x2", 0, size * 0.16);
  }
  ctx.restore();
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message || "Shader compilation failed.");
  }
  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(message || "Program link failed.");
  }
  return program;
}

function mat4Identity() {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

function mat4Multiply(a, b) {
  const out = new Float32Array(16);
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a03 = a[3];
  const a10 = a[4];
  const a11 = a[5];
  const a12 = a[6];
  const a13 = a[7];
  const a20 = a[8];
  const a21 = a[9];
  const a22 = a[10];
  const a23 = a[11];
  const a30 = a[12];
  const a31 = a[13];
  const a32 = a[14];
  const a33 = a[15];

  const b00 = b[0];
  const b01 = b[1];
  const b02 = b[2];
  const b03 = b[3];
  const b10 = b[4];
  const b11 = b[5];
  const b12 = b[6];
  const b13 = b[7];
  const b20 = b[8];
  const b21 = b[9];
  const b22 = b[10];
  const b23 = b[11];
  const b30 = b[12];
  const b31 = b[13];
  const b32 = b[14];
  const b33 = b[15];

  out[0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
  out[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
  out[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
  out[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
  out[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;
  return out;
}

function mat4Translation(x, y, z) {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
}

function mat4Scale(x, y, z) {
  return new Float32Array([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]);
}

function mat4RotateX(angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
}

function mat4RotateY(angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
}

function mat4Perspective(fovRadians, aspect, near, far) {
  const f = 1 / Math.tan(fovRadians / 2);
  const rangeInverse = 1 / (near - far);
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (near + far) * rangeInverse,
    -1,
    0,
    0,
    near * far * rangeInverse * 2,
    0,
  ]);
}

function vec3Normalize(vector) {
  const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function vec3Subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function vec3Cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function mat4LookAt(eye, target, up) {
  const zAxis = vec3Normalize(vec3Subtract(eye, target));
  const xAxis = vec3Normalize(vec3Cross(up, zAxis));
  const yAxis = vec3Cross(zAxis, xAxis);
  return new Float32Array([
    xAxis[0],
    yAxis[0],
    zAxis[0],
    0,
    xAxis[1],
    yAxis[1],
    zAxis[1],
    0,
    xAxis[2],
    yAxis[2],
    zAxis[2],
    0,
    -(xAxis[0] * eye[0] + xAxis[1] * eye[1] + xAxis[2] * eye[2]),
    -(yAxis[0] * eye[0] + yAxis[1] * eye[1] + yAxis[2] * eye[2]),
    -(zAxis[0] * eye[0] + zAxis[1] * eye[1] + zAxis[2] * eye[2]),
    1,
  ]);
}

function getAccessorComponentInfo(componentType) {
  const map = {
    5121: { ArrayType: Uint8Array, size: 1 },
    5123: { ArrayType: Uint16Array, size: 2 },
    5125: { ArrayType: Uint32Array, size: 4 },
    5126: { ArrayType: Float32Array, size: 4 },
  };
  return map[componentType];
}

function getAccessorItemSize(type) {
  return {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT4: 16,
  }[type];
}

function readAccessorData(gltf, binaryChunk, accessorIndex) {
  const accessor = gltf.accessors[accessorIndex];
  const bufferView = gltf.bufferViews[accessor.bufferView];
  const component = getAccessorComponentInfo(accessor.componentType);
  const itemSize = getAccessorItemSize(accessor.type);
  const start = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
  const stride = bufferView.byteStride || component.size * itemSize;
  const length = accessor.count * itemSize;
  const output = new component.ArrayType(length);

  if (stride === component.size * itemSize) {
    const view = new component.ArrayType(binaryChunk, start, length);
    output.set(view);
    return output;
  }

  const dataView = new DataView(binaryChunk, start, accessor.count * stride);
  const littleEndian = true;
  for (let i = 0; i < accessor.count; i += 1) {
    for (let j = 0; j < itemSize; j += 1) {
      const byteOffset = i * stride + j * component.size;
      let value = 0;
      if (accessor.componentType === 5126) value = dataView.getFloat32(byteOffset, littleEndian);
      else if (accessor.componentType === 5125) value = dataView.getUint32(byteOffset, littleEndian);
      else if (accessor.componentType === 5123) value = dataView.getUint16(byteOffset, littleEndian);
      else value = dataView.getUint8(byteOffset);
      output[i * itemSize + j] = value;
    }
  }
  return output;
}

class GlbModelViewer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.autoRotate = options.autoRotate ?? 0.2;
    this.baseRotationY = options.baseRotationY ?? 0;
    this.baseRotationX = options.baseRotationX ?? -0.15;
    this.cameraDistance = options.cameraDistance ?? 2.8;
    this.modelScaleMultiplier = options.modelScaleMultiplier ?? 1;
    this.modelOffsetX = options.modelOffsetX ?? 0;
    this.modelOffsetY = options.modelOffsetY ?? -0.12;
    this.modelOffsetZ = options.modelOffsetZ ?? 0;
    this.tint = options.tint || [0.24, 0.9, 1];
    this.interactive = options.interactive ?? true;
    this.rotationX = 0;
    this.rotationY = 0;
    this.model = null;
    this.texture = null;
    this.dragging = false;
    this.lastPointer = { x: 0, y: 0 };

    this.gl =
      this.canvas.getContext("webgl2", { alpha: true, antialias: true, premultipliedAlpha: true }) ||
      this.canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true }) ||
      this.canvas.getContext("experimental-webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!this.gl) return;
    this.uintIndexExtension =
      typeof WebGL2RenderingContext !== "undefined" && this.gl instanceof WebGL2RenderingContext
        ? true
        : this.gl.getExtension("OES_element_index_uint");

    this.program = createProgram(
      this.gl,
      `
        attribute vec3 aPosition;
        attribute vec3 aNormal;
        attribute vec2 aUv;
        uniform mat4 uModel;
        uniform mat4 uViewProjection;
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vec4 world = uModel * vec4(aPosition, 1.0);
          vUv = aUv;
          vNormal = mat3(uModel) * aNormal;
          gl_Position = uViewProjection * world;
        }
      `,
      `
        precision mediump float;
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform sampler2D uTexture;
        uniform vec3 uLightDir;
        uniform vec3 uTint;
        void main() {
          vec4 tex = texture2D(uTexture, vUv);
          vec3 normal = normalize(vNormal);
          float diffuse = max(dot(normal, normalize(uLightDir)), 0.0);
          float rim = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
          vec3 color = tex.rgb * (0.32 + 0.68 * diffuse) + uTint * rim * 0.28;
          gl_FragColor = vec4(color, tex.a);
        }
      `
    );

    this.locations = {
      position: this.gl.getAttribLocation(this.program, "aPosition"),
      normal: this.gl.getAttribLocation(this.program, "aNormal"),
      uv: this.gl.getAttribLocation(this.program, "aUv"),
      model: this.gl.getUniformLocation(this.program, "uModel"),
      viewProjection: this.gl.getUniformLocation(this.program, "uViewProjection"),
      lightDir: this.gl.getUniformLocation(this.program, "uLightDir"),
      tint: this.gl.getUniformLocation(this.program, "uTint"),
      texture: this.gl.getUniformLocation(this.program, "uTexture"),
    };

    if (this.interactive) this.bindPointerControls();
    this.resize();
    window.addEventListener("resize", () => this.resize());
    requestAnimationFrame((time) => this.render(time));
  }

  bindPointerControls() {
    this.canvas.addEventListener("pointerdown", (event) => {
      this.dragging = true;
      this.lastPointer.x = event.clientX;
      this.lastPointer.y = event.clientY;
      this.canvas.setPointerCapture?.(event.pointerId);
    });

    this.canvas.addEventListener("pointermove", (event) => {
      if (!this.dragging) return;
      const deltaX = event.clientX - this.lastPointer.x;
      const deltaY = event.clientY - this.lastPointer.y;
      this.rotationY += deltaX * 0.01;
      this.rotationX = clamp(this.rotationX + deltaY * 0.008, -0.9, 0.9);
      this.lastPointer.x = event.clientX;
      this.lastPointer.y = event.clientY;
    });

    const stopDrag = () => {
      this.dragging = false;
    };
    this.canvas.addEventListener("pointerup", stopDrag);
    this.canvas.addEventListener("pointercancel", stopDrag);
    this.canvas.addEventListener("pointerleave", stopDrag);
  }

  resize() {
    if (!this.gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
    const height = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  async load(url) {
    if (!this.gl) return;
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      await this.setupModel(arrayBuffer);
    } catch {
      this.model = null;
    }
  }

  async setupModel(arrayBuffer) {
    const gl = this.gl;
    const header = new DataView(arrayBuffer, 0, 12);
    const totalLength = header.getUint32(8, true);
    let offset = 12;
    let jsonChunk = null;
    let binaryChunk = null;

    while (offset < totalLength) {
      const chunkHeader = new DataView(arrayBuffer, offset, 8);
      const chunkLength = chunkHeader.getUint32(0, true);
      const chunkType = chunkHeader.getUint32(4, true);
      offset += 8;
      const chunkData = arrayBuffer.slice(offset, offset + chunkLength);
      offset += chunkLength;
      if (chunkType === 0x4e4f534a) jsonChunk = new TextDecoder().decode(chunkData);
      if (chunkType === 0x004e4942) binaryChunk = chunkData;
    }

    const gltf = JSON.parse(jsonChunk);
    const primitive = gltf.meshes[0].primitives[0];
    const positions = readAccessorData(gltf, binaryChunk, primitive.attributes.POSITION);
    const normals = readAccessorData(gltf, binaryChunk, primitive.attributes.NORMAL);
    const uvs = readAccessorData(gltf, binaryChunk, primitive.attributes.TEXCOORD_0);
    const indices = primitive.indices !== undefined ? readAccessorData(gltf, binaryChunk, primitive.indices) : null;

    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < positions.length; i += 3) {
      min[0] = Math.min(min[0], positions[i]);
      min[1] = Math.min(min[1], positions[i + 1]);
      min[2] = Math.min(min[2], positions[i + 2]);
      max[0] = Math.max(max[0], positions[i]);
      max[1] = Math.max(max[1], positions[i + 1]);
      max[2] = Math.max(max[2], positions[i + 2]);
    }

    const center = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
    const extent = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]) || 1;
    const scale = 1.7 / extent;

    this.model = {
      positionBuffer: gl.createBuffer(),
      normalBuffer: gl.createBuffer(),
      uvBuffer: gl.createBuffer(),
      indexBuffer: indices ? gl.createBuffer() : null,
      count: indices ? indices.length : positions.length / 3,
      indexType: indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
      center,
      scale,
    };

    if (indices instanceof Uint32Array && !this.uintIndexExtension) {
      this.model = null;
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.model.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

    if (indices) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.model.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }

    const imageDef = gltf.images[0];
    const imageView = gltf.bufferViews[imageDef.bufferView];
    const imageOffset = imageView.byteOffset || 0;
    const imageLength = imageView.byteLength;
    const imageBuffer = binaryChunk.slice(imageOffset, imageOffset + imageLength);
    const blobUrl = URL.createObjectURL(new Blob([imageBuffer], { type: imageDef.mimeType }));
    const image = new Image();
    image.src = blobUrl;
    await image.decode();
    URL.revokeObjectURL(blobUrl);

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  render(time) {
    if (!this.gl) return;
    this.resize();
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    if (this.model && this.texture) {
      const aspect = this.canvas.width / this.canvas.height;
      const projection = mat4Perspective(Math.PI / 4.4, aspect, 0.1, 100);
      const view = mat4LookAt([0, 0.15, this.cameraDistance], [0, 0, 0], [0, 1, 0]);
      const viewProjection = mat4Multiply(projection, view);
      const angleY = this.baseRotationY + this.rotationY + time * 0.00035 * this.autoRotate;
      const angleX = this.baseRotationX + this.rotationX;
      const modelMatrix = mat4Multiply(
        mat4Translation(this.modelOffsetX, this.modelOffsetY, this.modelOffsetZ),
        mat4Multiply(
          mat4RotateY(angleY),
          mat4Multiply(
            mat4RotateX(angleX),
            mat4Multiply(
              mat4Scale(
                this.model.scale * this.modelScaleMultiplier,
                this.model.scale * this.modelScaleMultiplier,
                this.model.scale * this.modelScaleMultiplier
              ),
              mat4Translation(-this.model.center[0], -this.model.center[1], -this.model.center[2])
            )
          )
        )
      );

      gl.useProgram(this.program);
      gl.uniformMatrix4fv(this.locations.model, false, modelMatrix);
      gl.uniformMatrix4fv(this.locations.viewProjection, false, viewProjection);
      gl.uniform3fv(this.locations.lightDir, new Float32Array([0.2, 0.8, 1]));
      gl.uniform3fv(this.locations.tint, new Float32Array(this.tint));
      gl.uniform1i(this.locations.texture, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.model.positionBuffer);
      gl.enableVertexAttribArray(this.locations.position);
      gl.vertexAttribPointer(this.locations.position, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.model.normalBuffer);
      gl.enableVertexAttribArray(this.locations.normal);
      gl.vertexAttribPointer(this.locations.normal, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.model.uvBuffer);
      gl.enableVertexAttribArray(this.locations.uv);
      gl.vertexAttribPointer(this.locations.uv, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      if (this.model.indexBuffer) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.model.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.model.count, this.model.indexType, 0);
      } else {
        gl.drawArrays(gl.TRIANGLES, 0, this.model.count);
      }
    }

    requestAnimationFrame((nextTime) => this.render(nextTime));
  }
}

class AssetLoader {
  constructor(paths) {
    this.images = {};
    this.loaded = {};
    this.spriteCache = new Map();
    Object.entries(paths).forEach(([key, path]) => {
      if (!/\.(png|jpg|jpeg|webp|svg)$/i.test(path)) return;
      this.loadImage(key, path);
    });
  }

  loadImage(key, src) {
    const image = new Image();
    image.onload = () => {
      this.images[key] = image;
      this.loaded[key] = true;
    };
    image.onerror = () => {
      this.loaded[key] = false;
    };
    image.src = src;
  }

  get(key) {
    return this.loaded[key] ? this.images[key] : null;
  }

  getSprite(key, region, options = {}) {
    const image = this.get(key);
    if (!image || !region) return null;
    const cacheKey = [
      key,
      region.x,
      region.y,
      region.w,
      region.h,
      options.removeDarkBackground ? 1 : 0,
      options.threshold ?? "",
      options.rangeThreshold ?? "",
    ].join(":");
    if (this.spriteCache.has(cacheKey)) return this.spriteCache.get(cacheKey);

    const frame = getSpriteFrame(image, region);
    const canvas = document.createElement("canvas");
    canvas.width = frame.sw;
    canvas.height = frame.sh;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(image, frame.sx, frame.sy, frame.sw, frame.sh, 0, 0, frame.sw, frame.sh);
    if (options.removeDarkBackground) removeEdgeBackground(ctx, frame.sw, frame.sh, options);
    this.spriteCache.set(cacheKey, canvas);
    return canvas;
  }
}

function getRoundBackgroundKey(round) {
  return ROUND_BACKGROUND_KEYS[(round - 1) % ROUND_BACKGROUND_KEYS.length];
}

class AudioManager {
  constructor() {
    this.enabled = true;
    this.context = null;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  ensureContext() {
    if (!this.enabled) return null;
    if (!this.context) this.context = new (window.AudioContext || window.webkitAudioContext)();
    if (this.context.state === "suspended") this.context.resume();
    return this.context;
  }

  tone(frequency, duration, type = "sine", gain = 0.08, slideTo = null) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  shoot() {
    this.tone(760, 0.07, "square", 0.04, 1180);
  }

  enemyDestroyed() {
    this.tone(240, 0.11, "sawtooth", 0.075, 80);
  }

  playerHit() {
    this.tone(120, 0.16, "triangle", 0.1, 55);
  }

  powerUp() {
    this.tone(520, 0.08, "sine", 0.06, 880);
    setTimeout(() => this.tone(880, 0.1, "sine", 0.05, 1240), 70);
  }

  bossWarning() {
    this.tone(160, 0.28, "sawtooth", 0.08, 95);
  }

  gameOver() {
    this.tone(260, 0.2, "triangle", 0.08, 130);
    setTimeout(() => this.tone(130, 0.26, "triangle", 0.08, 65), 170);
  }
}

class StarField {
  constructor(game) {
    this.game = game;
    this.stars = [];
    this.reset();
  }

  reset() {
    const count = Math.round((this.game.width * this.game.height) / 5600);
    this.stars = Array.from({ length: count }, () => ({
      x: Math.random() * this.game.width,
      y: Math.random() * this.game.height,
      r: randomBetween(0.6, 2.2),
      speed: randomBetween(22, 104),
      alpha: randomBetween(0.2, 0.95),
    }));
  }

  update(dt, speedScale) {
    for (const star of this.stars) {
      star.y += star.speed * dt * speedScale;
      if (star.y > this.game.height + star.r) {
        star.y = -star.r;
        star.x = Math.random() * this.game.width;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    for (const star of this.stars) {
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = "#dff8ff";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

class Player {
  constructor(game) {
    this.game = game;
    this.w = 56;
    this.h = 74;
    this.x = game.width / 2 - this.w / 2;
    this.y = game.height - this.h - 34;
    this.speed = 340;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.invincibleTimer = 0;
    this.shootCooldown = 0;
  }

  get bounds() {
    return { x: this.x + 8, y: this.y + 12, w: this.w - 16, h: this.h - 20 };
  }

  update(dt) {
    let dx = 0;
    let dy = 0;

    if (this.game.keys.ArrowLeft || this.game.keys.KeyA || this.game.mobileMoveLeft) dx -= 1;
    if (this.game.keys.ArrowRight || this.game.keys.KeyD || this.game.mobileMoveRight) dx += 1;
    if (this.game.keys.ArrowUp || this.game.keys.KeyW) dy -= 1;
    if (this.game.keys.ArrowDown || this.game.keys.KeyS) dy += 1;

    if (this.game.controlMode === "tilt" && Math.abs(this.game.tiltGamma) > 2) {
      dx += clamp(this.game.tiltGamma / 24, -1, 1);
    }

    if (dx || dy) {
      const length = Math.hypot(dx, dy);
      this.x += (dx / length) * this.speed * dt;
      this.y += (dy / length) * this.speed * dt;
    }

    if (this.game.pointerActive && this.game.controlMode !== "buttons") {
      this.x += (this.game.pointerTarget.x - (this.x + this.w / 2)) * clamp(12 * dt, 0, 1);
      this.y += (this.game.pointerTarget.y - (this.y + this.h / 2)) * clamp(12 * dt, 0, 1);
    }

    this.x = clamp(this.x, 6, this.game.width - this.w - 6);
    this.y = clamp(this.y, this.game.hudSafeTop, this.game.height - this.h - this.game.hudSafeBottom);
    this.shootCooldown = Math.max(0, this.shootCooldown - dt);
    this.invincibleTimer = Math.max(0, this.invincibleTimer - dt);
  }

  canShoot() {
    return this.shootCooldown <= 0;
  }

  shoot() {
    if (!this.canShoot()) return;
    const rapid = this.game.activePowerUps.rapid > 0;
    const double = this.game.activePowerUps.double > 0;
    this.shootCooldown = rapid ? 0.12 : 0.24;

    if (double) {
      this.game.playerBullets.push(new Bullet(this.game, this.x + 16, this.y + 6, -640, "player"));
      this.game.playerBullets.push(new Bullet(this.game, this.x + this.w - 28, this.y + 6, -640, "player"));
    } else {
      this.game.playerBullets.push(new Bullet(this.game, this.x + this.w / 2 - 6, this.y + 2, -640, "player"));
    }
    this.game.audio.shoot();
  }

  draw(ctx) {
    const heroSprite = this.game.assets.get("heroTop");
    if (heroSprite) {
      drawSprite(ctx, heroSprite, this.x, this.y, this.w, this.h, {
        shadowColor: "#42e8ff",
        shadowBlur: 14,
      });
    }

    const pulse = 0.82 + Math.sin(performance.now() * 0.01) * 0.08;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(66, 232, 255, 0.18)";
    ctx.beginPath();
    ctx.ellipse(this.x + this.w / 2, this.y + this.h * 0.84, this.w * 0.25 * pulse, this.h * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (this.game.activePowerUps.shield > 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(83, 234, 255, 0.85)";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#53eaff";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w * 0.48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

class Bullet {
  constructor(game, x, y, speedY, owner) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.speedY = speedY;
    this.owner = owner;
    this.w = owner === "player" ? 12 : 10;
    this.h = owner === "player" ? 24 : 20;
    this.frameOffset = Math.random() * 1000;
  }

  get bounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  update(dt) {
    this.y += this.speedY * dt;
  }

  draw(ctx) {
    if (this.owner === "player") {
      const flameRegion = Math.floor((performance.now() + this.frameOffset) / 70) % 2 === 0 ? SPRITES.heroFlameB : SPRITES.heroFlameD;
      const flame = this.game.assets.getSprite("heroFlames", flameRegion);
      drawSprite(ctx, flame, this.x - 3, this.y - 6, this.w + 6, this.h + 10, {
        composite: "screen",
        shadowColor: "#42e8ff",
        shadowBlur: 16,
        alpha: 0.9,
      });
    }

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.shadowColor = this.owner === "player" ? "#42e8ff" : "#ff5a39";
    ctx.shadowBlur = 14;
    ctx.fillStyle = this.owner === "player" ? "#caffff" : "#ffb3bc";
    ctx.beginPath();
    ctx.roundRect(this.x + (this.owner === "player" ? 3 : 2), this.y, this.w - (this.owner === "player" ? 6 : 4), this.h, 5);
    ctx.fill();
    ctx.restore();
  }
}

class Enemy {
  constructor(game, kind = "sub") {
    this.game = game;
    this.kind = kind;
    this.w = kind === "boss" ? 140 : 54;
    this.h = kind === "boss" ? 150 : 88;
    this.x = randomBetween(12, game.width - this.w - 12);
    this.y = kind === "boss" ? -this.h - 10 : -this.h;
    this.speed =
      kind === "boss"
        ? (58 + game.round * 8) * game.difficulty.enemySpeed
        : (88 + Math.random() * 46) * (1 + game.round * 0.08) * game.difficulty.enemySpeed;
    this.health = kind === "boss" ? 120 + game.round * 30 : 2 + Math.floor(game.round * 0.4);
    this.maxHealth = this.health;
    this.score = kind === "boss" ? 500 + game.round * 60 : 35 + game.round * 12;
    this.fireTimer = (kind === "boss" ? 1.1 : randomBetween(1.2, 2.8)) / game.difficulty.enemyFire;
    this.direction = kind === "boss" ? 1 : 0;
  }

  get bounds() {
    return { x: this.x + 6, y: this.y + 6, w: this.w - 12, h: this.h - 12 };
  }

  update(dt) {
    if (this.kind === "boss") {
      if (this.y < 48) {
        this.y += 70 * dt;
      } else {
        this.x += this.direction * (90 + this.game.round * 8) * dt;
        if (this.x <= 10 || this.x + this.w >= this.game.width - 10) this.direction *= -1;
      }
    } else {
      this.y += this.speed * dt;
      this.x += Math.sin((this.y + this.w) * 0.025) * 34 * dt;
    }

    this.fireTimer -= dt;
    if (this.fireTimer <= 0) {
      if (this.kind === "boss") {
        for (const offset of [-42, 0, 42]) {
          this.game.enemyBullets.push(new Bullet(this.game, this.x + this.w / 2 - 5 + offset, this.y + this.h - 12, 300, "enemy"));
        }
        this.fireTimer = Math.max(0.42, 0.95 - this.game.round * 0.04) / this.game.difficulty.enemyFire;
      } else {
        this.game.enemyBullets.push(new Bullet(this.game, this.x + this.w / 2 - 4, this.y + this.h - 8, 250, "enemy"));
        this.fireTimer = randomBetween(1.4, 3.0) / this.game.difficulty.enemyFire;
      }
    }
  }

  draw(ctx) {
    const sprite = this.kind === "boss" ? this.game.assets.get("enemyTop") : this.game.assets.get("subEnemyTop");

    if (sprite) {
      drawSprite(ctx, sprite, this.x, this.y, this.w, this.h, {
        shadowColor: this.kind === "boss" ? "#ff5f39" : "#ffae7f",
        shadowBlur: this.kind === "boss" ? 18 : 10,
      });
    } else {
      ctx.save();
      ctx.fillStyle = this.kind === "boss" ? "#a5412c" : "#7c4f44";
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.restore();
    }

    if (this.kind === "boss") {
      const hp = this.health / this.maxHealth;
      ctx.fillStyle = "rgba(0,0,0,0.58)";
      ctx.fillRect(this.x, this.y - 14, this.w, 8);
      ctx.fillStyle = "#ff5068";
      ctx.fillRect(this.x, this.y - 14, this.w * hp, 8);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.strokeRect(this.x, this.y - 14, this.w, 8);
    }
  }
}

class PowerUp {
  constructor(game) {
    const types = Object.keys(POWER_UPS);
    this.game = game;
    this.type = types[Math.floor(Math.random() * types.length)];
    this.w = 38;
    this.h = 38;
    this.x = randomBetween(18, game.width - this.w - 18);
    this.y = -this.h;
    this.speed = 90;
    this.floatTime = 0;
  }

  get bounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  update(dt) {
    this.y += this.speed * dt;
    this.floatTime += dt;
  }

  draw(ctx) {
    drawPowerBadge(ctx, this.type, this.x, this.y + Math.sin(this.floatTime * 5) * 2, this.w, performance.now());
  }
}

class Explosion {
  constructor(x, y, size = 50, color = "#ff8f54") {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.life = 0.45;
    this.maxLife = this.life;
    this.particles = Array.from({ length: 14 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: randomBetween(60, 220),
      radius: randomBetween(2, 5),
      color: Math.random() > 0.5 ? "#ffe96b" : color,
    }));
  }

  update(dt) {
    this.life -= dt;
  }

  draw(ctx) {
    const progress = 1 - this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = clamp(this.life / this.maxLife, 0, 1);
    ctx.globalCompositeOperation = "lighter";
    for (const p of this.particles) {
      const distance = p.speed * progress * 0.48;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(this.x + Math.cos(p.angle) * distance, this.y + Math.sin(p.angle) * distance, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

class FloatingText {
  constructor(text, x, y, color = "#ffe96b") {
    this.text = text;
    this.x = x;
    this.y = y;
    this.color = color;
    this.life = 0.9;
  }

  update(dt) {
    this.y -= 42 * dt;
    this.life -= dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = clamp(this.life / 0.9, 0, 1);
    ctx.fillStyle = this.color;
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

class GalaxyDefender {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d", { alpha: false, desynchronized: true });
    this.frame = document.querySelector(".game-frame");
    this.assets = new AssetLoader(ASSET_PATHS);
    this.audio = new AudioManager();
    this.starField = new StarField(this);

    this.keys = {};
    this.pointerActive = false;
    this.pointerTarget = { x: 0, y: 0 };
    this.mobileMoveLeft = false;
    this.mobileMoveRight = false;
    this.tiltGamma = 0;
    this.controlMode = "buttons";
    this.state = "welcome";
    this.width = 960;
    this.height = 540;
    this.hudSafeTop = 92;
    this.hudSafeBottom = 96;
    this.lastTime = 0;

    this.elements = {
      hud: document.getElementById("hud"),
      hudScore: document.getElementById("hudScore"),
      hudHigh: document.getElementById("hudHigh"),
      hudLives: document.getElementById("hudLives"),
      hudRound: document.getElementById("hudRound"),
      hudBottom: document.getElementById("hudBottom"),
      powerDock: document.getElementById("powerDock"),
      powerSummary: document.getElementById("powerSummary"),
      healthFill: document.getElementById("healthFill"),
      levelNotice: document.getElementById("levelNotice"),
      bossWarning: document.getElementById("bossWarning"),
      welcomeScreen: document.getElementById("welcomeScreen"),
      hangarScreen: document.getElementById("hangarScreen"),
      rulesModal: document.getElementById("rulesModal"),
      pauseScreen: document.getElementById("pauseScreen"),
      gameOverScreen: document.getElementById("gameOverScreen"),
      transitionOverlay: document.getElementById("transitionOverlay"),
      transitionVideo: document.getElementById("transitionVideo"),
      transitionLabel: document.getElementById("transitionLabel"),
      transitionActions: document.getElementById("transitionActions"),
      playerShipVideo: document.getElementById("playerShipVideo"),
      startBackgroundVideo: document.getElementById("startBackgroundVideo"),
      playerName: document.getElementById("playerName"),
      finalScore: document.getElementById("finalScore"),
      finalHigh: document.getElementById("finalHigh"),
      finalRounds: document.getElementById("finalRounds"),
      finalLeaderboardList: document.getElementById("finalLeaderboardList"),
      pauseHigh: document.getElementById("pauseHigh"),
      pauseScore: document.getElementById("pauseScore"),
      mobileControls: document.getElementById("mobileControls"),
      dragPad: document.getElementById("dragPad"),
      buttonsModeControls: document.getElementById("buttonsModeControls"),
      tiltModeControls: document.getElementById("tiltModeControls"),
      mobilePause: document.getElementById("mobilePause"),
      hangarStage: document.getElementById("hangarStage"),
      welcomeHeroModel: document.getElementById("welcomeHeroModel"),
      welcomeEnemyModel: document.getElementById("welcomeEnemyModel"),
      hangarHeroModel: document.getElementById("hangarHeroModel"),
      pauseHeroModel: document.getElementById("pauseHeroModel"),
      gameOverHeroModel: document.getElementById("gameOverHeroModel"),
      soundToggle: document.getElementById("soundToggle"),
      leaderboardList: document.getElementById("leaderboardList"),
      difficultyValue: document.getElementById("difficultyValue"),
      difficultyButtons: Array.from(document.querySelectorAll(".difficulty-button")),
    };

    this.loadSettings();
    this.applySavedSetup();
    this.initModelViewers();
    this.preloadMedia();
    this.bindEvents();
    this.resize();
    this.resetGameData();
    this.renderLeaderboard();
    this.showWelcome();
    this.applyDebugRoute();
    requestAnimationFrame((time) => this.loop(time));
  }

  loadSettings() {
    const saved = readJson(STORAGE_KEYS.settings, {});
    this.soundOn = saved.soundOn !== false;
    this.savedDifficultyKey = saved.difficultyKey || "normal";
    this.controlMode = saved.controlMode || "buttons";
    this.savedPlayerName = saved.playerName || "Pilot";
    this.audio.setEnabled(this.soundOn);
  }

  applySavedSetup() {
    this.elements.playerName.value = this.savedPlayerName;
    this.elements.difficultyValue.value = DIFFICULTY[this.savedDifficultyKey] ? this.savedDifficultyKey : "normal";
    this.elements.soundToggle.textContent = `Sound: ${this.soundOn ? "On" : "Off"}`;
    this.elements.difficultyButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.difficulty === this.elements.difficultyValue.value);
    });
    document.querySelectorAll("input[name='mobileControlMode']").forEach((input) => {
      input.checked = input.value === this.controlMode;
    });
  }

  saveSettings() {
    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({
        soundOn: this.soundOn,
        difficultyKey: this.elements.difficultyValue.value,
        controlMode: this.controlMode,
        playerName: this.elements.playerName.value.trim() || "Pilot",
      })
    );
  }

  bindEvents() {
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("keydown", (event) => this.handleKeyDown(event));
    window.addEventListener("keyup", (event) => {
      this.keys[event.code] = false;
    });

    window.addEventListener("pointerup", () => {
      this.pointerActive = false;
      this.mobileMoveLeft = false;
      this.mobileMoveRight = false;
      this.draggingHero = false;
    });

    document.getElementById("enterHangarButton").addEventListener("click", () => this.openHangar());
    document.getElementById("backToWelcomeButton").addEventListener("click", () => this.showWelcome());
    document.getElementById("showRulesButton").addEventListener("click", () => this.showRules());
    document.getElementById("cancelRulesButton").addEventListener("click", () => this.hideRules());
    document.getElementById("confirmRulesButton").addEventListener("click", () => this.beginMission());
    document.getElementById("resumeButton").addEventListener("click", () => this.resumeFromPause());
    document.getElementById("pauseRestartButton").addEventListener("click", () => this.beginMission(true));
    document.getElementById("pauseQuitButton").addEventListener("click", () => this.showWelcome());
    document.getElementById("restartButton").addEventListener("click", () => this.beginMission(true));
    document.getElementById("gameOverMenuButton").addEventListener("click", () => this.showWelcome());
    document.getElementById("retryAfterVideoButton").addEventListener("click", () => this.beginMission(true));
    document.getElementById("quitAfterVideoButton").addEventListener("click", () => this.showWelcome());

    document.querySelectorAll("input[name='mobileControlMode']").forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) {
          this.controlMode = input.value;
          this.applyControlModeUI();
          this.saveSettings();
        }
      });
    });

    this.elements.difficultyButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.elements.difficultyValue.value = button.dataset.difficulty;
        this.elements.difficultyButtons.forEach((candidate) => candidate.classList.toggle("is-active", candidate === button));
        this.saveSettings();
      });
    });
    this.elements.playerName.addEventListener("input", () => this.saveSettings());
    this.elements.soundToggle.addEventListener("click", () => {
      this.soundOn = !this.soundOn;
      this.audio.setEnabled(this.soundOn);
      this.elements.soundToggle.textContent = `Sound: ${this.soundOn ? "On" : "Off"}`;
      this.saveSettings();
    });

    this.canvas.addEventListener("pointerdown", (event) => this.handlePointer(event, true));
    this.canvas.addEventListener("pointermove", (event) => this.handlePointer(event, this.pointerActive));
    this.elements.dragPad.addEventListener("pointerdown", (event) => this.handlePointer(event, true));
    this.elements.dragPad.addEventListener("pointermove", (event) => this.handlePointer(event, this.pointerActive));

    const holdButton = (element, setter) => {
      element.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        setter(true);
      });
      element.addEventListener("pointerup", () => setter(false));
      element.addEventListener("pointercancel", () => setter(false));
      element.addEventListener("pointerleave", () => setter(false));
    };

    holdButton(document.getElementById("mobileMoveLeft"), (active) => {
      this.mobileMoveLeft = active;
    });
    holdButton(document.getElementById("mobileMoveRight"), (active) => {
      this.mobileMoveRight = active;
    });

    [
      document.getElementById("mobileFireLeft"),
      document.getElementById("mobileFireRight"),
      document.getElementById("mobileFireCornerLeft"),
      document.getElementById("mobileFireCornerRight"),
    ].forEach((button) => {
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        if (this.state === "playing") this.player.shoot();
      });
    });

    this.elements.mobilePause.addEventListener("click", () => {
      if (this.state === "playing") this.pauseGame();
      else if (this.state === "paused") this.resumeFromPause();
    });

    window.addEventListener("deviceorientation", (event) => {
      if (typeof event.gamma === "number") this.tiltGamma = clamp(event.gamma, -35, 35);
    });

    this.elements.transitionVideo.addEventListener("ended", () => this.finishTransition());
    this.elements.transitionVideo.addEventListener("timeupdate", () => this.handleTransitionTime());
  }

  initModelViewers() {
    this.welcomeHeroViewer = new GlbModelViewer(this.elements.welcomeHeroModel, {
      autoRotate: 0.42,
      baseRotationY: -0.55,
      baseRotationX: -0.16,
      cameraDistance: 3.32,
      modelScaleMultiplier: 0.92,
      modelOffsetY: -0.02,
      tint: [0.22, 0.82, 1],
      interactive: true,
    });
    this.welcomeEnemyViewer = new GlbModelViewer(this.elements.welcomeEnemyModel, {
      autoRotate: 0.42,
      baseRotationY: 2.58,
      baseRotationX: -0.16,
      cameraDistance: 3.38,
      modelScaleMultiplier: 0.9,
      modelOffsetY: -0.02,
      tint: [1, 0.42, 0.3],
      interactive: true,
    });
    this.hangarHeroViewer = new GlbModelViewer(this.elements.hangarHeroModel, {
      autoRotate: 0.3,
      baseRotationY: -0.28,
      baseRotationX: -0.12,
      cameraDistance: 3.45,
      modelScaleMultiplier: 1.04,
      modelOffsetX: 0.08,
      modelOffsetY: -0.04,
      tint: [0.22, 0.82, 1],
    });
    this.pauseHeroViewer = new GlbModelViewer(this.elements.pauseHeroModel, {
      autoRotate: 0.42,
      baseRotationY: -0.36,
      baseRotationX: -0.14,
      cameraDistance: 3.15,
      modelScaleMultiplier: 1.2,
      modelOffsetY: -0.04,
      tint: [0.22, 0.82, 1],
      interactive: true,
    });
    this.gameOverHeroViewer = new GlbModelViewer(this.elements.gameOverHeroModel, {
      autoRotate: 0.42,
      baseRotationY: -0.36,
      baseRotationX: -0.14,
      cameraDistance: 3.05,
      modelScaleMultiplier: 1.24,
      modelOffsetY: -0.04,
      tint: [0.22, 0.82, 1],
      interactive: true,
    });

    this.welcomeHeroViewer.load(ASSET_PATHS.heroModel);
    this.welcomeEnemyViewer.load(ASSET_PATHS.enemyModel);
    this.hangarHeroViewer.load(ASSET_PATHS.heroModel);
    this.pauseHeroViewer.load(ASSET_PATHS.heroModel);
    this.gameOverHeroViewer.load(ASSET_PATHS.heroModel);
  }

  preloadMedia() {
    this.elements.startBackgroundVideo.load();
    this.elements.playerShipVideo.src = ASSET_PATHS.heroStayVideo;
    this.elements.playerShipVideo.load();
    this.elements.transitionVideo.preload = "auto";
  }

  resetGameData() {
    const selectedDifficulty = this.elements.difficultyValue.value;
    this.difficulty = DIFFICULTY[selectedDifficulty] || DIFFICULTY.normal;
    this.playerName = this.elements.playerName.value.trim() || "Pilot";
    this.round = 1;
    this.score = 0;
    this.highScore = Number(localStorage.getItem(STORAGE_KEYS.highScore) || 0);
    this.lives = this.difficulty.lives;
    this.activePowerUps = { shield: 0, rapid: 0, double: 0, score: 0 };
    this.player = new Player(this);
    this.playerBullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.powerUps = [];
    this.explosions = [];
    this.floatingTexts = [];
    this.enemySpawnTimer = 0;
    this.powerUpTimer = randomBetween(8, 15);
    this.mainEnemySpawned = false;
    this.mainEnemy = null;
    this.roundScoreBase = 0;
    this.transitionConfig = null;
    this.applyControlModeUI();
    this.updateHud();
  }

  showWelcome() {
    this.state = "welcome";
    this.elements.welcomeScreen.classList.remove("hidden");
    this.elements.hangarScreen.classList.add("hidden");
    this.elements.rulesModal.classList.add("hidden");
    this.elements.pauseScreen.classList.add("hidden");
    this.elements.gameOverScreen.classList.add("hidden");
    this.elements.transitionOverlay.classList.add("hidden");
    this.elements.hud.classList.add("hidden");
    this.elements.hudBottom.classList.add("hidden");
    this.elements.mobileControls.classList.add("hidden");
    this.setMobilePauseState("pause");
    this.stopPlayerVideo();
    this.elements.transitionVideo.pause();
    this.renderLeaderboard();
    this.elements.startBackgroundVideo.play().catch(() => {});
    this.refreshModelViewers();
  }

  openHangar() {
    this.state = "hangar";
    this.elements.welcomeScreen.classList.add("hidden");
    this.elements.hangarScreen.classList.remove("hidden");
    this.elements.rulesModal.classList.add("hidden");
    this.renderLeaderboard();
    this.elements.playerName.focus();
    this.refreshModelViewers();
  }

  showRules() {
    this.playerName = this.elements.playerName.value.trim() || "Pilot";
    this.saveSettings();
    this.elements.rulesModal.classList.remove("hidden");
  }

  hideRules() {
    this.elements.rulesModal.classList.add("hidden");
  }

  async beginMission(forceRestart = true) {
    await this.tryLockLandscape();
    this.hideRules();
    this.elements.welcomeScreen.classList.add("hidden");
    this.elements.hangarScreen.classList.add("hidden");
    this.elements.pauseScreen.classList.add("hidden");
    this.elements.gameOverScreen.classList.add("hidden");
    this.elements.transitionActions.classList.add("hidden");
    this.elements.mobileControls.classList.remove("hidden");
    this.elements.hud.classList.remove("hidden");
    this.elements.hudBottom.classList.remove("hidden");
    this.setMobilePauseState("pause");
    this.pendingPlayerName = this.elements.playerName.value.trim() || "Pilot";
    this.controlMode = document.querySelector("input[name='mobileControlMode']:checked")?.value || this.controlMode;
    this.saveSettings();
    if (forceRestart) this.resetGameData();
    this.playerName = this.pendingPlayerName;
    this.updateHud();
    this.startRoundIntro({ resetPlayer: true, playIntro: true });
  }

  applyDebugRoute() {
    const route = (window.location.hash || "").toLowerCase();
    if (!route) return;

    setTimeout(() => {
      if (route === "#hangar") {
        this.openHangar();
        return;
      }

      if (route === "#play" || route === "#pause" || route === "#gameover") {
        this.startDebugMission(route.slice(1));
      }
    }, 120);
  }

  startDebugMission(mode) {
    this.hideRules();
    this.elements.welcomeScreen.classList.add("hidden");
    this.elements.hangarScreen.classList.add("hidden");
    this.elements.transitionOverlay.classList.add("hidden");
    this.elements.pauseScreen.classList.add("hidden");
    this.elements.gameOverScreen.classList.add("hidden");
    this.elements.mobileControls.classList.remove("hidden");
    this.elements.hud.classList.remove("hidden");
    this.elements.hudBottom.classList.remove("hidden");
    this.elements.playerName.value = this.savedPlayerName || "Pilot";
    this.resetGameData();
    this.playerName = this.elements.playerName.value.trim() || "Pilot";
    this.state = "playing";
    this.seedDebugBattle();
    this.updateHud();
    this.refreshModelViewers();

    if (mode === "pause") {
      this.pauseGame();
      return;
    }

    if (mode === "gameover") {
      this.elements.mobileControls.classList.add("hidden");
      this.state = "gameOver";
      this.score = 78500;
      this.highScore = Math.max(this.highScore, 125000);
      this.round = 26;
      this.lives = 0;
      this.updateHud();
      this.elements.finalHigh.textContent = this.formatNumber(this.highScore);
      this.elements.finalScore.textContent = this.formatNumber(this.score);
      this.elements.finalRounds.textContent = this.formatNumber(25);
      this.elements.gameOverScreen.classList.remove("hidden");
      this.renderLeaderboard();
      this.refreshModelViewers();
    }
  }

  seedDebugBattle() {
    this.round = 5;
    this.score = 6248;
    this.highScore = Math.max(this.highScore, 6248);
    this.lives = 3;
    this.player.health = 68;
    this.player.x = this.width * 0.53;
    this.player.y = this.height * 0.68;
    this.activePowerUps.shield = 7000;
    this.activePowerUps.rapid = 5400;

    const subA = new Enemy(this, "sub");
    subA.x = this.width * 0.62;
    subA.y = this.height * 0.12;
    const subB = new Enemy(this, "sub");
    subB.x = this.width * 0.18;
    subB.y = this.height * 0.45;
    const subC = new Enemy(this, "sub");
    subC.x = this.width * 0.82;
    subC.y = this.height * 0.38;
    this.enemies = [subA, subB, subC];

    const enemyBullet = new Bullet(this, this.width * 0.66, this.height * 0.38, 250, "enemy");
    const playerBulletA = new Bullet(this, this.player.x + 18, this.player.y - 22, -640, "player");
    const playerBulletB = new Bullet(this, this.player.x + 34, this.player.y - 48, -640, "player");
    this.enemyBullets = [enemyBullet];
    this.playerBullets = [playerBulletA, playerBulletB];

    const power = new PowerUp(this);
    power.type = "double";
    power.x = this.width * 0.45;
    power.y = this.height * 0.52;
    this.powerUps = [power];
  }

  startRoundIntro(options = {}) {
    const resetPlayer = options.resetPlayer !== false;
    const playIntro = options.playIntro !== false;
    const noticeText = options.noticeText || `Round ${this.round}`;
    this.state = playIntro ? "intro" : "playing";
    if (playIntro) this.stopPlayerVideo();
    if (resetPlayer || !this.player) this.player = new Player(this);
    this.playerBullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.powerUps = [];
    this.explosions = [];
    this.floatingTexts = [];
    this.mainEnemySpawned = false;
    this.mainEnemy = null;
    this.enemySpawnTimer = 0;
    this.powerUpTimer = randomBetween(8, 15);
    this.activePowerUps.shield = 0;
    this.roundScoreBase = this.score;
    this.player.invincibleTimer = 0.7;

    if (!playIntro) {
      this.startPlayerVideo();
      this.showLevelNotice(noticeText);
      return;
    }

    this.playTransition({
      src: ASSET_PATHS.heroEnterVideo,
      onEnded: () => {
        this.startPlayerVideo();
        this.state = "playing";
        this.showLevelNotice(noticeText);
      },
    });
  }

  playTransition(config) {
    this.state = config.state || "transition";
    this.pointerActive = false;
    this.mobileMoveLeft = false;
    this.mobileMoveRight = false;
    this.transitionConfig = config;
    this.elements.transitionActions.classList.add("hidden");
    this.elements.transitionOverlay.classList.remove("hidden");
    this.elements.transitionLabel.textContent = config.label || "";
    this.elements.transitionLabel.classList.toggle("hidden", !config.labelVisibleFromStart);
    this.elements.transitionVideo.src = config.src;
    this.elements.transitionVideo.currentTime = 0;
    this.elements.transitionVideo.loop = false;
    this.elements.transitionVideo.load();
    this.elements.transitionVideo.play().catch(() => {});
  }

  handleTransitionTime() {
    if (!this.transitionConfig) return;
    const video = this.elements.transitionVideo;
    const remaining = Math.max(0, (video.duration || 0) - video.currentTime);
    if (this.transitionConfig.showLabelBeforeEnd && remaining <= this.transitionConfig.showLabelBeforeEnd) {
      this.elements.transitionLabel.classList.remove("hidden");
    }
    if (this.transitionConfig.showActionsBeforeEnd && remaining <= this.transitionConfig.showActionsBeforeEnd) {
      this.elements.transitionActions.classList.remove("hidden");
    }
  }

  finishTransition() {
    const config = this.transitionConfig;
    this.transitionConfig = null;
    this.elements.transitionOverlay.classList.add("hidden");
    this.elements.transitionLabel.classList.add("hidden");
    if (config && typeof config.onEnded === "function") config.onEnded();
  }

  startPlayerVideo() {
    const video = this.elements.playerShipVideo;
    video.pause();
    video.classList.add("hidden");
  }

  stopPlayerVideo() {
    const video = this.elements.playerShipVideo;
    video.pause();
    video.classList.add("hidden");
  }

  applyControlModeUI() {
    const coarse = window.matchMedia("(pointer: coarse)").matches || this.width < 760;
    this.elements.mobileControls.classList.toggle("hidden", !coarse || !["playing", "paused", "intro"].includes(this.state));
    this.elements.buttonsModeControls.classList.toggle("hidden", this.controlMode !== "buttons");
    this.elements.tiltModeControls.classList.toggle("hidden", this.controlMode !== "tilt");
    this.elements.dragPad.classList.toggle("hidden", this.controlMode === "buttons");
  }

  handleKeyDown(event) {
    const isTypingTarget =
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      event.target?.isContentEditable;
    if (isTypingTarget) return;

    const gameplayKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "KeyW", "KeyA", "KeyS", "KeyD"];
    if (gameplayKeys.includes(event.code)) event.preventDefault();
    this.keys[event.code] = true;

    if (event.code === "Space" && this.state === "playing") this.player.shoot();
    if (event.code === "KeyP") {
      if (this.state === "playing") this.pauseGame();
      else if (this.state === "paused") this.resumeFromPause();
    }
    if (event.code === "KeyR" && ["playing", "paused", "gameOver"].includes(this.state)) this.beginMission(true);
  }

  handlePointer(event, active) {
    if (!["playing", "intro"].includes(this.state)) return;
    if (this.controlMode === "buttons" && event.currentTarget === this.canvas) return;
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const sourceRect = event.currentTarget === this.canvas ? rect : this.elements.dragPad.getBoundingClientRect();
    this.pointerActive = active;
    const relativeX = clamp((event.clientX - sourceRect.left) / sourceRect.width, 0, 1);
    const relativeY = clamp((event.clientY - sourceRect.top) / sourceRect.height, 0, 1);
    this.pointerTarget.x = relativeX * this.width;
    this.pointerTarget.y = this.hudSafeTop + relativeY * (this.height - this.hudSafeTop - 12);
    if (event.type === "pointerdown" && this.state === "playing" && this.controlMode !== "buttons") {
      this.player.shoot();
    }
  }

  pauseGame() {
    if (this.state !== "playing") return;
    this.state = "paused";
    this.elements.pauseHigh.textContent = this.formatNumber(this.highScore);
    this.elements.pauseScore.textContent = this.formatNumber(this.score);
    this.elements.pauseScreen.classList.remove("hidden");
    this.setMobilePauseState("resume");
    this.refreshModelViewers();
  }

  resumeFromPause() {
    if (this.state !== "paused") return;
    this.state = "playing";
    this.elements.pauseScreen.classList.add("hidden");
    this.setMobilePauseState("pause");
    this.lastTime = performance.now();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = rect.width;
    this.height = rect.height;
    this.hudSafeTop = this.width < 760 ? 122 : 84;
    this.hudSafeBottom = this.width < 760 ? 132 : 96;
    if (this.starField) this.starField.reset();
    if (this.player) {
      this.player.x = clamp(this.player.x, 6, this.width - this.player.w - 6);
      this.player.y = clamp(this.player.y, this.hudSafeTop, this.height - this.player.h - this.hudSafeBottom);
    }
    this.applyControlModeUI();
  }

  loop(time) {
    const dt = Math.min((time - this.lastTime) / 1000 || 0, 0.033);
    this.lastTime = time;

    if (this.state === "playing") this.update(dt);
    this.draw();
    requestAnimationFrame((nextTime) => this.loop(nextTime));
  }

  update(dt) {
    const speedScale = 1 + this.round * 0.04;
    this.starField.update(dt, speedScale);
    this.player.update(dt);
    if (this.keys.Space) this.player.shoot();

    Object.keys(this.activePowerUps).forEach((key) => {
      this.activePowerUps[key] = Math.max(0, this.activePowerUps[key] - dt * 1000);
    });

    this.spawnEnemies(dt);
    this.spawnPowerUps(dt);

    this.playerBullets.forEach((bullet) => bullet.update(dt));
    this.enemyBullets.forEach((bullet) => bullet.update(dt));
    this.enemies.forEach((enemy) => enemy.update(dt));
    this.powerUps.forEach((power) => power.update(dt));
    this.explosions.forEach((explosion) => explosion.update(dt));
    this.floatingTexts.forEach((text) => text.update(dt));

    this.handleCollisions();
    this.cleanup();
    this.updateHud();
  }

  spawnEnemies(dt) {
    if (this.mainEnemy) return;

    this.enemySpawnTimer -= dt;
    if (this.enemySpawnTimer <= 0) {
      this.enemies.push(new Enemy(this, "sub"));
      this.enemySpawnTimer = (randomBetween(0.5, 1.2) / (1 + this.round * 0.08)) / this.difficulty.enemyRate;
    }

    const bossThreshold = this.roundScoreBase + 220 + this.round * 140;
    if (this.score >= bossThreshold && !this.mainEnemySpawned) {
      this.mainEnemySpawned = true;
      this.enemies = [];
      this.enemyBullets = [];
      this.showBossWarning();
      this.audio.bossWarning();
      setTimeout(() => {
        if (this.state === "playing") {
          this.mainEnemy = new Enemy(this, "boss");
          this.enemies.push(this.mainEnemy);
        }
      }, 1200);
    }
  }

  spawnPowerUps(dt) {
    this.powerUpTimer -= dt;
    if (this.powerUpTimer <= 0) {
      this.powerUps.push(new PowerUp(this));
      this.powerUpTimer = randomBetween(9, 17);
    }
  }

  handleCollisions() {
    for (const bullet of this.playerBullets) {
      if (bullet.dead) continue;
      for (const enemy of this.enemies) {
        if (!enemy.dead && rectsOverlap(bullet.bounds, enemy.bounds)) {
          bullet.dead = true;
          enemy.health -= enemy.kind === "boss" ? 8 : 1;
          if (enemy.health <= 0) this.destroyEnemy(enemy);
          break;
        }
      }
    }

    for (const bullet of this.enemyBullets) {
      if (!bullet.dead && rectsOverlap(bullet.bounds, this.player.bounds)) {
        bullet.dead = true;
        this.damagePlayer(this.difficulty.damage);
      }
    }

    for (const enemy of this.enemies) {
      if (!enemy.dead && rectsOverlap(enemy.bounds, this.player.bounds)) {
        enemy.dead = true;
        this.explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 64));
        this.damagePlayer(this.difficulty.damage + 10);
      }
    }

    for (const power of this.powerUps) {
      if (!power.dead && rectsOverlap(power.bounds, this.player.bounds)) {
        power.dead = true;
        this.collectPowerUp(power.type);
      }
    }
  }

  destroyEnemy(enemy) {
    enemy.dead = true;
    this.explosions.push(new Explosion(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.kind === "boss" ? 120 : 60));
    const points = enemy.score * (this.activePowerUps.score > 0 ? 2 : 1);
    this.score += points;
    this.floatingTexts.push(new FloatingText(`+${points}`, enemy.x + enemy.w / 2, enemy.y, "#ffe96b"));
    this.audio.enemyDestroyed();

    if (enemy.kind === "boss") {
      this.mainEnemy = null;
      this.stopPlayerVideo();
       this.playerBullets = [];
       this.enemyBullets = [];
       this.powerUps = [];
       this.enemies = [];
      this.playTransition({
        src: ASSET_PATHS.enemyExplosionVideo,
        state: "roundClear",
        onEnded: () => {
          this.round += 1;
          this.startRoundIntro({ resetPlayer: false, playIntro: false, noticeText: `Next Round ${this.round}` });
        },
      });
    } else if (Math.random() < 0.14) {
      this.powerUps.push(new PowerUp(this));
    }
  }

  damagePlayer(amount) {
    if (this.activePowerUps.shield > 0 || this.player.invincibleTimer > 0 || this.state !== "playing") return;
    this.player.health -= amount;
    this.player.invincibleTimer = 1;
    this.audio.playerHit();
    this.frame.classList.remove("screen-shake");
    void this.frame.offsetWidth;
    this.frame.classList.add("screen-shake");

    if (this.player.health <= 0) {
      this.lives -= 1;
      this.player.health = this.player.maxHealth;
      if (this.lives <= 0) {
        this.handleHeroDefeat();
      }
    }
  }

  handleHeroDefeat() {
    this.state = "gameOverVideo";
    this.stopPlayerVideo();
    this.audio.gameOver();
    this.playTransition({
      src: ASSET_PATHS.heroExplosionVideo,
      label: "",
      showActionsBeforeEnd: 2,
      onEnded: () => {
        this.state = "gameOver";
        this.highScore = Math.max(this.highScore, this.score);
        localStorage.setItem(STORAGE_KEYS.highScore, String(this.highScore));
        this.saveLeaderboard();
        this.elements.finalScore.textContent = this.formatNumber(this.score);
        this.elements.finalHigh.textContent = this.formatNumber(this.highScore);
        this.elements.finalRounds.textContent = this.formatNumber(Math.max(this.round - 1, 0));
        this.elements.gameOverScreen.classList.remove("hidden");
        this.renderLeaderboard();
        this.refreshModelViewers();
      },
    });
  }

  collectPowerUp(type) {
    if (type === "life") {
      this.lives = Math.min(this.lives + 1, 9);
      this.floatingTexts.push(new FloatingText("+Life", this.player.x + this.player.w / 2, this.player.y, POWER_UPS.life.color));
    } else {
      this.activePowerUps[type] = POWER_UPS[type].duration;
      this.floatingTexts.push(new FloatingText(POWER_UPS[type].label, this.player.x + this.player.w / 2, this.player.y, POWER_UPS[type].color));
    }
    this.audio.powerUp();
  }

  cleanup() {
    this.playerBullets = this.playerBullets.filter((b) => !b.dead && b.y + b.h > -40);
    this.enemyBullets = this.enemyBullets.filter((b) => !b.dead && b.y < this.height + 40);
    this.enemies = this.enemies.filter((e) => !e.dead && e.y < this.height + e.h + 20);
    this.powerUps = this.powerUps.filter((p) => !p.dead && p.y < this.height + p.h);
    this.explosions = this.explosions.filter((e) => e.life > 0);
    this.floatingTexts = this.floatingTexts.filter((t) => t.life > 0);
  }

  updateHud() {
    this.highScore = Math.max(this.highScore, this.score);
    this.elements.hudScore.textContent = this.formatNumber(this.score);
    this.elements.hudHigh.textContent = this.formatNumber(this.highScore);
    this.elements.hudLives.textContent = this.formatNumber(this.lives);
    this.elements.hudRound.textContent = this.formatNumber(this.round);
    this.elements.healthFill.style.width = `${clamp(this.player.health / this.player.maxHealth, 0, 1) * 100}%`;
    this.renderPowerDock();
  }

  saveLeaderboard() {
    const scores = readJson(STORAGE_KEYS.leaderboard, []);
    scores.push({
      name: this.playerName || "Pilot",
      score: this.score,
      round: this.round,
      date: new Date().toISOString(),
    });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem(STORAGE_KEYS.leaderboard, JSON.stringify(scores.slice(0, 10)));
  }

  renderLeaderboard() {
    const scores = readJson(STORAGE_KEYS.leaderboard, []);
    this.renderLeaderboardList(this.elements.leaderboardList, scores);
    this.renderLeaderboardList(this.elements.finalLeaderboardList, scores);
  }

  renderLeaderboardList(target, scores) {
    if (!target) return;
    target.innerHTML = "";

    if (!scores.length) {
      const empty = document.createElement("li");
      empty.textContent = "No missions recorded yet.";
      target.appendChild(empty);
      return;
    }

    scores.slice(0, 5).forEach((entry, index) => {
      const item = document.createElement("li");
      item.textContent = `${index + 1}. ${entry.name} | Score ${this.formatNumber(entry.score)} | Round ${entry.round}`;
      target.appendChild(item);
    });
  }

  getActivePowerEntries() {
    return Object.entries(this.activePowerUps)
      .filter(([key, value]) => POWER_UPS[key] && value > 0)
      .map(([key, value]) => ({
        key,
        value,
        duration: POWER_UPS[key].duration || value,
      }));
  }

  renderPowerDock() {
    if (!this.elements.powerDock || !this.elements.powerSummary) return;
    const activeEntries = this.getActivePowerEntries();
    this.elements.powerDock.innerHTML = "";

    if (!activeEntries.length) {
      this.elements.powerSummary.textContent = "Active (None)";
      return;
    }

    const labelMap = { shield: "S", rapid: "R", double: "D", score: "2X", life: "+" };

    activeEntries.forEach((entry) => {
      const circle = document.createElement("div");
      const progress = clamp(entry.value / Math.max(entry.duration, 1), 0, 1);
      circle.className = `power-circle power-${entry.key}`;
      circle.style.setProperty("--accent", POWER_UPS[entry.key].color);
      circle.style.setProperty("--progress", `${progress * 360}deg`);
      circle.title = POWER_UPS[entry.key].label;

      const glyph = document.createElement("span");
      glyph.className = "power-circle__glyph";
      glyph.textContent = labelMap[entry.key] || entry.key.slice(0, 1).toUpperCase();

      const timer = document.createElement("small");
      timer.className = "power-circle__timer";
      timer.textContent = `${Math.ceil(entry.value / 1000)}s`;

      circle.appendChild(glyph);
      circle.appendChild(timer);
      this.elements.powerDock.appendChild(circle);
    });

    this.elements.powerSummary.textContent = activeEntries.map((entry) => POWER_UPS[entry.key].label).join(" / ");
  }

  formatNumber(value) {
    return Number(value || 0).toLocaleString();
  }

  setMobilePauseState(mode) {
    if (!this.elements.mobilePause) return;
    this.elements.mobilePause.classList.toggle("is-resume", mode === "resume");
    this.elements.mobilePause.setAttribute("aria-label", mode === "resume" ? "Resume mission" : "Pause mission");
  }

  refreshModelViewers() {
    requestAnimationFrame(() => {
      [
        this.welcomeHeroViewer,
        this.welcomeEnemyViewer,
        this.hangarHeroViewer,
        this.pauseHeroViewer,
        this.gameOverHeroViewer,
      ].forEach((viewer) => viewer?.resize?.());
    });
  }

  async tryLockLandscape() {
    const isLikelyMobile =
      window.matchMedia("(pointer: coarse)").matches ||
      /android|iphone|ipad|mobile/i.test(navigator.userAgent) ||
      Math.min(window.innerWidth, window.innerHeight) < 760;

    if (!isLikelyMobile) return;

    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {}

    try {
      if (screen.orientation?.lock) await screen.orientation.lock("landscape");
    } catch {}
  }

  showLevelNotice(text) {
    this.elements.levelNotice.textContent = text;
    this.elements.levelNotice.classList.remove("hidden");
    clearTimeout(this.levelTimer);
    this.levelTimer = setTimeout(() => this.elements.levelNotice.classList.add("hidden"), 1500);
  }

  showBossWarning() {
    this.elements.bossWarning.classList.remove("hidden");
    clearTimeout(this.bossWarningTimer);
    this.bossWarningTimer = setTimeout(() => this.elements.bossWarning.classList.add("hidden"), 1600);
  }

  drawBackground() {
    const theme = ROUND_THEMES[(this.round - 1) % ROUND_THEMES.length];
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, theme[0]);
    gradient.addColorStop(0.55, theme[1]);
    gradient.addColorStop(1, theme[2]);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    const roundBackground = this.assets.get(getRoundBackgroundKey(this.round));
    if (roundBackground) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.5;
      this.ctx.drawImage(roundBackground, 0, 0, this.width, this.height);
      this.ctx.restore();
    }

    this.ctx.save();
    const patch = this.ctx.createRadialGradient(this.width - 42, this.height - 42, 2, this.width - 42, this.height - 42, 64);
    patch.addColorStop(0, "rgba(3, 5, 18, 0.95)");
    patch.addColorStop(0.65, "rgba(4, 7, 24, 0.86)");
    patch.addColorStop(1, "rgba(4, 7, 24, 0)");
    this.ctx.fillStyle = patch;
    this.ctx.beginPath();
    this.ctx.arc(this.width - 42, this.height - 42, 64, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackground();
    this.starField.draw(this.ctx);

    this.powerUps.forEach((power) => power.draw(this.ctx));
    this.playerBullets.forEach((bullet) => bullet.draw(this.ctx));
    this.enemyBullets.forEach((bullet) => bullet.draw(this.ctx));
    this.enemies.forEach((enemy) => enemy.draw(this.ctx));
    if (this.player && ["playing", "paused", "intro"].includes(this.state)) this.player.draw(this.ctx);
    this.explosions.forEach((explosion) => explosion.draw(this.ctx));
    this.floatingTexts.forEach((text) => text.draw(this.ctx));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function roundRect(x, y, w, h, r) {
      const radius = Math.min(r, w / 2, h / 2);
      this.beginPath();
      this.moveTo(x + radius, y);
      this.arcTo(x + w, y, x + w, y + h, radius);
      this.arcTo(x + w, y + h, x, y + h, radius);
      this.arcTo(x, y + h, x, y, radius);
      this.arcTo(x, y, x + w, y, radius);
      this.closePath();
      return this;
    };
  }
  new GalaxyDefender();
});
