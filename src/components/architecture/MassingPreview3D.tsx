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

    if (massing.massingType === 'courtyard') {
      const armWidth = Math.max(3, massWidth * 0.28);
      const parts = [
        new THREE.Mesh(new THREE.BoxGeometry(massWidth, massHeight, armWidth), massMaterial),
        new THREE.Mesh(new THREE.BoxGeometry(massWidth, massHeight, armWidth), massMaterial),
        new THREE.Mesh(new THREE.BoxGeometry(armWidth, massHeight, massDepth), massMaterial),
      ];
      parts[0].position.set(0, massHeight / 2, -massDepth / 2 + armWidth / 2);
      parts[1].position.set(0, massHeight / 2, massDepth / 2 - armWidth / 2);
      parts[2].position.set(-massWidth / 2 + armWidth / 2, massHeight / 2, 0);
      parts.forEach((part) => scene.add(part));
    } else if (massing.massingType === 'stepped') {
      const floors = Math.max(1, massing.floors);
      const levels = Math.min(5, floors);
      for (let index = 0; index < levels; index += 1) {
        const levelHeight = massHeight / levels;
        const shrink = 1 - index * 0.1;
        const block = new THREE.Mesh(new THREE.BoxGeometry(massWidth * shrink, levelHeight, massDepth * shrink), massMaterial);
        block.position.set(index * 1.5, levelHeight / 2 + levelHeight * index, index * 1.2);
        scene.add(block);
      }
    } else {
      const massGeometry = new THREE.BoxGeometry(massWidth, massHeight, massDepth);
      const massMesh = new THREE.Mesh(massGeometry, massMaterial);
      massMesh.position.y = massHeight / 2;
      scene.add(massMesh);
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
          <p className="mt-1 text-sm text-slate-500">대지, 건축 가능 후보 영역, 검토용 건물 매스를 단순 모델로 표시합니다.</p>
        </div>
      </div>
      <div ref={containerRef} className="mt-3 h-[520px] w-full overflow-hidden rounded-lg border border-slate-200" />
    </section>
  );
}
