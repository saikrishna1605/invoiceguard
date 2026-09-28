import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  FileText, 
  CheckCircle2, 
  Bot, 
  ShieldCheck, 
  Sparkles, 
  Cpu
} from 'lucide-react';

export const Hero3DVisual: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Parallax rotation state
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  // 1. Three.js Background Particle Cloud & Orbital Rings
  useEffect(() => {
    const canvasContainer = canvasRef.current;
    if (!canvasContainer) return;

    const width = canvasContainer.clientWidth || 480;
    const height = canvasContainer.clientHeight || 480;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Orbital ring 1
    const ringGeo1 = new THREE.TorusGeometry(2.3, 0.015, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.45,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    group.add(ring1);

    // Orbital ring 2
    const ringGeo2 = new THREE.TorusGeometry(2.6, 0.012, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    group.add(ring2);

    // Floating Data Node Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cEmerald = new THREE.Color(0x10b981);
    const cSky = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const mixed = cEmerald.clone().lerp(cSky, Math.random());
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrameId: number | undefined;
    let clock = new THREE.Clock();

    if (!prefersReducedMotion) {
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        ring1.rotation.z = elapsed * 0.25;
        ring2.rotation.z = -elapsed * 0.2;
        particles.rotation.y = elapsed * 0.06;
        group.rotation.x = Math.sin(elapsed * 0.2) * 0.05;

        renderer.render(scene, camera);
      };
      animate();
    } else {
      renderer.render(scene, camera);
    }

    const handleResize = () => {
      if (!canvasContainer) return;
      const newWidth = canvasContainer.clientWidth;
      const newHeight = canvasContainer.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId !== undefined) {
        cancelAnimationFrame(animationFrameId);
      }
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (canvasContainer.contains(renderer.domElement)) {
        canvasContainer.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 2. Mouse Parallax Handler for 3D Layered Cards
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Subtle rotation limits: max ±12 degrees
    const rotateY = (x / (rect.width / 2)) * 12;
    const rotateX = -(y / (rect.height / 2)) * 12;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-lg aspect-square flex items-center justify-center select-none"
      style={{ perspective: '1100px' }}
    >
      {/* Background 3D Canvas with orbital rings & particles */}
      <div
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      />

      {/* Atmospheric Radial Glow behind central card */}
      <div className="absolute w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none -z-10" />
      <div className="absolute w-60 h-60 rounded-full bg-sky-500/10 blur-3xl pointer-events-none -z-10" />

      {/* 3D Preserved Layer Stack */}
      <div
        className="relative z-10 w-[340px] sm:w-[380px] transition-transform duration-300 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        {/* TOP LAYER: AI Analysis Banner (Floating in front: translateZ 45px) */}
        <div
          className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 transition-transform duration-200"
          style={{ transform: 'translateZ(45px)' }}
        >
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#151A22]/90 border border-emerald-500/40 shadow-xl backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>AI Analysis Active</span>
            </span>
          </div>
        </div>

        {/* CENTER LAYER: Main Invoice Card (translateZ 15px) */}
        <div
          className="bg-[#10141B]/95 border border-white/[0.12] rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          style={{ transform: 'translateZ(15px)' }}
        >
          {/* Subtle Scanning Laser Line */}
          <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent animate-pulse pointer-events-none top-0" />

          {/* Invoice Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Electronic Invoice
                </p>
                <p className="text-sm font-bold font-mono text-white">INV-1042</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Match</span>
              </span>
            </div>
          </div>

          {/* Supplier & Amount Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-sans uppercase font-bold text-slate-500">Supplier</p>
                <p className="text-xs font-semibold text-slate-200">Acme Supplies Ltd.</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-sans uppercase font-bold text-slate-500">Invoiced Total</p>
                <p className="text-lg font-extrabold font-mono text-white tracking-tight">₹84,500.00</p>
              </div>
            </div>

            {/* Reconciliation Strip */}
            <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-[#0A0D12]/90 border border-white/[0.06] text-[11px] font-mono">
              <div>
                <span className="text-[9px] uppercase font-sans text-slate-500 block">Matched PO</span>
                <span className="font-semibold text-slate-300">PO #1042</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase font-sans text-slate-500 block">Variance</span>
                <span className="font-semibold text-emerald-400">0.0% (Matched)</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center space-x-1">
              <Bot className="w-3.5 h-3.5 text-sky-400" />
              <span>Multi-Agent Checked</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">Ready for Human Review</span>
          </div>
        </div>

        {/* LEFT FLOATING LAYER: Validate PO Pill (translateZ 55px, offset left) */}
        <div
          className="absolute -bottom-4 -left-6 sm:-left-8 z-30 transition-transform duration-200"
          style={{ transform: 'translateZ(55px)' }}
        >
          <div className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-[#151A22]/95 border border-sky-500/40 shadow-2xl backdrop-blur-md">
            <div className="w-6 h-6 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-sky-400">Validate</p>
              <p className="text-xs font-bold text-white">3-Way PO Matched</p>
            </div>
          </div>
        </div>

        {/* RIGHT FLOATING LAYER: Assess Risk Badge (translateZ 60px, offset right) */}
        <div
          className="absolute -bottom-5 -right-4 sm:-right-6 z-30 transition-transform duration-200"
          style={{ transform: 'translateZ(60px)' }}
        >
          <div className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-[#151A22]/95 border border-emerald-500/40 shadow-2xl backdrop-blur-md">
            <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Assess</p>
              <p className="text-xs font-bold text-white">Risk: Low (Score: 0)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
