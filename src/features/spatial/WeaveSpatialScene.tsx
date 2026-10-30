import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Link } from 'react-router-dom';
import {
  Box,
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  Layers,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Info,
  HelpCircle,
  X,
} from 'lucide-react';

// Pre-allocated scratch math helpers at module scope — zero GC inside requestAnimationFrame
const _vec3 = new THREE.Vector3();
const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _tangent = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

export type CameraPresetKey = 'overview' | 'vault' | 'gateways' | 'detail' | 'blueprint';

interface CameraPreset {
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

const CAMERA_PRESETS: Record<CameraPresetKey, CameraPreset> = {
  overview: {
    label: 'Perspective',
    position: [10.5, 8.2, 11.5],
    target: [0, 1.4, 0],
  },
  vault: {
    label: 'Front Core',
    position: [0.1, 4.0, 7.8],
    target: [0, 1.9, 0],
  },
  gateways: {
    label: 'Orbital / Side',
    position: [-9.5, 5.4, 8.8],
    target: [-2.2, 1.0, 1.5],
  },
  detail: {
    label: 'Detail Inspection',
    position: [3.4, 2.9, 4.1],
    target: [0, 1.85, 0],
  },
  blueprint: {
    label: 'Elevated Plan',
    position: [0.01, 16.5, 0.01],
    target: [0, 0, 0],
  },
};

interface NodeTelemetry {
  id: string;
  title: string;
  subtitle: string;
  roleScope: string;
  metrics: string;
  statusLabel: string;
}

const NODE_TELEMETRY: Record<string, NodeTelemetry> = {
  'VAULT-CORE': {
    id: 'VAULT-CORE',
    title: 'WEAVE Deterministic Verification & Attestation Core',
    subtitle: 'Ruleset 2026.10.v1 · Ed25519 Signing Authority · SHA-256 Audit Chain',
    roleScope: 'Platform Trust Anchor (SIH26263)',
    metrics: '12/12 Audit Links Verified · 0 Unmasked APAAR Leaks',
    statusLabel: 'VERIFIED_ACTIVE',
  },
  'INST-KKR-101': {
    id: 'INST-KKR-101',
    title: 'NIT Kurukshetra (Synthetic Gateway)',
    subtitle: 'Batch BAT-2026-003 · 5 Synthetic Records · 449/480 Approved Intake',
    roleScope: 'Institution Tenant Node',
    metrics: '93.5% Capacity · 1 Open Cross-Inst Conflict',
    statusLabel: 'ACTIVE_INGESTION',
  },
  'INST-DEL-202': {
    id: 'INST-DEL-202',
    title: 'Indraprastha Institute of Engg & Tech (Synthetic)',
    subtitle: 'Batch BAT-2026-002 · 288/300 Approved Intake',
    roleScope: 'Institution Tenant Node',
    metrics: '96.0% Capacity · Counterpart Collision on ****-8472',
    statusLabel: 'REVIEW_QUEUED',
  },
  'INST-BOM-304': {
    id: 'INST-BOM-304',
    title: 'Western Regional College of Technology (Synthetic)',
    subtitle: 'Batch BAT-2026-001 · 219/240 Approved Intake',
    roleScope: 'Institution Tenant Node',
    metrics: '91.3% Capacity · All Deterministic Rules Passed',
    statusLabel: 'VERIFIED_ACTIVE',
  },
  'AICTE-REG-01': {
    id: 'AICTE-REG-01',
    title: 'AICTE Regulatory Adjudication & Cap Monitor',
    subtitle: 'Cross-Institution Conflict Queue · Sanctioned Program Registry',
    roleScope: 'Regulator Oversight Node',
    metrics: '1,020 Total Sanctioned Seats · 2 Conflict Candidates',
    statusLabel: 'OVERSIGHT_READY',
  },
};

export interface ComponentDetails {
  id: string;
  name: string;
  role: string;
  inputs: string;
  outputs: string;
  relationships: string;
  cameraPreset: CameraPresetKey;
}

export const APPARATUS_COMPONENTS: ComponentDetails[] = [
  {
    id: 'VAULT-CORE',
    name: 'Ed25519 Cryptographic Attestation Core',
    role: 'Platform root cryptographic trust anchor and official verification credential issuer.',
    inputs: 'Preflight-validated student records and institutional policy keys.',
    outputs: 'Signed Ed25519 attestation payloads, QR verification tokens, and Merkle event hashes.',
    relationships: 'Direct verification bus to all campus gateways and the audit ledger.',
    cameraPreset: 'vault',
  },
  {
    id: 'CAMPUS-GATEWAYS',
    name: 'Decentralized Institution Gateways',
    role: 'Isolated college tenant nodes for CSV batch ingestion and roster pre-checks.',
    inputs: 'Departmental admission CSV rosters with 12-digit student identifiers.',
    outputs: 'Masked APAAR formats (****-****-XXXX) and salted SHA-256 digests.',
    relationships: 'Strict tenant isolation prevents colleges from viewing competing rosters.',
    cameraPreset: 'gateways',
  },
  {
    id: 'VERIFICATION-BUS',
    name: 'High-Throughput Verification Conduits',
    role: 'Streaming telemetry pipelines routing record packets and verification signals.',
    inputs: 'Intra-batch student rows and external verification requests.',
    outputs: 'Deterministic validation status flags (STU-001 through STU-006).',
    relationships: 'Transports record packets between campus nodes, the core vault, and the ledger.',
    cameraPreset: 'detail',
  },
  {
    id: 'AUDIT-LEDGER',
    name: 'SHA-256 Tamper-Evident Chronological Ledger',
    role: 'Cryptographic audit base recording all batch ingestion, commits, and revocations.',
    inputs: 'Sequential operational events with previous_hash pointer.',
    outputs: 'Verifiable cryptographic chain integrity and compliance proofs.',
    relationships: 'Provides immutable audit timeline for institutional auditors and regulators.',
    cameraPreset: 'blueprint',
  },
  {
    id: 'REGULATOR-HUB',
    name: 'Regulatory Adjudication & Seat Governance Hub',
    role: 'Cross-institution conflict resolution and AICTE approved intake monitoring.',
    inputs: 'Cross-institution collision flags (STU-005) and program intake telemetry.',
    outputs: 'Multi-round transfer decisions and sanctioned seat utilization reports.',
    relationships: 'Supervisory authority over all participating technical institutions.',
    cameraPreset: 'overview',
  },
];

function createCalibrationDialTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#F2F0E8';
  ctx.fillRect(0, 0, 1024, 1024);

