import * as THREE from 'three';

/** Procedural frangipani: five individually curved, softly overlapping petal meshes. */
function makeFlower() {
  const flower = new THREE.Group();
  const rootColor = new THREE.Color('#9e5135');
  const warm = new THREE.Color('#d8bc85');
  const ivory = new THREE.Color('#f2ebdb');
  const material = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .6, metalness: 0, clearcoat: .08, side: THREE.DoubleSide });
  for (let petal = 0; petal < 5; petal++) {
    const positions: number[] = [], colors: number[] = [], indices: number[] = [];
    const rows = 54, columns = 28;
    const angle = petal * Math.PI * 2 / 5;
    for (let row = 0; row <= rows; row++) {
      const u = row / rows;
      const length = .08 + u * 1.72;
      const width = Math.pow(Math.sin(Math.PI * u), .48) * .64;
      for (let col = 0; col <= columns; col++) {
        const v = col / columns * 2 - 1;
        const bend = .36 * u * u;
        const along = length + .09 * Math.sin(Math.PI * u) * v;
        const across = v * width + bend;
        const y = .06 + .28 * u * u + .2 * v * v * Math.sin(Math.PI * u) + .10 * v * u - .13 * Math.sin(Math.PI * u);
        positions.push(Math.sin(angle) * along + Math.cos(angle) * across, y + petal * .012, Math.cos(angle) * along - Math.sin(angle) * across);
        const color = new THREE.Color();
        if (u < .2) color.copy(rootColor).lerp(warm, THREE.MathUtils.smoothstep(u, 0, .2));
        else color.copy(warm).lerp(ivory, THREE.MathUtils.smoothstep(u, .2, .65));
        color.multiplyScalar(1 - Math.abs(v) * .025);
        colors.push(color.r, color.g, color.b);
      }
    }
    for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
      const a = row * (columns + 1) + col, b = a + columns + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    flower.add(new THREE.Mesh(geometry, material));
  }
  const centre = new THREE.Mesh(new THREE.SphereGeometry(.12, 20, 12), new THREE.MeshStandardMaterial({ color: '#9e5135', roughness: .7 }));
  centre.scale.y = .55; centre.position.y = .105; flower.add(centre);
  return flower;
}

export function mountFlower(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  const visual = root.querySelector<HTMLElement>('.flower-visual')!;
  const controls = root.querySelector<HTMLElement>('.flower-controls')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch { root.dataset.fallback = 'webgl-unavailable'; return () => {}; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-2.6, 2.6, 2.6, -2.6, .1, 30);
  camera.position.set(0, 5.4, 4.3); camera.lookAt(0, 0, 0);
  const flower = makeFlower(); scene.add(flower);
  const ambient = new THREE.HemisphereLight('#f2ebdb', '#2b361a', 2.6); scene.add(ambient);
  const key = new THREE.DirectionalLight('#fff4df', 3.2); key.position.set(-3, 6, 4); scene.add(key);
  const fill = new THREE.DirectionalLight('#b69f7f', 1.4); fill.position.set(4, 2, -2); scene.add(fill);
  let frame = 0, previousFrame = 0;
  let disposed = false, visible = false;
  let target = .3;
  flower.rotation.y = reduced.matches ? target : -.1;
  let drag: { x: number; y: number; rotation: number; active: boolean; ignored: boolean; id: number } | null = null;
  const render = () => renderer.render(scene, camera);
  const tick = (now: number) => {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    if (now - previousFrame < 1000 / 30) { frame = requestAnimationFrame(tick); return; }
    previousFrame = now;
    flower.rotation.y = reduced.matches ? target : THREE.MathUtils.lerp(flower.rotation.y, target, .18);
    render();
    if (Math.abs(flower.rotation.y - target) > .0008) frame = requestAnimationFrame(tick);
  };
  const wake = () => { if (!frame && visible && !document.hidden && !disposed) { previousFrame = 0; frame = requestAnimationFrame(tick); } };
  const resize = () => { const size = Math.max(1, Math.min(700, visual.clientWidth)); renderer.setSize(size, size, false); wake(); };
  const visibility = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; if (visible) wake(); else { cancelAnimationFrame(frame); frame = 0; } });
  visibility.observe(visual);
  const sizeObserver = new ResizeObserver(resize); sizeObserver.observe(visual);
  const onHidden = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else wake(); };
  const down = (event: PointerEvent) => { if (event.button !== 0) return; drag = { x: event.clientX, y: event.clientY, rotation: target, active: false, ignored: false, id: event.pointerId }; };
  const move = (event: PointerEvent) => {
    if (!drag || drag.id !== event.pointerId || drag.ignored) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.active && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { drag.ignored = true; return; }
    if (!drag.active && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.3) { drag.active = true; canvas.setPointerCapture(event.pointerId); }
    if (drag.active) { target = drag.rotation + dx * .012; wake(); }
  };
  const up = () => { drag = null; };
  const keyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); target += event.key === 'ArrowLeft' ? -.35 : .35; wake(); }
    if (event.key === 'Home') { event.preventDefault(); target = .3; wake(); }
  };
  const turn = (event: MouseEvent) => { const button = event.currentTarget as HTMLButtonElement; target += Number(button.dataset.turn) * Math.PI / 8; wake(); };
  const reset = () => { target = .3; wake(); };
  const reducedChange = () => { if (reduced.matches) flower.rotation.y = target; wake(); };
  const lost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(frame); frame = 0; disposed = true; delete root.dataset.ready; root.dataset.fallback = 'context-lost'; controls.hidden = true; };
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('webglcontextlost', lost);
  controls.addEventListener('keydown', keyDown);
  const buttons = controls.querySelectorAll<HTMLButtonElement>('[data-turn]');
  buttons.forEach(button => button.addEventListener('click', turn));
  controls.querySelector('[data-reset]')!.addEventListener('click', reset);
  document.addEventListener('visibilitychange', onHidden); reduced.addEventListener('change', reducedChange);
  resize(); render(); root.dataset.ready = 'true'; controls.hidden = false;
  return () => {
    disposed = true; cancelAnimationFrame(frame); visibility.disconnect(); sizeObserver.disconnect();
    canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move);
    canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up);
    canvas.removeEventListener('webglcontextlost', lost); controls.removeEventListener('keydown', keyDown);
    buttons.forEach(button => button.removeEventListener('click', turn)); controls.querySelector('[data-reset]')!.removeEventListener('click', reset);
    document.removeEventListener('visibilitychange', onHidden); reduced.removeEventListener('change', reducedChange);
    const materials = new Set<THREE.Material>();
    flower.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material)); } });
    materials.forEach(material => material.dispose()); renderer.dispose();
    delete root.dataset.ready; controls.hidden = true;
  };
}
