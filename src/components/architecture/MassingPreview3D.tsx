'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { BuildableAreaResult, MassingModel } from '@/src/types/architecture';

interface MassingPreview3DProps {
  buildableArea: BuildableAreaResult;
  massing: MassingModel;
}

const getMassColor = (type: MassingModel['massingType']) => {
  if (type === 'tower') return 0x64748b;
  if (type === 'courtyard') return 0x475569;
  if (type === 'stepped') return 0x334155;
  return 0x52627a;
};

const createBox = (
  width: number,
  height: number,
  depth: number,
  material: THREE.Material,
  position: [number, number, number],
) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(...position);
  return mesh;
};

const addFloorLines = (group: THREE.Object3D, width: number, depth: number, height: number, floors: number) => {
  const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.72 });
  const usableFloors = Math.max(1, floors);
  const interval = height / usableFloors;

  for (let floor = 1; floor < usableFloors; floor += 1) {
    const y = floor * interval;
    const front = createBox(width + 0.18, 0.08, 0.12, lineMaterial, [0, y, depth / 2 + 0.08]);
    const back = createBox(width + 0.18, 0.08, 0.12, lineMaterial, [0, y, -depth / 2 - 0.08]);
    group.add(front, back);
  }
};

const addFacadeRhythm = (group: THREE.Group, width: number, depth: number, height: number, floors: number) => {
  const panelMaterial = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
  const verticalCount = Math.max(4, Math.min(12, Math.floor(width / 3)));
  const floorCount = Math.max(2, Math.min(16, floors));
  const panelWidth = Math.max(0.45, width / (verticalCount * 2.4));
  const panelHeight = Math.max(0.45, height / (floorCount * 3.2));

  for (let column = 0; column < verticalCount; column += 1) {
    const x = -width / 2 + ((column + 0.5) * width) / verticalCount;
    for (let floor = 0; floor < floorCount; floor += 1) {
      const y = ((floor + 0.55) * height) / floorCount;
      const frontPanel = createBox(panelWidth, panelHeight, 0.08, panelMaterial, [x, y, depth / 2 + 0.12]);
      const backPanel = createBox(panelWidth, panelHeight, 0.08, panelMaterial, [x, y, -depth / 2 - 0.12]);
      group.add(frontPanel, backPanel);
    }
  }
};

const createArchitecturalBar = (
  width: number,
  height: number,
  depth: number,
  floors: number,
  material: THREE.Material,
  position: [number, number, number],
) => {
  const group = new THREE.Group();
  const body = createBox(width, height, depth, material, [0, height / 2, 0]);
  const coreMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  const rooftopMaterial = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.65 });
  const coreWidth = Math.max(1.6, Math.min(width * 0.16, 4.2));
  const coreDepth = Math.max(1.6, Math.min(depth * 0.42, 4.8));
  const core = createBox(coreWidth, height * 1.04, coreDepth, coreMaterial, [width / 2 - coreWidth * 0.7, height * 0.52, 0]);
  const rooftop = createBox(width * 0.28, Math.max(1.2, height * 0.06), depth * 0.36, rooftopMaterial, [0, height + Math.max(0.6, height * 0.03), 0]);

  group.add(body, core, rooftop);
  addFloorLines(group, width, depth, height, floors);
  addFacadeRhythm(group, width, depth, height, floors);
  group.position.set(...position);
  return group;
};