  const cx = 512;
  const cy = 512;

  // Concentric technical rings
  ctx.strokeStyle = '#C9C7BC';
  ctx.lineWidth = 3;
  [470, 420, 340, 240, 140].forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Precision degree ticks
  for (let i = 0; i < 72; i++) {
    const angle = (i / 72) * Math.PI * 2;
    const isMajor = i % 6 === 0;
    const rInner = isMajor ? 430 : 450;
    const rOuter = 470;
    ctx.strokeStyle = isMajor ? '#C5A869' : '#94A3B8';
    ctx.lineWidth = isMajor ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * rInner, cy + Math.sin(angle) * rInner);
    ctx.lineTo(cx + Math.cos(angle) * rOuter, cy + Math.sin(angle) * rOuter);
    ctx.stroke();
  }

  // Crosshair axes
  ctx.strokeStyle = '#D5D3C8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 470, cy);
  ctx.lineTo(cx + 470, cy);
  ctx.moveTo(cx, cy - 470);
  ctx.lineTo(cx, cy + 470);
  ctx.stroke();

  ctx.fillStyle = '#20241F';
  ctx.font = '600 24px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('WEAVE · SIH26263 · RULESET 2026.10.V1', cx, cy - 365);
  ctx.fillText('MASKED APAAR ****-****-XXXX · ED25519', cx, cy + 385);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
  grad.addColorStop(0, 'rgba(32, 36, 31, 0.42)');
  grad.addColorStop(0.55, 'rgba(32, 36, 31, 0.16)');
  grad.addColorStop(1, 'rgba(32, 36, 31, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createArchitectGridTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#F5F1E8';
  ctx.fillRect(0, 0, 512, 512);

  // Sub-grid
  ctx.strokeStyle = '#ECE7DC';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 512; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  // Primary border grid
  ctx.strokeStyle = '#E4DED2';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 512, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 14);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export interface WeaveSpatialSceneProps {
  embedded?: boolean;
}

