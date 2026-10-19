import { gsap } from 'gsap';

const vertexSource = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() { vUv = aPosition * 0.5 + 0.5; gl_Position = vec4(aPosition, 0.0, 1.0); }
`;
const fragmentSource = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uImage;
uniform float uTime;
uniform vec4 uDrops[8];
float heightAt(vec2 p) {
  float h = sin(p.x * 19.0 + uTime * 0.48) * sin(p.y * 23.0 - uTime * 0.37) * 0.00022;
  h += sin((p.x + p.y) * 32.0 - uTime * 0.62) * 0.00013;
  for (int i = 0; i < 8; i++) {
    float age = uTime - uDrops[i].z;
    float distance = length(p - uDrops[i].xy);
    float front = distance - age * 0.17;
    float envelope = exp(-front * front * 180.0) * exp(-age * 1.05);
    h += sin(front * 100.0) * envelope * uDrops[i].w * 0.0018;
  }
  return h;
}
void main() {
  vec2 p = vUv;
  float radius = length(p - vec2(0.5));
  float water = 1.0 - smoothstep(0.365, 0.397, radius);
  // Keep the flower and the terracotta rim stable while the surrounding water refracts.
  float flower = smoothstep(0.065, 0.13, length((p - vec2(0.62, 0.52)) * vec2(0.9, 0.8)));
  float mask = water * mix(0.12, 1.0, flower);
  float epsilon = 0.002;
  vec2 normal = vec2(heightAt(p + vec2(epsilon, 0.0)) - heightAt(p - vec2(epsilon, 0.0)),
                     heightAt(p + vec2(0.0, epsilon)) - heightAt(p - vec2(0.0, epsilon))) / (epsilon * 2.0);
  vec2 uv = clamp(p + normal * mask * 0.20, 0.001, 0.999);
  vec3 color = texture2D(uImage, uv).rgb;
  float light = clamp(dot(normal, vec2(-0.65, 0.75)) * 0.40, -0.035, 0.055) * mask;
  color += light * vec3(1.0, 0.90, 0.65);
  gl_FragColor = vec4(color, 1.0);
}
`;

/** Small, bounded GPU surface. The HTML image is the no-JS / reduced-motion fallback. */
function createWater(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let texture: WebGLTexture | null = null;
  const dispose = () => {
    gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteProgram(program);
    shaders.forEach(shader => gl.deleteShader(shader));
  };
  try {
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Shader unavailable');
      shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Shader compilation failed');
      return shader;
    };
    program = gl.createProgram();
    if (!program) throw new Error('Program unavailable');
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Shader linking failed');
    gl.useProgram(program);
    buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    texture = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0);
    const timeLocation = gl.getUniformLocation(program, 'uTime');
    const dropsLocation = gl.getUniformLocation(program, 'uDrops[0]');
    const drops = new Float32Array(32);
    for (let i = 0; i < 8; i++) drops[i * 4 + 2] = -100;
    let nextDrop = 0;
    return {
      draw(time: number) {
        gl.uniform1f(timeLocation, time); gl.uniform4fv(dropsLocation, drops);
        gl.viewport(0, 0, canvas.width, canvas.height); gl.drawArrays(gl.TRIANGLES, 0, 6);
      },
      drop(x: number, y: number, time: number, strength: number) {
        if (Math.hypot(x - .5, y - .5) > .38) return;
        drops.set([x, y, time, strength], nextDrop * 4); nextDrop = (nextDrop + 1) % 8;
      },
      dispose,
    };
  } catch { dispose(); return null; }
}

