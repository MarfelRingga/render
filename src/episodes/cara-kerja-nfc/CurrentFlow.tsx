import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { theme, useTiming } from '../../lib/EpisodeShell';
import { buildCapToChipCurve, buildRectifierToCapCurve } from './Chip';
import { buildCardCoilCurve, buildPhoneCoilCurve } from './Coil';
import { VISUAL_FIELD_HZ } from './FieldLines';

interface CurrentFlowProps {
  phoneOrigin: [number, number, number];
  phoneRot?: [number, number, number];
  cardOrigin: [number, number, number];
  cardRot?: [number, number, number];
  phoneCurrentStrength: number;
  cardCurrentStrength: number;
  dcRectifierStrength: number;
  dcChipFeedStrength: number;
  dataPulseStrength: number;
  activeDataBit?: number;
}

const PHONE_DOT_COUNT = 26;
const CARD_DOT_COUNT = 32;
const DC_STAGE_A_COUNT = 6;
const DC_STAGE_B_COUNT = 6;
const DATA_DOT_COUNT = 10;

const _dummy = new THREE.Object3D();
const _pos = new THREE.Vector3();

export const CurrentFlow: React.FC<CurrentFlowProps> = ({
  phoneOrigin,
  phoneRot = [0, 0, 0],
  cardOrigin,
  cardRot = [0, 0, 0],
  phoneCurrentStrength,
  cardCurrentStrength,
  dcRectifierStrength,
  dcChipFeedStrength,
  dataPulseStrength,
  activeDataBit = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useTiming();

  const phoneMeshRef = useRef<THREE.InstancedMesh>(null);
  const cardMeshRef = useRef<THREE.InstancedMesh>(null);
  const dcMeshRef = useRef<THREE.InstancedMesh>(null);
  const dataMeshRef = useRef<THREE.InstancedMesh>(null);

  const { phoneCurve, cardCurve, rectToCapCurve, capToChipCurve, readerDataCurve, dotGeo } =
    useMemo(() => {
      const pCurve = buildPhoneCoilCurve();
      const cCurve = buildCardCoilCurve();
      const rCurve = buildRectifierToCapCurve();
      const chipCurve = buildCapToChipCurve();
      const dataCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(1.15, 0.39, 0.0),
        new THREE.Vector3(1.65, 0.39, 0.55),
        new THREE.Vector3(2.25, 0.39, 1.35),
        new THREE.Vector3(2.25, 0.39, 3.2),
      ]);
      const geo = new THREE.SphereGeometry(0.068, 10, 10);

      return {
        phoneCurve: pCurve,
        cardCurve: cCurve,
        rectToCapCurve: rCurve,
        capToChipCurve: chipCurve,
        readerDataCurve: dataCurve,
        dotGeo: geo,
      };
    }, []);

  useEffect(() => {
    return () => {
      dotGeo.dispose();
    };
  }, [dotGeo]);

  const timeSec = frame / fps;
  const acOscillation = Math.sin(2 * Math.PI * VISUAL_FIELD_HZ * timeSec);
  const inducedOscillation = Math.cos(2 * Math.PI * VISUAL_FIELD_HZ * timeSec);

  useLayoutEffect(() => {
    const mesh = phoneMeshRef.current;
    if (!mesh) return;
    const acOffset = (acOscillation * 0.045) % 1;
    const scale = phoneCurrentStrength > 0.02 ? 0.55 + 0.45 * phoneCurrentStrength : 0;

    for (let i = 0; i < PHONE_DOT_COUNT; i++) {
      const u = (((i / PHONE_DOT_COUNT + acOffset) % 1) + 1) % 1;
      phoneCurve.getPointAt(u, _pos);
      _dummy.position.set(_pos.x, _pos.y + 0.36, _pos.z);
      _dummy.scale.setScalar(scale);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [phoneCurve, phoneCurrentStrength, acOscillation]);

  useLayoutEffect(() => {
    const mesh = cardMeshRef.current;
    if (!mesh) return;
    const acOffset = (inducedOscillation * 0.038) % 1;
    const scale = cardCurrentStrength > 0.02 ? 0.4 + 0.65 * cardCurrentStrength : 0;

    for (let i = 0; i < CARD_DOT_COUNT; i++) {
      const u = (((i / CARD_DOT_COUNT + acOffset) % 1) + 1) % 1;
      cardCurve.getPointAt(u, _pos);
      _dummy.position.set(_pos.x, _pos.y + 0.025, _pos.z);
      _dummy.scale.setScalar(scale);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [cardCurve, cardCurrentStrength, inducedOscillation]);

  useLayoutEffect(() => {
    const mesh = dcMeshRef.current;
    if (!mesh) return;
    const travel = (timeSec * 1.15) % 1;

    for (let i = 0; i < DC_STAGE_A_COUNT; i++) {
      const u = (i / DC_STAGE_A_COUNT + travel) % 1;
      rectToCapCurve.getPointAt(u, _pos);
      _dummy.position.set(_pos.x, _pos.y, _pos.z);
      _dummy.scale.setScalar(dcRectifierStrength > 0.05 ? 0.65 * dcRectifierStrength : 0);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }

    for (let i = 0; i < DC_STAGE_B_COUNT; i++) {
      const u = (i / DC_STAGE_B_COUNT + travel) % 1;
      capToChipCurve.getPointAt(u, _pos);
      _dummy.position.set(_pos.x, _pos.y, _pos.z);
      _dummy.scale.setScalar(dcChipFeedStrength > 0.05 ? 0.72 * dcChipFeedStrength : 0);
      _dummy.updateMatrix();
      mesh.setMatrixAt(DC_STAGE_A_COUNT + i, _dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, [
    rectToCapCurve,
    capToChipCurve,
    dcRectifierStrength,
    dcChipFeedStrength,
    timeSec,
  ]);

  useLayoutEffect(() => {
    const mesh = dataMeshRef.current;
    if (!mesh) return;
    const travel = (timeSec * 1.6) % 1;

    for (let i = 0; i < DATA_DOT_COUNT; i++) {
      const u = (i / DATA_DOT_COUNT + travel) % 1;
      readerDataCurve.getPointAt(u, _pos);
      _dummy.position.set(_pos.x, _pos.y, _pos.z);
      const pulseScale =
        dataPulseStrength > 0.05 ? (0.55 + 0.5 * activeDataBit) * dataPulseStrength : 0;
      _dummy.scale.setScalar(pulseScale);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, [readerDataCurve, dataPulseStrength, activeDataBit, timeSec]);

  return (
    <group>
      <group position={phoneOrigin} rotation={phoneRot}>
        <instancedMesh
          ref={phoneMeshRef}
          args={[dotGeo, undefined, PHONE_DOT_COUNT]}
          frustumCulled={false}
        >
          <meshStandardMaterial
            color={theme.current}
            emissive={theme.current}
            emissiveIntensity={1.1}
            roughness={0.45}
            metalness={0}
          />
        </instancedMesh>

        <instancedMesh
          ref={dataMeshRef}
          args={[dotGeo, undefined, DATA_DOT_COUNT]}
          frustumCulled={false}
        >
          <meshStandardMaterial
            color={theme.data}
            emissive={theme.data}
            emissiveIntensity={1.2}
            roughness={0.45}
            metalness={0}
          />
        </instancedMesh>
      </group>

      <group position={cardOrigin} rotation={cardRot}>
        <instancedMesh
          ref={cardMeshRef}
          args={[dotGeo, undefined, CARD_DOT_COUNT]}
          frustumCulled={false}
        >
          <meshStandardMaterial
            color={theme.current}
            emissive={theme.current}
            emissiveIntensity={1.15}
            roughness={0.45}
            metalness={0}
          />
        </instancedMesh>

        <instancedMesh
          ref={dcMeshRef}
          args={[dotGeo, undefined, DC_STAGE_A_COUNT + DC_STAGE_B_COUNT]}
          frustumCulled={false}
        >
          <meshStandardMaterial
            color={theme.current}
            emissive={theme.current}
            emissiveIntensity={1.25}
            roughness={0.45}
            metalness={0}
          />
        </instancedMesh>
      </group>
    </group>
  );
};
