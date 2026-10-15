import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type FC,
  type MouseEvent as ReactMouseEvent,
  type WheelEvent as ReactWheelEvent,
  type TouchEvent as ReactTouchEvent,
} from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { VesselId, VesselPrediction } from '../../types/clinical';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  Info,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface CoronaryAnatomyViewerProps {
  vesselPredictions: {
    LAD: VesselPrediction;
    LCX: VesselPrediction;
    RCA: VesselPrediction;
  };
  selectedVessel: VesselId | null;
  onSelectVessel: (vesselId: VesselId | null) => void;
  userRole?: 'patient' | 'nurse' | 'doctor';
  className?: string;
}

export const CoronaryAnatomyViewer: FC<CoronaryAnatomyViewerProps> = ({
  vesselPredictions,
  selectedVessel,
  onSelectVessel,
  userRole = 'doctor',
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [hoveredVessel, setHoveredVessel] = useState<VesselId | null>(null);
  const [pulseActive, setPulseActive] = useState<boolean>(true);
  const [isRealisticModelLoaded, setIsRealisticModelLoaded] = useState<boolean>(false);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const heartRootGroupRef = useRef<THREE.Group | null>(null);
  const realisticMeshGroupRef = useRef<THREE.Group | null>(null);
  const vesselMeshesRef = useRef<Record<VesselId, THREE.Mesh[]>>({
    LAD: [],
    LCX: [],
    RCA: [],
  });
  const selectedVesselRef = useRef<VesselId | null>(selectedVessel);
  useEffect(() => {
    selectedVesselRef.current = selectedVessel;
  }, [selectedVessel]);

  // Camera orientation tracking
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.15, y: -0.2 });
  const currentRotationRef = useRef({ x: 0.15, y: -0.2 });
  const targetZoomRef = useRef<number>(5.2);
  const currentZoomRef = useRef<number>(5.2);

  // Anatomically grounded natural base vascular tones for each coronary nerve tree:
  // LAD = Deep Oceanic Blue (0x123f6d), LCX = Deep Forest Emerald (0x104d2e), RCA = Deep Royal Purple (0x441b5e)
  const getVesselColor = useCallback(
    (vesselId: VesselId): number => {
      if (vesselId === 'LAD') return 0x123f6d;
      if (vesselId === 'LCX') return 0x104d2e;
      if (vesselId === 'RCA') return 0x441b5e;
      return 0x7a3035;
    },
    []
  );

  // Distinct glowing emissive highlight colors making each nerve stand out:
  // LAD = Electric Cyan/Blue (0x00d8ff)
  // LCX = Vibrant Emerald/Mint Green (0x43e58d)
  // RCA = Radiant Electric Purple/Violet (0xc084fc)
  const getVesselAccentColor = useCallback(
    (vesselId: VesselId): number => {
      if (vesselId === 'LAD') return 0x00d8ff; // Electric Blue glow
      if (vesselId === 'LCX') return 0x43e58d; // Vibrant Emerald Green glow
      if (vesselId === 'RCA') return 0xc084fc; // Radiant Electric Purple glow
      return 0x00d8ff;
    },
    []
  );

  const resetCamera = useCallback(() => {
    targetRotationRef.current = { x: 0.15, y: -0.2 };
    targetZoomRef.current = 5.2;
    onSelectVessel(null);
  }, [onSelectVessel]);

  const zoomCamera = useCallback((delta: number) => {
    targetZoomRef.current = Math.max(3.0, Math.min(8.0, targetZoomRef.current + delta));
  }, []);

  const focusOnVessel = useCallback(
    (vesselId: VesselId) => {
      onSelectVessel(vesselId);
      if (vesselId === 'LAD') {
        // Anterior Interventricular view
        targetRotationRef.current = { x: 0.12, y: 0.05 };
        targetZoomRef.current = 4.3;
      } else if (vesselId === 'LCX') {
        // Left Posterolateral / Obtuse margin view
        targetRotationRef.current = { x: 0.22, y: -1.45 };
        targetZoomRef.current = 4.4;
      } else if (vesselId === 'RCA') {
        // Right Atrioventricular groove view
        targetRotationRef.current = { x: 0.18, y: 1.15 };
        targetZoomRef.current = 4.3;
      }
    },
    [onSelectVessel]
  );

  // Initialize Three.js scene & realistic GLB model
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isMounted = true;
    let animationFrameId: number;

    try {
      // 1. Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // 2. Camera
      const width = container.clientWidth || 600;
      const height = container.clientHeight || 460;
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(0, 0, currentZoomRef.current);
      cameraRef.current = camera;

      // 3. Renderer with high-end medical graphics settings
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.5;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // 4. Studio Medical Lighting Setup — warm, anatomically natural
      // Broader ambient for less muddy shadows
      const ambientLight = new THREE.AmbientLight(0x3a2828, 3.2);
      scene.add(ambientLight);

      // Hemisphere for natural sky/ground color bleed
      const hemiLight = new THREE.HemisphereLight(0xffe4d0, 0x1a0505, 1.8);
      scene.add(hemiLight);

      // Key light: bright warm-white directional
      const keyLight = new THREE.DirectionalLight(0xfff0e8, 3.4);
      keyLight.position.set(4, 7, 5);
      keyLight.castShadow = true;
      scene.add(keyLight);

      // Fill light: warm pinkish-red (simulates subsurface scatter bounce)
      const fillLight = new THREE.DirectionalLight(0xe89090, 2.0);
      fillLight.position.set(-5, 2, -3);
      scene.add(fillLight);

      // Cool clinical blue rim light (subtle)
      const rimLight = new THREE.DirectionalLight(0x528bff, 1.0);
      rimLight.position.set(-1, -6, 4);
      scene.add(rimLight);

      // Soft top accent
      const topLight = new THREE.PointLight(0xffccbb, 1.2, 14);
      topLight.position.set(0, 4.5, 2);
      scene.add(topLight);

      // 5. Main Root Group (holds realistic model + coronary overlays)
      const rootGroup = new THREE.Group();
      heartRootGroupRef.current = rootGroup;
      scene.add(rootGroup);

      const realisticGroup = new THREE.Group();
      realisticMeshGroupRef.current = realisticGroup;
      rootGroup.add(realisticGroup);

      vesselMeshesRef.current = { LAD: [], LCX: [], RCA: [] };

      // Helper function to create tapered tube geometry with exact mathematical continuity
      const createTaperedTube = (
        curve: THREE.Curve<THREE.Vector3>,
        tubularSegments: number,
        startRadius: number,
        endRadius: number,
        radialSegments = 10
      ): THREE.BufferGeometry => {
        const geo = new THREE.TubeGeometry(curve, tubularSegments, 1.0, radialSegments, false);
        const pos = geo.attributes.position;
        const vertex = new THREE.Vector3();
        const center = new THREE.Vector3();

        const ringVerts = radialSegments + 1;
        for (let i = 0; i <= tubularSegments; i++) {
          const u = i / tubularSegments;
          curve.getPointAt(u, center);
          const targetR = startRadius + (endRadius - startRadius) * Math.pow(u, 0.85);

          for (let j = 0; j < ringVerts; j++) {
            const idx = i * ringVerts + j;
            if (idx >= pos.count) break;
            vertex.fromBufferAttribute(pos, idx);
            const dir = vertex.clone().sub(center).normalize();
            vertex.copy(center).add(dir.multiplyScalar(targetR));
            pos.setXYZ(idx, vertex.x, vertex.y, vertex.z);
          }
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
        return geo;
      };

      // Helper function to project guide rays onto the heart surface using raycasting
      const snapRaysToSurface = (
        rays: { ox: number; oy: number; oz: number; tx: number; ty: number; tz: number }[],
        targetMeshes: THREE.Object3D[],
        standoff: number
      ): THREE.Vector3[] => {
        const raycaster = new THREE.Raycaster();
        const points: THREE.Vector3[] = [];

        for (const r of rays) {
          const origin = new THREE.Vector3(r.ox, r.oy, r.oz);
          const target = new THREE.Vector3(r.tx, r.ty, r.tz);
          const dir = new THREE.Vector3().subVectors(target, origin).normalize();
          raycaster.set(origin, dir);

          const hits = raycaster.intersectObjects(targetMeshes, true);
          if (hits.length > 0) {
            const hit = hits[0];
            const normal = hit.face
              ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize()
              : dir.clone().negate();
            // Point is placed directly on the surface + slight outward standoff
            points.push(hit.point.clone().add(normal.multiplyScalar(standoff)));
          } else {
            // Fallback to target if ray missed
            points.push(target);
          }
        }
        return points;
      };

      // 6. Coronary Artery Tree — organic vessels hugging & popping out from heart surface
      const createCoronaryArteries = (targetMeshes: THREE.Object3D[]) => {
        // Living Arterial Vessel Material (wet, glistening, subsurface warm glow)
        const makeVesselMaterial = (vesselId: VesselId) => {
          const baseColor = getVesselColor(vesselId);
          return new THREE.MeshPhysicalMaterial({
            color: baseColor,
            emissive: new THREE.Color(0x380508),
            emissiveIntensity: 0.22,
            roughness: 0.28,
            metalness: 0.02,
            clearcoat: 0.85,
            clearcoatRoughness: 0.15,
            transparent: true,
            opacity: 0.96,
            depthWrite: true,
            polygonOffset: true,
            polygonOffsetFactor: -1.0,
            polygonOffsetUnits: -1.0,
          });
        };

        // Subepicardial Bed Cushion Material (blends vessel into the heart muscle tissue)
        const makeBedMaterial = () => {
          return new THREE.MeshStandardMaterial({
            color: 0x4a1217,
            roughness: 0.72,
            metalness: 0.0,
            transparent: true,
            opacity: 0.38,
            polygonOffset: true,
            polygonOffsetFactor: -0.5,
            polygonOffsetUnits: -0.5,
          });
        };

        // A. LAD (Left Anterior Descending Artery)
        // Raycast path down anterior interventricular sulcus straight to cardiac apex
        const ladRays = [
          { ox: 0.08, oy: 0.65, oz: 2.0, tx: 0.08, ty: 0.65, tz: 0 },
          { ox: 0.12, oy: 0.40, oz: 2.0, tx: 0.12, ty: 0.40, tz: 0 },
          { ox: 0.10, oy: 0.15, oz: 2.0, tx: 0.10, ty: 0.15, tz: 0 },
          { ox: 0.05, oy: -0.10, oz: 2.0, tx: 0.05, ty: -0.10, tz: 0 },
          { ox: -0.02, oy: -0.35, oz: 2.0, tx: -0.02, ty: -0.35, tz: 0 },
          { ox: -0.08, oy: -0.65, oz: 2.0, tx: -0.08, ty: -0.65, tz: 0 },
          { ox: -0.12, oy: -0.95, oz: 2.0, tx: -0.12, ty: -0.95, tz: 0 },
          { ox: -0.15, oy: -1.25, oz: 2.0, tx: -0.15, ty: -1.25, tz: 0 },
        ];
        const ladPoints = snapRaysToSurface(ladRays, targetMeshes, 0.014);
        const ladCurve = new THREE.CatmullRomCurve3(ladPoints, false, 'centripetal');

        // LAD Bed Cushion (smooth anatomical margin blending into myocardium)
        const ladBedGeo = createTaperedTube(ladCurve, 42, 0.052, 0.024, 8);
        const ladBedMesh = new THREE.Mesh(ladBedGeo, makeBedMaterial());
        rootGroup.add(ladBedMesh);

        // LAD Main Arterial Trunk (raised in relief, popping out from heart surface)
        const ladGeo = createTaperedTube(ladCurve, 56, 0.038, 0.018, 10);
        const ladMat = makeVesselMaterial('LAD');
        const ladMesh = new THREE.Mesh(ladGeo, ladMat);
        rootGroup.add(ladMesh);
        vesselMeshesRef.current.LAD.push(ladMesh);

        // LAD Diagonal Branch (D1) — branches from anterior groove across LV free wall
        const d1Rays = [
          { ox: 0.10, oy: 0.15, oz: 1.5, tx: 0.10, ty: 0.15, tz: 0 },
          { ox: -0.15, oy: 0.00, oz: 1.5, tx: -0.15, ty: 0.00, tz: 0 },
          { ox: -0.35, oy: -0.18, oz: 1.5, tx: -0.35, ty: -0.18, tz: 0 },
          { ox: -0.55, oy: -0.40, oz: 1.5, tx: -0.55, ty: -0.40, tz: 0 },
        ];
        const d1Points = snapRaysToSurface(d1Rays, targetMeshes, 0.010);
        // Anchor branch origin precisely onto LAD trunk
        d1Points[0].copy(ladCurve.getPointAt(0.28));
        const d1Curve = new THREE.CatmullRomCurve3(d1Points, false, 'centripetal');
        const d1Geo = createTaperedTube(d1Curve, 28, 0.024, 0.012, 8);
        const d1Mesh = new THREE.Mesh(d1Geo, ladMat.clone());
        rootGroup.add(d1Mesh);
        vesselMeshesRef.current.LAD.push(d1Mesh);

        // B. LCX (Left Circumflex Artery)
        // Raycast path encircling left AV groove (coronary sulcus) around obtuse margin
        const lcxRays = [
          { ox: 0.08, oy: 0.65, oz: 1.5, tx: 0.08, ty: 0.65, tz: 0 },
          { ox: -0.30, oy: 0.55, oz: 1.5, tx: 0, ty: 0.55, tz: 0 },
          { ox: -1.8, oy: 0.40, oz: 0.6, tx: 0, ty: 0.40, tz: 0 },
          { ox: -1.8, oy: 0.20, oz: 0.1, tx: 0, ty: 0.20, tz: 0 },
          { ox: -1.8, oy: -0.05, oz: -0.5, tx: 0, ty: -0.05, tz: 0 },
          { ox: -1.2, oy: -0.30, oz: -1.8, tx: 0, ty: -0.30, tz: 0 },
          { ox: -0.6, oy: -0.55, oz: -1.8, tx: 0, ty: -0.55, tz: 0 },
        ];
        const lcxPoints = snapRaysToSurface(lcxRays, targetMeshes, 0.014);
        const lcxCurve = new THREE.CatmullRomCurve3(lcxPoints, false, 'centripetal');

        // LCX Bed Cushion
        const lcxBedGeo = createTaperedTube(lcxCurve, 42, 0.050, 0.024, 8);
        const lcxBedMesh = new THREE.Mesh(lcxBedGeo, makeBedMaterial());
        rootGroup.add(lcxBedMesh);

        // LCX Main Arterial Trunk
        const lcxGeo = createTaperedTube(lcxCurve, 56, 0.036, 0.018, 10);
        const lcxMat = makeVesselMaterial('LCX');
        const lcxMesh = new THREE.Mesh(lcxGeo, lcxMat);
        rootGroup.add(lcxMesh);
        vesselMeshesRef.current.LCX.push(lcxMesh);

        // LCX Obtuse Marginal Branch (OM1)
        const om1Rays = [
          { ox: -0.64, oy: 0.40, oz: 1.0, tx: -0.64, ty: 0.40, tz: 0 },
          { ox: -0.80, oy: 0.15, oz: 0.8, tx: -0.80, ty: 0.15, tz: 0 },
          { ox: -0.75, oy: -0.15, oz: 0.6, tx: -0.75, ty: -0.15, tz: 0 },
          { ox: -0.60, oy: -0.45, oz: 0.4, tx: -0.60, ty: -0.45, tz: 0 },
        ];
        const om1Points = snapRaysToSurface(om1Rays, targetMeshes, 0.010);
        om1Points[0].copy(lcxCurve.getPointAt(0.32));
        const om1Curve = new THREE.CatmullRomCurve3(om1Points, false, 'centripetal');
        const om1Geo = createTaperedTube(om1Curve, 28, 0.024, 0.012, 8);
        const om1Mesh = new THREE.Mesh(om1Geo, lcxMat.clone());
        rootGroup.add(om1Mesh);
        vesselMeshesRef.current.LCX.push(om1Mesh);

        // C. RCA (Right Coronary Artery)
        // Raycast path descending right atrioventricular groove
        const rcaRays = [
          { ox: 0.06, oy: 0.65, oz: 1.5, tx: 0.06, ty: 0.65, tz: 0 },
          { ox: 0.40, oy: 0.55, oz: 1.5, tx: 0.40, ty: 0.55, tz: 0 },
          { ox: 1.8, oy: 0.35, oz: 0.6, tx: 0, ty: 0.35, tz: 0 },
          { ox: 1.8, oy: 0.10, oz: 0.2, tx: 0, ty: 0.10, tz: 0 },
          { ox: 1.8, oy: -0.20, oz: -0.3, tx: 0, ty: -0.20, tz: 0 },
          { ox: 1.2, oy: -0.50, oz: -1.5, tx: 0, ty: -0.50, tz: 0 },
          { ox: 0.5, oy: -0.80, oz: -1.5, tx: 0, ty: -0.80, tz: 0 },
        ];
        const rcaPoints = snapRaysToSurface(rcaRays, targetMeshes, 0.014);
        const rcaCurve = new THREE.CatmullRomCurve3(rcaPoints, false, 'centripetal');

        // RCA Bed Cushion
        const rcaBedGeo = createTaperedTube(rcaCurve, 42, 0.052, 0.024, 8);
        const rcaBedMesh = new THREE.Mesh(rcaBedGeo, makeBedMaterial());
        rootGroup.add(rcaBedMesh);

        // RCA Main Arterial Trunk
        const rcaGeo = createTaperedTube(rcaCurve, 56, 0.038, 0.018, 10);
        const rcaMat = makeVesselMaterial('RCA');
        const rcaMesh = new THREE.Mesh(rcaGeo, rcaMat);
        rootGroup.add(rcaMesh);
        vesselMeshesRef.current.RCA.push(rcaMesh);

        // RCA Acute Marginal Branch (AM)
        const amRays = [
          { ox: 0.16, oy: 0.10, oz: 1.0, tx: 0.16, ty: 0.10, tz: 0 },
          { ox: 0.45, oy: -0.15, oz: 1.0, tx: 0.45, ty: -0.15, tz: 0 },
          { ox: 0.60, oy: -0.35, oz: 0.8, tx: 0.60, ty: -0.35, tz: 0 },
          { ox: 0.45, oy: -0.60, oz: 0.6, tx: 0.45, ty: -0.60, tz: 0 },
        ];
        const amPoints = snapRaysToSurface(amRays, targetMeshes, 0.010);
        amPoints[0].copy(rcaCurve.getPointAt(0.38));
        const amCurve = new THREE.CatmullRomCurve3(amPoints, false, 'centripetal');
        const amGeo = createTaperedTube(amCurve, 28, 0.024, 0.012, 8);
        const amMesh = new THREE.Mesh(amGeo, rcaMat.clone());
        rootGroup.add(amMesh);
        vesselMeshesRef.current.RCA.push(amMesh);

        // Subtle blood-flow particle dots inside coronary lumen
        const particleCount = 60;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i += 3) {
          const t = Math.random();
          let p: THREE.Vector3;
          if (i % 9 === 0) p = ladCurve.getPoint(t);
          else if (i % 9 === 3) p = lcxCurve.getPoint(t);
          else p = rcaCurve.getPoint(t);
          positions[i] = p.x + (Math.random() - 0.5) * 0.012;
          positions[i + 1] = p.y + (Math.random() - 0.5) * 0.012;
          positions[i + 2] = p.z + (Math.random() - 0.5) * 0.012;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
          color: 0xdd2233,
          size: 0.016,
          transparent: true,
          opacity: 0.65,
          blending: THREE.NormalBlending,
        });
        const particleMesh = new THREE.Points(particleGeo, particleMat);
        rootGroup.add(particleMesh);
      };

      // 7. Load Realistic Anatomical Human Heart (.glb)
      const loader = new GLTFLoader();
      loader.load(
        '/models/heart.glb',
        (gltf) => {
          if (!isMounted) return;

          const modelScene = gltf.scene;

          // Compute bounding box and normalize scale & center
          const box = new THREE.Box3().setFromObject(modelScene);
          const center = new THREE.Vector3();
          box.getCenter(center);
          const size = new THREE.Vector3();
          box.getSize(size);

          const maxDim = Math.max(size.x, size.y, size.z);
          const targetSize = 2.85;
          const scaleFactor = targetSize / maxDim;

          modelScene.scale.setScalar(scaleFactor);
          modelScene.position.x = -center.x * scaleFactor;
          modelScene.position.y = -center.y * scaleFactor;
          modelScene.position.z = -center.z * scaleFactor;

          const heartMeshes: THREE.Mesh[] = [];

          // Enhance materials for rich, lifelike, glistening myocardium appearance
          modelScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              heartMeshes.push(mesh);

              if (mesh.material) {
                const mat = mesh.material as THREE.MeshStandardMaterial;
                mat.roughness = 0.42;
                mat.metalness = 0.0;
                // Add warm organic red emissive to eliminate any muddy/dull appearance
                mat.emissive = new THREE.Color(0x380a0e);
                mat.emissiveIntensity = 0.20;
                if (mat.normalMap) {
                  mat.normalScale.set(1.3, 1.3);
                }
                mat.needsUpdate = true;
              }
            }
          });

          realisticGroup.add(modelScene);
          modelScene.updateMatrixWorld(true);

          // Build surface-snapped coronary tree using actual mesh coordinates
          createCoronaryArteries(heartMeshes);

          setIsRealisticModelLoaded(true);
          setIsLoadingModel(false);
        },
        (xhr) => {
          if (xhr.total > 0) {
            const pct = Math.round((xhr.loaded / xhr.total) * 100);
            setLoadProgress(pct);
          }
        },
        (error) => {
          console.warn('Could not load /models/heart.glb, applying anatomical fallback:', error);
          if (!isMounted) return;

          // Realistic procedural fallback if network fetch fails
          const fallbackMat = new THREE.MeshPhysicalMaterial({
            color: 0x9e2a2b,
            emissive: 0x3d0c0c,
            roughness: 0.4,
            metalness: 0.1,
            clearcoat: 0.4,
          });

          // Ventricular mass
          const ventGeo = new THREE.SphereGeometry(1.2, 32, 32);
          ventGeo.scale(0.9, 1.3, 0.8);
          const ventMesh = new THREE.Mesh(ventGeo, fallbackMat);
          ventMesh.position.set(0, -0.3, 0);
          realisticGroup.add(ventMesh);

          // Aorta arch
          const aortaCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.0, 0.7, 0.2),
            new THREE.Vector3(0.1, 1.3, 0.1),
            new THREE.Vector3(0.0, 1.6, -0.2),
            new THREE.Vector3(-0.5, 1.4, -0.4),
          ]);
          const aortaGeo = new THREE.TubeGeometry(aortaCurve, 24, 0.32, 16, false);
          const aortaMat = new THREE.MeshPhysicalMaterial({
            color: 0xba3c3c,
            roughness: 0.35,
          });
          const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
          realisticGroup.add(aortaMesh);

          createCoronaryArteries(realisticGroup.children);
          setIsRealisticModelLoaded(false);
          setIsLoadingModel(false);
        }
      );

      // 8. Animation Render Loop
      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Smooth rotation damping
        currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
        currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;
        currentZoomRef.current += (targetZoomRef.current - currentZoomRef.current) * 0.08;

        if (heartRootGroupRef.current) {
          heartRootGroupRef.current.rotation.x = currentRotationRef.current.x;
          heartRootGroupRef.current.rotation.y = currentRotationRef.current.y;

          // Cardiac contraction pulse (natural human resting heart rate ~68 bpm)
          if (pulseActive) {
            const beat = 1 + Math.sin(elapsedTime * 3.6) * 0.022 + Math.sin(elapsedTime * 7.2) * 0.01;
            heartRootGroupRef.current.scale.set(beat, beat, beat);
          }

          // Dynamic breathing glow on highlighted vessel
          if (selectedVesselRef.current) {
            const selectedMeshes = vesselMeshesRef.current[selectedVesselRef.current];
            if (selectedMeshes && selectedMeshes.length > 0) {
              const pulseGlow = 1.35 + Math.sin(elapsedTime * 4.5) * 0.35;
              selectedMeshes.forEach((mesh) => {
                const mat = mesh.material as THREE.MeshPhysicalMaterial;
                if (mat) {
                  mat.emissiveIntensity = pulseGlow;
                }
              });
            }
          }
        }

        if (cameraRef.current) {
          cameraRef.current.position.z = currentZoomRef.current;
        }

        renderer.render(scene, camera);
      };

      animate();

      // Handle Resize
      const handleResize = () => {
        if (!container || !rendererRef.current || !cameraRef.current) return;
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        cameraRef.current.aspect = newW / newH;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(newW, newH);
      };


      window.addEventListener('resize', handleResize);

      return () => {
        isMounted = false;
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch (err: unknown) {
      setWebglError(err instanceof Error ? err.message : 'WebGL initialization failed.');
      setIsLoadingModel(false);
    }
  }, [getVesselColor, pulseActive]);

  // Update vessel visual highlights on selection or hover: LAD = Blue, LCX = Green, RCA = Purple
  useEffect(() => {
    const vessels: VesselId[] = ['LAD', 'LCX', 'RCA'];
    vessels.forEach((vid) => {
      const meshes = vesselMeshesRef.current[vid];
      const isSelected = selectedVessel === vid;
      const isHovered = hoveredVessel === vid;
      const baseColor = getVesselColor(vid);
      const accentColor = getVesselAccentColor(vid);

      meshes.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshPhysicalMaterial;
        if (!mat) return;

        // Keep scale strictly anchored at 1.0 so vessels never float off the heart!
        mesh.scale.set(1.0, 1.0, 1.0);

        if (isSelected) {
          // Selected: brilliant vibrant glow in the nerve's distinct color!
          mat.color.setHex(baseColor);
          mat.emissive.setHex(accentColor);
          mat.emissiveIntensity = 1.35;
          mat.roughness = 0.14;
          mat.opacity = 1.0;
        } else if (isHovered) {
          // Hovered: preview glow in the nerve's distinct color!
          mat.color.setHex(baseColor);
          mat.emissive.setHex(accentColor);
          mat.emissiveIntensity = 0.7;
          mat.roughness = 0.18;
          mat.opacity = 0.98;
        } else {
          // Resting: subtle distinct colored emission so LAD (Blue), LCX (Green), RCA (Purple) are distinguishable
          mat.color.setHex(baseColor);
          mat.emissive.setHex(accentColor);
          mat.emissiveIntensity = selectedVessel ? 0.08 : 0.32;
          mat.roughness = 0.25;
          mat.opacity = selectedVessel ? 0.72 : 0.95;
        }
      });
    });
  }, [selectedVessel, hoveredVessel, getVesselColor, getVesselAccentColor]);

  // Mouse & Touch Drag Handlers
  const handleMouseDown = (e: ReactMouseEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: ReactMouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;
    targetRotationRef.current.y += deltaX * 0.008;
    targetRotationRef.current.x += deltaY * 0.008;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: ReactWheelEvent) => {
    e.preventDefault();
    zoomCamera(e.deltaY * 0.003);
  };

  // Touch controls for mobile tablets
  const handleTouchStart = (e: ReactTouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: ReactTouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - prevMousePosRef.current.x;
    const deltaY = e.touches[0].clientY - prevMousePosRef.current.y;
    targetRotationRef.current.y += deltaX * 0.008;
    targetRotationRef.current.x += deltaY * 0.008;
    prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const activeVesselData = selectedVessel ? vesselPredictions[selectedVessel] : null;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border border-[#20372a] bg-gradient-to-br from-[#101a13] to-[#0b120e] backdrop-blur-xl overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.35)] ${className}`}
    >
      {/* 3D Viewer Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1d3027] px-4 py-3 bg-[#0c140f]/85 z-10">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#70f0a0] shadow-[0_0_8px_#70f0a0] animate-ping" />
          <h3 className="text-xs sm:text-sm font-semibold tracking-wide text-white flex items-center gap-2">
            Anatomical Coronary Arborization
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#102318] text-[#8ef8b3] border border-[#2b5438] flex items-center gap-1 font-semibold">
              <Sparkles className="h-3 w-3" />
              {isRealisticModelLoaded ? 'PBR Human Heart (.GLB)' : 'Anatomical Model'}
            </span>
          </h3>
        </div>

        {/* Vessel Quick Select Tabs with Distinct Glowing Colors */}
        <div className="flex items-center gap-1.5">
          {(
            [
              { id: 'LAD', name: 'LAD', colorName: 'Blue', dot: 'bg-[#00d8ff] shadow-[0_0_8px_#00d8ff]', activeBg: 'bg-[#0c2e47] border-[#0284c7] text-[#38bdf8] shadow-[0_0_12px_rgba(0,216,255,0.25)]' },
              { id: 'LCX', name: 'LCX', colorName: 'Green', dot: 'bg-[#70f0a0] shadow-[0_0_8px_#70f0a0]', activeBg: 'bg-[#173b28] border-[#28583b] text-[#a6ffc4] shadow-[0_0_12px_rgba(112,240,160,0.25)]' },
              { id: 'RCA', name: 'RCA', colorName: 'Purple', dot: 'bg-[#c084fc] shadow-[0_0_8px_#c084fc]', activeBg: 'bg-[#2f1847] border-[#7c3aed] text-[#e9d5ff] shadow-[0_0_12px_rgba(192,132,252,0.25)]' },
            ] as const
          ).map((vInfo) => {
            const vId = vInfo.id;
            const pred = vesselPredictions[vId];
            const isSel = selectedVessel === vId;
            const probPct = Math.round(pred.probability * 100);

            return (
              <button
                key={vId}
                onClick={() => focusOnVessel(vId)}
                onMouseEnter={() => setHoveredVessel(vId)}
                onMouseLeave={() => setHoveredVessel(null)}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-lg transition-all flex items-center gap-1.5 border ${
                  isSel
                    ? `${vInfo.activeBg} font-bold`
                    : 'bg-[#0b140e] border-[#1d3027] text-[#84978c] hover:text-white hover:border-[#2b5438]'
                }`}
                title={`Focus ${vId}: ${pred.fullName} (${probPct}% risk probability) - ${vInfo.colorName} Nerve`}
              >
                <span className={`h-2 w-2 rounded-full ${vInfo.dot}`} />
                <span>{vId}</span>
                <span className="text-[10px] opacity-75 font-normal">({probPct}%)</span>
              </button>
            );
          })}

          <button
            onClick={resetCamera}
            className="p-1.5 rounded-lg bg-[#0b140e] border border-[#1d3027] text-[#84978c] hover:text-[#70f0a0] hover:border-[#2b5438] ml-1 transition"
            title="Reset Camera Orientation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Container */}
      <div
        className="relative w-full h-[420px] md:h-[480px] cursor-grab active:cursor-grabbing select-none bg-[#050906]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading Spinner / Progress Overlay */}
        {isLoadingModel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#050906]/90 z-20">
            <Loader2 className="h-8 w-8 text-[#70f0a0] animate-spin mb-3" />
            <h4 className="text-sm font-semibold text-white">Streaming Anatomical 3D Model...</h4>
            <p className="text-xs text-[#84978c] mt-1 font-mono">
              {loadProgress > 0 ? `${loadProgress}% of 7.5 MB loaded` : 'Preparing high-poly PBR shaders...'}
            </p>
          </div>
        )}

        {/* WebGL Error State */}
        {webglError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#050906]/90 z-20">
            <AlertTriangle className="h-10 w-10 text-[#f59e0b] mb-2" />
            <h4 className="text-base font-semibold text-white">3D Graphic Acceleration Fallback</h4>
            <p className="text-xs text-[#84978c] max-w-md mt-1">
              {webglError} Coronary risk mapping is rendered in high-fidelity schematic mode below.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4 w-full max-w-md">
              {(['LAD', 'LCX', 'RCA'] as VesselId[]).map((vid) => (
                <div key={vid} className="p-3 rounded-xl bg-[#101a13] border border-[#20372a] text-left">
                  <div className="text-xs font-mono font-bold text-white">{vid}</div>
                  <div className="text-sm font-semibold text-[#70f0a0] mt-1">
                    {Math.round(vesselPredictions[vid].probability * 100)}%
                  </div>
                  <div className="text-[10px] text-[#84978c] mt-0.5">{vesselPredictions[vid].status}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Three.js DOM Canvas Mount */}
        <div ref={mountRef} className="w-full h-full" />

        {/* Viewport Floating Controls */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <button
            onClick={() => zoomCamera(-0.45)}
            className="p-1.5 rounded-lg bg-[#0e1611]/90 backdrop-blur border border-[#1d3027] text-[#84978c] hover:text-[#70f0a0] transition"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => zoomCamera(0.45)}
            className="p-1.5 rounded-lg bg-[#0e1611]/90 backdrop-blur border border-[#1d3027] text-[#84978c] hover:text-[#70f0a0] transition"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPulseActive(!pulseActive)}
            className={`p-1.5 rounded-lg backdrop-blur border text-xs transition ${
              pulseActive
                ? 'bg-[#173b28] border-[#28583b] text-[#70f0a0]'
                : 'bg-[#0e1611]/90 border-[#1d3027] text-[#84978c]'
            }`}
            title="Toggle Cardiac Contraction Pulse"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* Anatomical Color-Coded Nerve Legend */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 px-3 py-2.5 rounded-xl bg-[#0c140f]/92 backdrop-blur-md border border-[#20372a] text-[11px] font-mono z-10 shadow-lg">
          <div className="text-[10px] font-semibold text-[#6e8577] uppercase tracking-wider">
            Coronary Nerve Highlights
          </div>
          <div className="flex items-center gap-2 text-[#edf6ef]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#00d8ff] shadow-[0_0_8px_#00d8ff]" />
            <span>LAD &bull; Electric Blue Glow</span>
          </div>
          <div className="flex items-center gap-2 text-[#edf6ef]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#70f0a0] shadow-[0_0_8px_#70f0a0]" />
            <span>LCX &bull; Neon Green Glow</span>
          </div>
          <div className="flex items-center gap-2 text-[#edf6ef]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#c084fc] shadow-[0_0_8px_#c084fc]" />
            <span>RCA &bull; Radiant Purple Glow</span>
          </div>
        </div>

        {/* Selected Vessel Inspector Overlay */}
        {activeVesselData && (
          <div className="absolute top-3 right-3 max-w-[290px] w-full p-4 rounded-xl bg-[#0b120e]/95 backdrop-blur-lg border border-[#20372a] shadow-2xl z-20 animate-in fade-in slide-in-from-right-3 duration-200">
            <div className="flex items-center justify-between border-b border-[#1d3027] pb-2 mb-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 font-bold"
                  style={{
                    color:
                      selectedVessel === 'LAD'
                        ? '#00d8ff'
                        : selectedVessel === 'LCX'
                        ? '#70f0a0'
                        : '#c084fc',
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        selectedVessel === 'LAD'
                          ? '#00d8ff'
                          : selectedVessel === 'LCX'
                          ? '#70f0a0'
                          : '#c084fc',
                    }}
                  />
                  {selectedVessel === 'LAD' ? 'Blue Nerve' : selectedVessel === 'LCX' ? 'Green Nerve' : 'Purple Nerve'}
                </span>
                <h4 className="text-sm font-bold text-white">{activeVesselData.fullName}</h4>
              </div>
              <button
                onClick={() => onSelectVessel(null)}
                className="text-xs text-[#84978c] hover:text-white px-1.5 py-0.5 rounded bg-[#101a13]"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-[#101a13] p-2 rounded-lg border border-[#1d3027]">
                <span className="text-[#84978c]">Model Estimated Risk:</span>
                <span
                  className="font-mono font-bold text-sm px-2 py-0.5 rounded"
                  style={{
                    color:
                      activeVesselData.probability >= 0.5
                        ? '#ffb39a'
                        : activeVesselData.probability >= 0.3
                        ? '#f59e0b'
                        : '#70f0a0',
                  }}
                >
                  {Math.round(activeVesselData.probability * 100)}%
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#6e8577] uppercase tracking-wider block">
                  Predicted Class
                </span>
                <div className="flex items-center gap-1.5 font-medium text-white mt-0.5">
                  {activeVesselData.hasStenosis ? (
                    <ShieldAlert className="h-3.5 w-3.5 text-[#ffb39a]" />
                  ) : (
                    <CheckCircle className="h-3.5 w-3.5 text-[#70f0a0]" />
                  )}
                  <span>{activeVesselData.status}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[#6e8577] uppercase tracking-wider block">
                  Perfusion Territory
                </span>
                <p className="text-[11px] text-[#84978c] leading-relaxed mt-0.5">
                  {activeVesselData.territory}
                </p>
              </div>

              {userRole === 'doctor' && (
                <div className="pt-1 border-t border-[#1d3027]">
                  <span className="text-[10px] text-[#6e8577] uppercase tracking-wider block">
                    Clinical Territory Impact
                  </span>
                  <p className="text-[11px] text-[#84978c] leading-relaxed mt-0.5">
                    {activeVesselData.clinicalSignificance}
                  </p>
                </div>
              )}

              <div className="p-2 rounded bg-[#0b140e] border border-[#1d3027] text-[10px] text-[#84978c] flex items-start gap-1.5">
                <Info className="h-3 w-3 text-[#70f0a0] shrink-0 mt-0.5" />
                <span>{activeVesselData.warningNote}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3D Viewer Footer Disclaimer */}
      <div className="px-4 py-2 border-t border-[#1d3027] bg-[#0c140f]/90 flex flex-wrap items-center justify-between text-[11px] text-[#6e8577]">
        <span>Drag to rotate 360&deg; &bull; Scroll to zoom &bull; Click LAD (Blue), LCX (Green), RCA (Purple) to inspect</span>
        <span className="font-mono text-[#70f0a0]/90">
          Realistic Human Heart Anatomy &bull; Surface-Anchored Arterial Mapping
        </span>
      </div>
    </div>
  );
};