export function mountWaterStudy(root: HTMLElement) {
  const media = gsap.matchMedia();
  media.add({ motion: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, context => {
    const stage = root.querySelector<HTMLElement>('.water-study')!;
    const image = root.querySelector<HTMLImageElement>('.water-image')!;
    const canvas = root.querySelector<HTMLCanvasElement>('.water-canvas')!;
    const touch = root.querySelector<HTMLButtonElement>('.water-touch')!;
    const control = root.querySelector<HTMLButtonElement>('.motion-control')!;
    const cursor = root.querySelector<HTMLElement>('.touch-cursor')!;
    const reduced = Boolean(context.conditions?.reduced);
    touch.disabled = true; control.hidden = true;
    root.dataset.motion = reduced ? 'reduced' : 'loading';
    if (reduced) return;

    // Intro only: no floating photograph or continuous typography movement.
    gsap.from('.brand-lockup', { opacity: 0, y: 12, duration: 1, ease: 'power2.out' });
    gsap.from('.water-study', { opacity: 0, scale: .92, duration: 1.6, ease: 'power3.out', delay: .08 });
    gsap.from('.title-word', { yPercent: 115, rotation: 2, duration: 1.25, stagger: .12, delay: .2, ease: 'power3.out' });

    let disposed = false;
    let renderer: ReturnType<typeof createWater> = null;
    let observer: ResizeObserver | undefined;
    let frame = 0;
    let lastFrame = 0;
    let time = 0;
    let paused = false;
    let lastDrop = 0;
    let pointerDown = false;
    const shouldRun = () => !paused && !document.hidden && Boolean(renderer);
    const tick = (now: number) => {
      if (!shouldRun()) return;
      frame = requestAnimationFrame(tick);
      if (now - lastFrame < 1000 / 30) return;
      time += lastFrame ? Math.min((now - lastFrame) / 1000, .08) : 0;
      lastFrame = now; renderer?.draw(time);
    };
    const sync = () => {
      cancelAnimationFrame(frame); lastFrame = 0;
      if (shouldRun()) frame = requestAnimationFrame(tick);
    };
    const toggle = () => {
      paused = !paused; root.dataset.motion = paused ? 'paused' : 'playing';
      control.setAttribute('aria-label', paused ? 'Play motion' : 'Pause motion');
      control.setAttribute('aria-pressed', String(paused)); touch.disabled = paused;
      root.querySelector<SVGElement>('[data-pause]')!.style.display = paused ? 'none' : '';
      root.querySelector<SVGElement>('[data-play]')!.style.display = paused ? '' : 'none';
      if (paused) gsap.set(cursor, { opacity: 0 });
      sync();
    };
    const ripple = (event: PointerEvent, strength: number) => {
      if (paused) return;
      const bounds = stage.getBoundingClientRect();
      renderer?.drop((event.clientX - bounds.left) / bounds.width, 1 - (event.clientY - bounds.top) / bounds.height, time, strength);
    };
    const down = (event: PointerEvent) => { pointerDown = true; touch.setPointerCapture(event.pointerId); ripple(event, 1); };
    const up = () => { pointerDown = false; };
    const move = (event: PointerEvent) => {
      if (paused) return;
      const bounds = stage.getBoundingClientRect();
      if (event.pointerType === 'mouse') {
        gsap.to(cursor, { x: event.clientX - bounds.left - bounds.width / 2, y: event.clientY - bounds.top - bounds.height / 2, opacity: 1, duration: .22, overwrite: true });
      }
      if (performance.now() - lastDrop > 70 && (event.pointerType === 'mouse' || pointerDown)) {
        ripple(event, pointerDown ? .65 : .18); lastDrop = performance.now();
      }
    };
    const leave = () => gsap.to(cursor, { opacity: 0, duration: .2, overwrite: true });
    const keyboard = (event: MouseEvent) => { if (event.detail === 0 && !paused) renderer?.drop(.5, .55, time, 1); };
    const lost = (event: Event) => {
      event.preventDefault(); cancelAnimationFrame(frame); stage.dataset.renderer = 'fallback';
      renderer?.dispose(); renderer = null;
      root.dataset.motion = 'unavailable'; touch.disabled = true; control.hidden = true;
    };
    const start = async () => {
      try { await image.decode(); } catch { return; }
      if (disposed) return;
      renderer = createWater(canvas, image);
      if (!renderer) { root.dataset.motion = 'unavailable'; return; }
      observer = new ResizeObserver(() => {
        const size = Math.min(900, Math.round(stage.clientWidth * Math.min(devicePixelRatio || 1, 1.5)));
        canvas.width = size; canvas.height = size;
        renderer?.draw(time);
      });
      observer.observe(stage);
      canvas.width = canvas.height = Math.min(900, Math.round(stage.clientWidth * Math.min(devicePixelRatio || 1, 1.5)));
      renderer.draw(0); stage.dataset.renderer = 'webgl'; root.dataset.motion = 'playing';
      touch.disabled = false; control.hidden = false;
      touch.addEventListener('pointerdown', down);
      touch.addEventListener('pointerup', up); touch.addEventListener('pointercancel', up);
      touch.addEventListener('pointermove', move); touch.addEventListener('pointerleave', leave);
      touch.addEventListener('click', keyboard); control.addEventListener('click', toggle);
      canvas.addEventListener('webglcontextlost', lost);
      document.addEventListener('visibilitychange', sync);
      sync();
    };
    void start();
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer?.disconnect();
      document.removeEventListener('visibilitychange', sync);
      touch.removeEventListener('pointerdown', down); touch.removeEventListener('pointerup', up);
      touch.removeEventListener('pointercancel', up); touch.removeEventListener('pointermove', move);
      touch.removeEventListener('pointerleave', leave); touch.removeEventListener('click', keyboard);
      control.removeEventListener('click', toggle); canvas.removeEventListener('webglcontextlost', lost);
      renderer?.dispose(); gsap.killTweensOf(cursor);
      touch.disabled = true; control.hidden = true; delete stage.dataset.renderer;
    };
  }, root);
  return () => media.revert();
}