export default function MassingPreview3D({ buildableArea, massing }: MassingPreview3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 480;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(90, 90, 120);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1.3);
    light.position.set(80, 120, 100);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));

    const siteSide = Math.sqrt(Math.max(1, buildableArea.totalLandAreaSqm)) / 2;
    const buildableSide = Math.sqrt(Math.max(1, buildableArea.maxBuildingAreaSqm)) / 2;
    const siteGeometry = new THREE.BoxGeometry(siteSide, 0.5, siteSide * 0.78);
    const siteMaterial = new THREE.MeshStandardMaterial({ color: 0xdbeafe, roughness: 0.8 });
    const siteMesh = new THREE.Mesh(siteGeometry, siteMaterial);
    siteMesh.position.y = -0.3;
    scene.add(siteMesh);

    const buildableGeometry = new THREE.BoxGeometry(buildableSide, 0.8, buildableSide * 0.75);
    const buildableMaterial = new THREE.MeshStandardMaterial({ color: 0xbbf7d0, transparent: true, opacity: 0.45, roughness: 0.8 });
    const buildableMesh = new THREE.Mesh(buildableGeometry, buildableMaterial);
    buildableMesh.position.y = 0.15;
    scene.add(buildableMesh);

    const massWidth = Math.max(3, massing.widthM / 2);
    const massDepth = Math.max(3, massing.depthM / 2);
    const massHeight = Math.max(1, massing.heightM);
    const massMaterial = new THREE.MeshStandardMaterial({ color: getMassColor(massing.massingType), roughness: 0.55 });
    const podiumMaterial = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
    const podiumFloors = Math.min(4, Math.max(1, Math.floor(massing.floors * 0.22)));
    const podiumHeight = Math.min(massHeight * 0.32, podiumFloors * 3);
    const towerHeight = Math.max(1, massHeight - podiumHeight);
    const towerFloors = Math.max(1, massing.floors - podiumFloors);
    const podium = createBox(massWidth * 1.16, podiumHeight, massDepth * 1.22, podiumMaterial, [0, podiumHeight / 2, 0]);
    scene.add(podium);
    addFloorLines(podium, massWidth * 1.16, massDepth * 1.22, podiumHeight, podiumFloors);

    if (massing.massingType === 'courtyard') {
      const armWidth = Math.max(3, massWidth * 0.26);
      const parts = [
        createArchitecturalBar(massWidth, towerHeight, armWidth, towerFloors, massMaterial, [0, podiumHeight, -massDepth / 2 + armWidth / 2]),
        createArchitecturalBar(massWidth, towerHeight * 0.92, armWidth, towerFloors, massMaterial, [0, podiumHeight, massDepth / 2 - armWidth / 2]),
        createArchitecturalBar(armWidth, towerHeight * 0.86, massDepth, towerFloors, massMaterial, [-massWidth / 2 + armWidth / 2, podiumHeight, 0]),
      ];
      parts.forEach((part) => scene.add(part));
    } else if (massing.massingType === 'stepped') {
      const floors = Math.max(1, massing.floors);
      const levels = Math.min(5, floors);
      let currentY = podiumHeight;
      for (let index = 0; index < levels; index += 1) {
        const levelHeight = towerHeight / levels;
        const shrink = 1 - index * 0.12;
        const block = createArchitecturalBar(massWidth * shrink, levelHeight, massDepth * shrink, Math.max(1, Math.round(towerFloors / levels)), massMaterial, [index * 1.3, currentY, index * 1.1]);
        currentY += levelHeight;
        scene.add(block);
      }
    } else if (massing.massingType === 'tower') {
      const towerA = createArchitecturalBar(massWidth * 0.68, towerHeight, massDepth * 0.68, towerFloors, massMaterial, [-massWidth * 0.22, podiumHeight, 0]);
      const towerB = createArchitecturalBar(massWidth * 0.48, towerHeight * 0.82, massDepth * 0.48, Math.max(1, Math.round(towerFloors * 0.82)), massMaterial, [massWidth * 0.32, podiumHeight, -massDepth * 0.18]);
      scene.add(towerA, towerB);
    } else {
      const barA = createArchitecturalBar(massWidth, towerHeight, massDepth * 0.58, towerFloors, massMaterial, [0, podiumHeight, -massDepth * 0.16]);
      const barB = createArchitecturalBar(massWidth * 0.62, towerHeight * 0.78, massDepth * 0.42, Math.max(1, Math.round(towerFloors * 0.78)), massMaterial, [massWidth * 0.12, podiumHeight, massDepth * 0.26]);
      scene.add(barA, barB);
    }

    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const road = new THREE.Mesh(new THREE.BoxGeometry(siteSide * 1.25, 0.4, 5), roadMaterial);
    road.position.set(0, 0.05, siteSide * 0.42);
    scene.add(road);

    const grid = new THREE.GridHelper(siteSide * 1.5, 12, 0x94a3b8, 0xcbd5e1);
    grid.position.y = 0.02;
    scene.add(grid);

    let frame = 0;
    const render = () => {
      frame = requestAnimationFrame(render);
      scene.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [buildableArea, massing]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">3D 매스 모델</h2>
          <p className="mt-1 text-sm text-slate-500">포디움, 주동, 코어, 옥탑, 층 구분선, 입면 리듬을 조합한 검토용 건축 스터디 매스입니다.</p>
        </div>
      </div>
      <div ref={containerRef} className="mt-3 h-[520px] w-full overflow-hidden rounded-lg border border-slate-200" />
    </section>
  );
}