export const WeaveSpatialScene: React.FC<WeaveSpatialSceneProps> = ({ embedded = false }) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const [activePreset, setActivePreset] = useState<CameraPresetKey>('overview');
  const [explodedFactor, setExplodedFactor] = useState<number>(0);
  const [flowSpeed, setFlowSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('VAULT-CORE');

  // Interactive Explanatory Modals ('none' | 'what' | 'why' | 'components')
  const [activeModal, setActiveModal] = useState<'none' | 'what' | 'why' | 'components'>('none');
  const [selectedComponentId, setSelectedComponentId] = useState<string>('VAULT-CORE');
  const [autoTourEnabled, setAutoTourEnabled] = useState<boolean>(true);
  const lastInteractionRef = useRef<number>(Date.now());

  const registerUserInteraction = () => {
    lastInteractionRef.current = Date.now();
  };

  // Mutable refs read inside the WebGL animation loop without re-creating scene
  const stateRef = useRef({
    explodedTarget: 0,
    explodedCurrent: 0,
    flowSpeed: 1,
    isPaused: false,
    presetKey: 'overview' as CameraPresetKey,
    transitionActive: false,
    transitionStartTime: 0,
    transitionDuration: 2.8, // Smooth 2.8s cinematic camera shift
    startPos: new THREE.Vector3(...CAMERA_PRESETS.overview.position),
    startLook: new THREE.Vector3(...CAMERA_PRESETS.overview.target),
  });

  useEffect(() => {
    stateRef.current.explodedTarget = explodedFactor;
  }, [explodedFactor]);

  useEffect(() => {
    stateRef.current.flowSpeed = flowSpeed;
  }, [flowSpeed]);

  useEffect(() => {
    stateRef.current.isPaused = isPaused;
  }, [isPaused]);

  const handleSelectPreset = (key: CameraPresetKey) => {
    registerUserInteraction();
    setActivePreset(key);
    stateRef.current.presetKey = key;
    stateRef.current.transitionActive = true;
    stateRef.current.transitionStartTime = 0; // Trigger fresh interpolation
  };

  const handleResetView = () => {
    registerUserInteraction();
    setExplodedFactor(0);
    handleSelectPreset('overview');
    setSelectedNodeId('VAULT-CORE');
    setSelectedComponentId('VAULT-CORE');
  };

  // Automatic camera movement choreography: smoothly shifts for 2.8s, pauses for 3.5s, then next view arrives
  useEffect(() => {
    if (!autoTourEnabled) return;
    const presetsList: CameraPresetKey[] = ['overview', 'vault', 'gateways', 'detail', 'blueprint'];
    let presetIdx = 0;
    let assemblyStep = 0;

    const tourInterval = window.setInterval(() => {
      const idleMs = Date.now() - lastInteractionRef.current;
      if (idleMs < 7500) return; // User is actively exploring

      // 1. Advance camera preset (shifts for 2.8s, holds for 3.7s)
      presetIdx = (presetIdx + 1) % presetsList.length;
      const nextPreset = presetsList[presetIdx];
      setActivePreset(nextPreset);
      stateRef.current.presetKey = nextPreset;
      stateRef.current.transitionActive = true;
      stateRef.current.transitionStartTime = 0;

      // 2. Advance assembly step (assembled -> separating -> exploded -> reassembling)
      assemblyStep = (assemblyStep + 1) % 4;
      if (assemblyStep === 0) {
        setExplodedFactor(0);
      } else if (assemblyStep === 1) {
        setExplodedFactor(0.85);
      } else if (assemblyStep === 2) {
        setExplodedFactor(0.85);
      } else {
        setExplodedFactor(0);
      }
    }, 6500); // 2.8s transition + 3.7s dwell time = 6.5s per cycle

    return () => window.clearInterval(tourInterval);
  }, [autoTourEnabled]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          setDockCollapsed((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // Respect prefers-reduced-motion by starting with gentle slow speed if requested
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      stateRef.current.flowSpeed = 0.25;
    }

    // 1. Detect Software WebGL (SwiftShader / llvmpipe / Basic Render) from renderer string
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 600;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f1e8);
    scene.fog = new THREE.FogExp2(0xf5f1e8, 0.025);

    // 2. Studio Environment Map via RoomEnvironment + PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
    camera.position.set(...CAMERA_PRESETS.overview.position);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...CAMERA_PRESETS.overview.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 3.2;
    controls.maxDistance = 26;
    controls.update();

    const onControlStart = () => {
      stateRef.current.transitionActive = false;
    };
    controls.addEventListener('start', onControlStart);

    // 3. Balanced 3-Point Studio Lighting Rig (Warm Key + Cool Hemisphere Fill + Rim)
    const hemiLight = new THREE.HemisphereLight(0xfcfbf7, 0xd8d5c8, 0.85);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff6e5, 1.65);
    keyLight.position.set(9, 14, 8);
    keyLight.castShadow = !isSoftwareGl;
    const d = 11;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 35;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xdce8e2, 0.75);
    rimLight.position.set(-10, 8, -9);
    scene.add(rimLight);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const disposables: Array<{ dispose: () => void }> = [envTarget];

    // 4. Architectural Ground Plane + Radial Contact Shadow Helper
    const gridTex = createArchitectGridTexture(maxAnisotropy);
    disposables.push(gridTex);
    const groundGeo = new THREE.PlaneGeometry(48, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      map: gridTex,
      roughness: 0.92,
      metalness: 0.02,
    });
    disposables.push(groundGeo, groundMat);
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = 0;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    const shadowTex = createContactShadowTexture();
    disposables.push(shadowTex);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    disposables.push(shadowMat);

    // 5. Shared PBR Material Palette (Varied Roughness & Metalness across adjacent parts)
    const stonePlinthMat = new THREE.MeshStandardMaterial({
      color: 0xe6e4dc,
      roughness: 0.86,
      metalness: 0.05,
    });
    const forestLacquerMat = new THREE.MeshPhysicalMaterial({
      color: 0x244c3a,
      roughness: 0.34,
      metalness: 0.25,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
    });
    const brushedBronzeMat = new THREE.MeshPhysicalMaterial({
      color: 0x9b7127,
      roughness: 0.22,
      metalness: 0.88,
      anisotropy: 0.6,
    });
    const brushedSteelMat = new THREE.MeshStandardMaterial({
      color: 0x4c5d67,
      roughness: 0.28,
      metalness: 0.82,
    });
    const emeraldCoreMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e563b,
      roughness: 0.14,
      metalness: 0.45,
      clearcoat: 0.9,
    });
    const ivoryCeramicMat = new THREE.MeshStandardMaterial({
      color: 0xfaf9f5,
      roughness: 0.58,
      metalness: 0.08,
    });
    const crystalDomeMat = new THREE.MeshPhysicalMaterial({
      color: 0xebf3ef,
      metalness: 0.0,
      roughness: 0.08,
      transmission: isSoftwareGl ? 0 : 0.9,
      transparent: true,
      opacity: isSoftwareGl ? 0.28 : 1.0,
      ior: 1.52,
      thickness: 0.6,
      depthWrite: false,
    });
    disposables.push(
      stonePlinthMat,
      forestLacquerMat,
      brushedBronzeMat,
      brushedSteelMat,
      emeraldCoreMat,
      ivoryCeramicMat,
      crystalDomeMat
    );

    const pickableProxies: THREE.Object3D[] = [];

    // =========================================================================
    // HERO SUBJECT: 9-Part Procedural Cryptographic Attestation Vault (`THREE.Group`)
    // Grounded flush at y = 0 with bottom-center pivot
    // =========================================================================
    const vaultGroup = new THREE.Group();
    vaultGroup.position.set(0, 0, 0);
    scene.add(vaultGroup);

    // Contact shadow beneath Vault
    const vaultShadowGeo = new THREE.PlaneGeometry(5.8, 5.8);
    disposables.push(vaultShadowGeo);
    const vaultShadow = new THREE.Mesh(vaultShadowGeo, shadowMat);
    vaultShadow.rotation.x = -Math.PI / 2;
    vaultShadow.position.y = 0.015;
    vaultGroup.add(vaultShadow);

    // Part 1: Stepped Octagonal Stone Plinth (Primary Silhouette)
    const plinthGeo = new THREE.CylinderGeometry(2.15, 2.35, 0.36, 8);
    plinthGeo.translate(0, 0.18, 0);
    disposables.push(plinthGeo);
    const plinthMesh = new THREE.Mesh(plinthGeo, stonePlinthMat);
    plinthMesh.castShadow = true;
    plinthMesh.receiveShadow = true;
    vaultGroup.add(plinthMesh);

    // Part 2: Lathe-Turned Brushed Bronze Collar Ring (Secondary Read)
    const lathePoints = [
      new THREE.Vector2(1.65, 0.36),
      new THREE.Vector2(1.98, 0.36),
      new THREE.Vector2(1.92, 0.54),
      new THREE.Vector2(1.72, 0.64),
      new THREE.Vector2(1.58, 0.64),
    ];
    const collarGeo = new THREE.LatheGeometry(lathePoints, 32);
    disposables.push(collarGeo);
    const collarMesh = new THREE.Mesh(collarGeo, brushedBronzeMat);
    collarMesh.castShadow = true;
    collarMesh.receiveShadow = true;
    vaultGroup.add(collarMesh);

    // Part 3: Precision Engraved Calibration Dial Plate
    const dialTex = createCalibrationDialTexture(maxAnisotropy);
    const dialMat = new THREE.MeshStandardMaterial({
      map: dialTex,
      roughness: 0.42,
      metalness: 0.15,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const dialGeo = new THREE.CylinderGeometry(1.56, 1.56, 0.08, 48);
    dialGeo.translate(0, 0.64, 0);
    disposables.push(dialTex, dialMat, dialGeo);
    const dialMesh = new THREE.Mesh(dialGeo, dialMat);
    dialMesh.receiveShadow = true;
    vaultGroup.add(dialMesh);

    // Part 4: Four Bevelled Architectural Buttress Pillars (`ExtrudeGeometry`)
    const pillarShape = new THREE.Shape();
    pillarShape.moveTo(-0.14, -0.22);
    pillarShape.lineTo(0.14, -0.22);
    pillarShape.lineTo(0.1, 0.22);
    pillarShape.lineTo(-0.1, 0.22);
    pillarShape.closePath();
    const pillarGeo = new THREE.ExtrudeGeometry(pillarShape, {
      depth: 1.55,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.025,
      bevelSegments: 2,
    });
    pillarGeo.rotateX(-Math.PI / 2);
    disposables.push(pillarGeo);

    const pillarsGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const pMesh = new THREE.Mesh(pillarGeo, forestLacquerMat);
      pMesh.position.set(Math.cos(angle) * 1.48, 0.62, Math.sin(angle) * 1.48);
      pMesh.rotation.y = -angle + Math.PI / 2;
      pMesh.castShadow = true;
      pillarsGroup.add(pMesh);
    }
    vaultGroup.add(pillarsGroup);

    // Part 5: Outer Deterministic Rule Gimbal Ring (`TorusGeometry`)
    const outerRingGeo = new THREE.TorusGeometry(1.12, 0.065, 20, 64);
    disposables.push(outerRingGeo);
    const outerRingMesh = new THREE.Mesh(outerRingGeo, brushedSteelMat);
    outerRingMesh.position.set(0, 1.85, 0);
    outerRingMesh.castShadow = true;
    vaultGroup.add(outerRingMesh);

    // Part 6: Inner SHA-256 Hash-Chain Gimbal Ring (`TorusGeometry`)
    const innerRingGeo = new THREE.TorusGeometry(0.84, 0.05, 18, 56);
    disposables.push(innerRingGeo);
    const innerRingMesh = new THREE.Mesh(innerRingGeo, brushedBronzeMat);
    innerRingMesh.position.set(0, 1.85, 0);
    innerRingMesh.castShadow = true;
    vaultGroup.add(innerRingMesh);

    // Part 7: Suspended Ed25519 Cryptographic Crystal Core (`OctahedronGeometry` + Equatorial Collar)
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 1.85, 0);
    const octaGeo = new THREE.OctahedronGeometry(0.46, 0);
    const coreBandGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.07, 8);
    disposables.push(octaGeo, coreBandGeo);
    const octaMesh = new THREE.Mesh(octaGeo, emeraldCoreMat);
    const coreBandMesh = new THREE.Mesh(coreBandGeo, brushedBronzeMat);
    octaMesh.castShadow = true;
    coreGroup.add(octaMesh, coreBandMesh);
    vaultGroup.add(coreGroup);

    // Part 8: Optical Protective Glass Canopy Dome (`SphereGeometry` Hemisphere)
    const domeGeo = new THREE.SphereGeometry(1.42, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.52);
    disposables.push(domeGeo);
    const domeMesh = new THREE.Mesh(domeGeo, crystalDomeMat);
    domeMesh.position.set(0, 1.55, 0);
    domeMesh.renderOrder = 5;
    vaultGroup.add(domeMesh);

    // Part 9: Upper Crown Ring & Finial Beacon (`LatheGeometry`)
    const crownPoints = [
      new THREE.Vector2(0.0, 0.45),
      new THREE.Vector2(0.18, 0.35),
      new THREE.Vector2(0.08, 0.15),
      new THREE.Vector2(0.32, 0.0),
      new THREE.Vector2(0.0, 0.0),
    ];
    const crownGeo = new THREE.LatheGeometry(crownPoints, 24);
    disposables.push(crownGeo);
    const crownMesh = new THREE.Mesh(crownGeo, brushedBronzeMat);
    crownMesh.position.set(0, 3.05, 0);
    crownMesh.castShadow = true;
    vaultGroup.add(crownMesh);

    // Invisible Raycast Proxy for Vault
    const vaultProxyGeo = new THREE.CylinderGeometry(2.1, 2.2, 3.5, 12);
    vaultProxyGeo.translate(0, 1.75, 0);
    const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
    disposables.push(vaultProxyGeo, proxyMat);
    const vaultProxy = new THREE.Mesh(vaultProxyGeo, proxyMat);
    vaultProxy.layers.set(1);
    vaultProxy.userData = { nodeId: 'VAULT-CORE' };
    vaultGroup.add(vaultProxy);
    pickableProxies.push(vaultProxy);

    // =========================================================================
    // FOUR SURROUNDING INSTITUTIONAL & REGULATORY STATIONS (6-Part `THREE.Group` each)
    // =========================================================================
    const stationSpecs = [
      { id: 'INST-KKR-101', pos: new THREE.Vector3(-5.2, 0, 3.8), color: 0x244c3a },
      { id: 'INST-DEL-202', pos: new THREE.Vector3(5.2, 0, 3.8), color: 0x8e6218 },
      { id: 'INST-BOM-304', pos: new THREE.Vector3(-5.2, 0, -3.8), color: 0x1e563b },
      { id: 'AICTE-REG-01', pos: new THREE.Vector3(5.2, 0, -3.8), color: 0x475863 },
    ];

    const stationBaseGeo = new THREE.CylinderGeometry(1.15, 1.28, 0.24, 6);
    stationBaseGeo.translate(0, 0.12, 0);
    const stationDeckGeo = new THREE.CylinderGeometry(0.88, 0.96, 0.18, 6);
    stationDeckGeo.translate(0, 0.33, 0);
    const stationColGeo = new THREE.BoxGeometry(0.18, 1.15, 0.18);
    stationColGeo.translate(0, 0.95, 0);
    const stationLintelGeo = new THREE.BoxGeometry(1.25, 0.16, 0.44);
    stationLintelGeo.translate(0, 1.58, 0);
    const stationRotorGeo = new THREE.TorusGeometry(0.42, 0.04, 14, 36);
    const stationBeaconGeo = new THREE.OctahedronGeometry(0.2, 0);
    const stationShadowGeo = new THREE.PlaneGeometry(3.2, 3.2);
    const stationProxyGeo = new THREE.CylinderGeometry(1.25, 1.25, 2.2, 8);
    stationProxyGeo.translate(0, 1.1, 0);

    disposables.push(
      stationBaseGeo,
      stationDeckGeo,
      stationColGeo,
      stationLintelGeo,
      stationRotorGeo,
      stationBeaconGeo,
      stationShadowGeo,
      stationProxyGeo
    );

    const stationRotors: THREE.Mesh[] = [];
    const stationLintelMeshes: THREE.Mesh[] = [];
    const conduitCurves: THREE.CatmullRomCurve3[] = [];

    stationSpecs.forEach((spec) => {
      const stGroup = new THREE.Group();
      stGroup.position.copy(spec.pos);
      stGroup.lookAt(0, 0, 0);
      scene.add(stGroup);

      // Contact shadow
      const stShadow = new THREE.Mesh(stationShadowGeo, shadowMat);
      stShadow.rotation.x = -Math.PI / 2;
      stShadow.position.y = 0.015;
      stGroup.add(stShadow);

      // Part 1: Hexagonal Plinth
      const baseMesh = new THREE.Mesh(stationBaseGeo, stonePlinthMat);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      stGroup.add(baseMesh);

      // Part 2: Ceramic Upper Deck
      const deckMesh = new THREE.Mesh(stationDeckGeo, ivoryCeramicMat);
      deckMesh.castShadow = true;
      deckMesh.receiveShadow = true;
      stGroup.add(deckMesh);

      // Part 3 & 4: Twin Architectural Columns
      const colLeft = new THREE.Mesh(stationColGeo, brushedSteelMat);
      colLeft.position.x = -0.42;
      colLeft.castShadow = true;
      const colRight = new THREE.Mesh(stationColGeo, brushedSteelMat);
      colRight.position.x = 0.42;
      colRight.castShadow = true;
      stGroup.add(colLeft, colRight);

      // Part 5: Cantilevered Intake Lintel Cap
      const lintelMat = new THREE.MeshStandardMaterial({
        color: spec.color,
        roughness: 0.38,
        metalness: 0.3,
      });
      disposables.push(lintelMat);
      const lintelMesh = new THREE.Mesh(stationLintelGeo, lintelMat);
      lintelMesh.castShadow = true;
      stGroup.add(lintelMesh);
      stationLintelMeshes.push(lintelMesh);

      // Part 6: Rotating Telemetry Ring + Signal Octahedron
      const rotorMesh = new THREE.Mesh(stationRotorGeo, brushedBronzeMat);
      rotorMesh.position.set(0, 0.96, 0);
      stGroup.add(rotorMesh);
      stationRotors.push(rotorMesh);

      const beaconMesh = new THREE.Mesh(stationBeaconGeo, emeraldCoreMat);
      beaconMesh.position.set(0, 0.96, 0);
      stGroup.add(beaconMesh);

      // Raycast proxy
      const stProxy = new THREE.Mesh(stationProxyGeo, proxyMat);
      stProxy.layers.set(1);
      stProxy.userData = { nodeId: spec.id };
      stGroup.add(stProxy);
      pickableProxies.push(stProxy);

      // Woven Verification Conduit (`TubeGeometry` along `CatmullRomCurve3`)
      const midPoint = spec.pos.clone().multiplyScalar(0.52);
      midPoint.y = 1.45;
      const startPoint = spec.pos.clone().setY(0.95);
      const endPoint = new THREE.Vector3(
        Math.sign(spec.pos.x) * 1.15,
        1.75,
        Math.sign(spec.pos.z) * 1.15
      );
      const curve = new THREE.CatmullRomCurve3([startPoint, midPoint, endPoint]);
      conduitCurves.push(curve);

      const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.032, 8, false);
      disposables.push(tubeGeo);
      const tubeMesh = new THREE.Mesh(tubeGeo, brushedBronzeMat);
      tubeMesh.castShadow = true;
      scene.add(tubeMesh);
    });

    // =========================================================================
    // INSTANCED MESH: 36 Deterministic Record Packets Flowing Along Conduits
    // =========================================================================
    const packetCount = 36;
    const packetGeo = new THREE.BoxGeometry(0.22, 0.09, 0.32);
    const packetMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.45,
    });
    disposables.push(packetGeo, packetMat);

    const packetsInstanced = new THREE.InstancedMesh(packetGeo, packetMat, packetCount);
    packetsInstanced.castShadow = !isSoftwareGl;
    packetsInstanced.frustumCulled = false;

    const paletteHex = [0x1e563b, 0x244c3a, 0x8e6218, 0x475863];
    for (let i = 0; i < packetCount; i++) {
      _color.setHex(paletteHex[i % paletteHex.length]);
      packetsInstanced.setColorAt(i, _color);
      _dummy.position.set(0, 1, 0);
      _dummy.updateMatrix();
      packetsInstanced.setMatrixAt(i, _dummy.matrix);
    }
    if (packetsInstanced.instanceColor) {
      packetsInstanced.instanceColor.needsUpdate = true;
    }
    packetsInstanced.instanceMatrix.needsUpdate = true;
    packetsInstanced.computeBoundingSphere();
    scene.add(packetsInstanced);

    // Pre-warm shaders on hardware GPUs
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting on Layer 1 for Interactive Node Inspection
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(pickableProxies, false);
      if (hits.length > 0 && hits[0].object.userData?.nodeId) {
        setSelectedNodeId(hits[0].object.userData.nodeId);
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    };
    window.addEventListener('resize', handleResize);

    // Software-WebGL Safe Animation Loop (`afterDraw` with WebGL2 fenceSync)
    let frameId = 0;
    let isDisposed = false;
    const clock = new THREE.Clock();
    let elapsedSim = 0;

    function afterDraw(cb: () => void) {
      if (isDisposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (sync && state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (isDisposed) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const st = stateRef.current;

      if (!st.isPaused) {
        elapsedSim += dt * st.flowSpeed;
      }

      // 1. Exponential damping for Exploded View Assembly separation
      st.explodedCurrent = THREE.MathUtils.damp(
        st.explodedCurrent,
        st.explodedTarget,
        6.5,
        dt
      );
      const exp = st.explodedCurrent;

      // Apply exploded view vertical offsets smoothly
      dialMesh.position.y = exp * 0.35;
      pillarsGroup.position.y = exp * 0.55;
      outerRingMesh.position.y = 1.85 + exp * 0.95;
      innerRingMesh.position.y = 1.85 + exp * 1.25;
      coreGroup.position.y = 1.85 + exp * 1.65 + Math.sin(elapsedSim * 1.8) * 0.05;
      domeMesh.position.y = 1.55 + exp * 2.35;
      crownMesh.position.y = 3.05 + exp * 2.85;

      for (let i = 0; i < stationLintelMeshes.length; i++) {
        stationLintelMeshes[i].position.y = exp * 0.5;
      }

      // 2. Smooth mechanical rotation of gimbals and cryptographic core
      outerRingMesh.rotation.y = elapsedSim * 0.45;
      outerRingMesh.rotation.x = Math.sin(elapsedSim * 0.6) * 0.35;
      innerRingMesh.rotation.y = -elapsedSim * 0.72;
      innerRingMesh.rotation.z = Math.cos(elapsedSim * 0.5) * 0.42;
      coreGroup.rotation.y = elapsedSim * 0.9;

      for (let i = 0; i < stationRotors.length; i++) {
        stationRotors[i].rotation.z = elapsedSim * 0.8 + i;
        stationRotors[i].rotation.y = Math.sin(elapsedSim * 0.5 + i) * 0.4;
      }

      // 3. Update 36 InstancedMesh Record Packets along the 4 CatmullRomCurve3 Conduits
      for (let i = 0; i < packetCount; i++) {
        const curveIdx = i % conduitCurves.length;
        const curve = conduitCurves[curveIdx];
        const progress = ((i / packetCount) + elapsedSim * 0.16) % 1;
        curve.getPointAt(progress, _vec3);
        curve.getTangentAt(progress, _tangent);

        _dummy.position.copy(_vec3);
        _dummy.position.y += Math.sin(progress * Math.PI) * 0.12;
        _mat4.lookAt(_vec3, _vec3.clone().add(_tangent), _up);
        _quat.setFromRotationMatrix(_mat4);
        _dummy.quaternion.copy(_quat);
        const pulseScale = 0.85 + Math.sin(progress * Math.PI) * 0.25;
        _dummy.scale.setScalar(pulseScale);
        _dummy.updateMatrix();
        packetsInstanced.setMatrixAt(i, _dummy.matrix);
      }
      packetsInstanced.instanceMatrix.needsUpdate = true;

      // 4. Smooth 2.8-Second Cinematic Camera Shift (2-3 seconds shift, then rests at target)
      if (st.transitionActive) {
        if (st.transitionStartTime === 0) {
          st.transitionStartTime = performance.now();
          st.startPos.copy(camera.position);
          st.startLook.copy(controls.target);
        }

        const now = performance.now();
        const elapsed = (now - st.transitionStartTime) / (st.transitionDuration * 1000);
        const preset = CAMERA_PRESETS[st.presetKey];
        _targetPos.set(...preset.position);
        _targetLook.set(...preset.target);

        if (elapsed >= 1) {
          camera.position.copy(_targetPos);
          controls.target.copy(_targetLook);
          st.transitionActive = false;
        } else {
          // Smooth cubic ease-in-out curve
          const ease =
            elapsed < 0.5
              ? 4 * elapsed * elapsed * elapsed
              : 1 - Math.pow(-2 * elapsed + 2, 3) / 2;
          camera.position.lerpVectors(st.startPos, _targetPos, ease);
          controls.target.lerpVectors(st.startLook, _targetLook, ease);
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      controls.removeEventListener('start', onControlStart);
      controls.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  const activeNode = NODE_TELEMETRY[selectedNodeId] || NODE_TELEMETRY['VAULT-CORE'];

  return (
    <div
      className={`relative overflow-hidden bg-[#F5F1E8] select-none ${
        embedded ? 'w-full h-[540px] rounded border border-[#E4DED2]' : 'w-screen h-screen'
      }`}
    >
      {/* Isolated WebGL Mount Container */}
      <div
        ref={canvasMountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D WEAVE Cryptographic Attestation & Institutional Topology"
      />

      {/* Minimal Top-Left Specification & Selected Node Telemetry Header */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-start justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto bg-[#FFFDF8] border border-[#E4DED2] rounded px-4 py-3 shadow-xs max-w-md">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#85866B] font-semibold">
              3D SPATIAL VERIFICATION TOPOLOGY · {activeNode.id}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FBF9F4] text-[#85866B] border border-[#C5AD82]/40 font-medium">
              {activeNode.statusLabel}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-[#302F29] leading-snug">{activeNode.title}</h2>
          <p className="text-xs text-[#77746B] mt-0.5">{activeNode.subtitle}</p>
          <div className="mt-2 pt-2 border-t border-[#ECE7DC] flex items-center justify-between text-[11px] font-mono text-[#302F29]">
            <span>{activeNode.metrics}</span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
          {/* Explanatory Control Buttons */}
          <button
            type="button"
            onClick={() => {
              registerUserInteraction();
              setActiveModal('what');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#FFFDF8] text-[#302F29] border border-[#E4DED2] rounded hover:border-[#C5AD82] hover:bg-[#FBF9F4] transition-colors shadow-xs"
          >
            <Info className="w-3.5 h-3.5 text-[#85866B]" /> What is this?
          </button>

          <button
            type="button"
            onClick={() => {
              registerUserInteraction();
              setActiveModal('why');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#FFFDF8] text-[#302F29] border border-[#E4DED2] rounded hover:border-[#C5AD82] hover:bg-[#FBF9F4] transition-colors shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#85866B]" /> Why is this important?
          </button>

          <button
            type="button"
            onClick={() => {
              registerUserInteraction();
              setActiveModal('components');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#FFFDF8] text-[#302F29] border border-[#E4DED2] rounded hover:border-[#C5AD82] hover:bg-[#FBF9F4] transition-colors shadow-xs"
          >
            <Box className="w-3.5 h-3.5 text-[#85866B]" /> Explore components
          </button>

          <button
            type="button"
            onClick={() => {
              registerUserInteraction();
              setAutoTourEnabled((prev) => !prev);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded border transition-colors shadow-xs ${
              autoTourEnabled
                ? 'bg-[#FBF9F4] text-[#85866B] border-[#C5AD82]/50 font-medium'
                : 'bg-[#FFFDF8] text-[#77746B] border-[#E4DED2]'
            }`}
            title="Toggle automated camera and assembly tour"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Tour: {autoTourEnabled ? 'Auto ON' : 'Paused'}</span>
          </button>

          {embedded ? (
            <Link
              to="/app/topology"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#302F29] text-[#FFFDF8] rounded hover:bg-[#414B38] transition-colors shadow-xs"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Fullscreen 3D
            </Link>
          ) : (
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#302F29] text-[#FFFDF8] rounded hover:bg-[#414B38] transition-colors shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Return to Workspace
            </Link>
          )}
        </div>
      </div>

      {/* Unified Collapsible Bottom Control Dock */}
      <div
        className="absolute inset-x-0 mx-auto bottom-4 z-20 w-[min(940px,94vw)] transition-transform duration-300"
        style={{
          transform: dockCollapsed ? 'translateY(calc(100% - 34px))' : 'translateY(0)',
        }}
      >
        <div className="flex justify-center mb-1">
          <button
            type="button"
            onClick={() => setDockCollapsed((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono bg-[#FFFDF8] text-[#302F29] border border-[#E4DED2] rounded-t shadow-xs hover:bg-[#FBF9F4] transition-colors"
            title="Toggle Control Dock (Shortcut: H)"
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-[#85866B]" /> Show 3D Controls (H)
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-[#77746B]" /> Hide Controls (H)
              </>
            )}
          </button>
        </div>

        <div className="bg-[#FFFDF8] border border-[#E4DED2] rounded px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Camera View Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#77746B] mr-1 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#85866B]" /> Camera:
              </span>
              {(Object.keys(CAMERA_PRESETS) as CameraPresetKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectPreset(key)}
                  className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
                    activePreset === key
                      ? 'bg-[#302F29] text-[#FFFDF8] border-[#302F29]'
                      : 'bg-[#FBF9F4] text-[#302F29] border-[#E4DED2] hover:bg-[#ECE7DC]'
                  }`}
                >
                  {CAMERA_PRESETS[key].label}
                </button>
              ))}
            </div>

            {/* Exploded View Slider */}
            <div className="flex items-center gap-2.5">
              <label
                htmlFor="weave-exploded-slider"
                className="text-[11px] font-mono uppercase tracking-wider text-[#77746B] flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5 text-[#85866B]" /> Exploded Assembly:
              </label>
              <input
                id="weave-exploded-slider"
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={explodedFactor}
                onChange={(e) => {
                  registerUserInteraction();
                  setExplodedFactor(parseFloat(e.target.value));
                }}
                className="w-24 accent-[#C5AD82] cursor-pointer"
              />
              <span className="text-xs font-mono text-[#302F29] w-9 text-right">
                {Math.round(explodedFactor * 100)}%
              </span>
            </div>

            {/* Controls & Reset */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  registerUserInteraction();
                  setIsPaused((p) => !p);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-[#E4DED2] bg-[#FBF9F4] text-[#302F29] hover:bg-[#ECE7DC] transition-colors"
              >
                {isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 text-[#85866B]" /> Resume Flow
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 text-[#77746B]" /> Pause Flow
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleResetView}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-[#E4DED2] bg-[#FFFDF8] text-[#77746B] hover:text-[#302F29] transition-colors"
                title="Reset Camera and Assembly"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset view
              </button>
            </div>
          </div>

          {/* Node Quick-Select Bar */}
          <div className="mt-2.5 pt-2 border-t border-[#ECE7DC] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#77746B] flex items-center gap-1 mr-1">
                <Box className="w-3 h-3 text-[#85866B]" /> Inspect Node:
              </span>
              {Object.keys(NODE_TELEMETRY).map((nodeKey) => (
                <button
                  key={nodeKey}
                  type="button"
                  onClick={() => {
                    registerUserInteraction();
                    setSelectedNodeId(nodeKey);
                    if (nodeKey === 'VAULT-CORE') handleSelectPreset('vault');
                    else handleSelectPreset('gateways');
                  }}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-colors ${
                    selectedNodeId === nodeKey
                      ? 'bg-[#FBF9F4] text-[#85866B] border-[#C5AD82]/50 font-semibold'
                      : 'bg-[#FFFDF8] text-[#77746B] border-[#E4DED2] hover:text-[#302F29]'
                  }`}
                >
                  {nodeKey}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#77746B]">
              <Sliders className="w-3 h-3 text-[#85866B]" />
              <span>Click any 3D node · Drag to orbit · Scroll to zoom</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Explanatory Modals */}
      {activeModal !== 'none' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs"
          onClick={() => setActiveModal('none')}
        >
          <div
            className="bg-[#FFFDF8] border border-[#E4DED2] rounded-md shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 text-[#302F29]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DED2]">
              <div className="flex items-center gap-2.5">
                {activeModal === 'what' && <Info className="w-5 h-5 text-[#85866B]" />}
                {activeModal === 'why' && <HelpCircle className="w-5 h-5 text-[#85866B]" />}
                {activeModal === 'components' && <Box className="w-5 h-5 text-[#85866B]" />}
                <h3 className="text-base font-semibold text-[#302F29]">
                  {activeModal === 'what' && 'What is the WEAVE 3D Apparatus?'}
                  {activeModal === 'why' && 'Why is this Architecture Important?'}
                  {activeModal === 'components' && 'Explore WEAVE Architecture Components'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="p-1 rounded text-[#77746B] hover:text-[#302F29] hover:bg-[#FBF9F4]"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: What is this? */}
            {activeModal === 'what' && (
              <div className="space-y-4 text-xs leading-relaxed text-[#5A5850]">
                <p>
                  The **WEAVE 3D Apparatus** is a physical-digital architectural simulation of the
                  APAAR student identity and institutional verification infrastructure developed for
                  Smart India Hackathon problem statement **SIH26263**.
                </p>
                <p>
                  Rather than presenting abstract tables alone, this apparatus models the live interaction
                  between decentralized engineering institutes, cryptographic attestation vaults,
                  streaming verification pipelines, and regulatory oversight gateways.
                </p>
                <div className="p-3.5 bg-[#FBF9F4] border border-[#E4DED2] rounded space-y-2">
                  <span className="font-semibold text-[#302F29] font-mono uppercase text-[11px]">
                    What you are seeing in real-time:
                  </span>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Decentralized Campus Nodes:</strong> Each peripheral station represents an AICTE technical institution ingesting student batches.</li>
                    <li><strong>Streaming Record Conduits:</strong> Data packets represent student records undergoing deterministic verification (STU-001 through STU-006).</li>
                    <li><strong>Central Cryptographic Core:</strong> The rotating vault where Ed25519 signatures and SHA-256 Merkle hashes are sealed.</li>
                    <li><strong>Exploded Assembly View:</strong> Reveals internal architectural layers from the ground ledger to the upper policy crown.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Modal Body: Why is this important? */}
            {activeModal === 'why' && (
              <div className="space-y-4 text-xs leading-relaxed text-[#5A5850]">
                <p>
                  Academic record governance across technical education in India has historically suffered
                  from three major vulnerabilities that this architecture directly solves:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#FBF9F4] border border-[#E4DED2] rounded space-y-1">
                    <span className="font-semibold text-[#302F29]">1. Multi-Tenant Privacy Isolation</span>
                    <p className="text-[11px] text-[#77746B]">Colleges cannot inspect each other's raw rosters or student details. Cross-institution matching uses salted SHA-256 digests.</p>
                  </div>
                  <div className="p-3.5 bg-[#FBF9F4] border border-[#E4DED2] rounded space-y-1">
                    <span className="font-semibold text-[#302F29]">2. Counselling Collision Detection</span>
                    <p className="text-[11px] text-[#77746B]">Detects concurrent duplicate seat allocations across institutions without waiting for annual end-of-year audits.</p>
                  </div>
                  <div className="p-3.5 bg-[#FBF9F4] border border-[#E4DED2] rounded space-y-1">
                    <span className="font-semibold text-[#302F29]">3. Offline Cryptographic Verification</span>
                    <p className="text-[11px] text-[#77746B]">Employers and scholarship bodies can mathematically verify records with Ed25519 signatures without connecting to live databases.</p>
                  </div>
                  <div className="p-3.5 bg-[#FBF9F4] border border-[#E4DED2] rounded space-y-1">
                    <span className="font-semibold text-[#302F29]">4. Approved Intake Oversight</span>
                    <p className="text-[11px] text-[#77746B]">Prevents over-enrolment past AICTE-sanctioned capacity in real time, upholding educational standards.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body: Explore components */}
            {activeModal === 'components' && (
              <div className="space-y-4 text-xs">
                {/* Component Select Chips */}
                <div className="flex flex-wrap gap-1.5 pb-2 border-b border-[#E4DED2]">
                  {APPARATUS_COMPONENTS.map((comp) => (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => setSelectedComponentId(comp.id)}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                        selectedComponentId === comp.id
                          ? 'bg-[#302F29] text-[#FFFDF8] font-medium'
                          : 'bg-[#FBF9F4] text-[#302F29] border border-[#E4DED2] hover:bg-[#ECE7DC]'
                      }`}
                    >
                      {comp.name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                {/* Selected Component Card */}
                {(() => {
                  const comp =
                    APPARATUS_COMPONENTS.find((c) => c.id === selectedComponentId) ||
                    APPARATUS_COMPONENTS[0];
                  return (
                    <div className="space-y-3 p-4 bg-[#FBF9F4] border border-[#E4DED2] rounded">
                      <div>
                        <div className="text-[11px] font-mono text-[#85866B] uppercase font-semibold">
                          Component ID: {comp.id}
                        </div>
                        <h4 className="text-sm font-semibold text-[#302F29] mt-0.5">{comp.name}</h4>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-semibold text-[#302F29]">Role: </span>
                          <span className="text-[#5A5850]">{comp.role}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[#302F29]">Inputs: </span>
                          <span className="text-[#5A5850]">{comp.inputs}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[#302F29]">Outputs: </span>
                          <span className="text-[#5A5850]">{comp.outputs}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[#302F29]">Relationships: </span>
                          <span className="text-[#5A5850]">{comp.relationships}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E4DED2] flex items-center justify-between">
                        <span className="text-[11px] font-mono text-[#77746B]">Preset Camera: {comp.cameraPreset}</span>
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectPreset(comp.cameraPreset);
                            setActiveModal('none');
                          }}
                          className="px-3 py-1 bg-[#302F29] text-[#FFFDF8] text-xs font-semibold rounded hover:bg-[#414B38] transition-colors shadow-sm"
                        >
                          Focus in 3D Scene
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#E4DED2] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="px-4 py-1.5 text-xs font-medium text-[#302F29] bg-[#FBF9F4] border border-[#E4DED2] rounded hover:bg-[#ECE7DC]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
