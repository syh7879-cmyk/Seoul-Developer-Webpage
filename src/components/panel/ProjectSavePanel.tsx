import { useEffect, useState } from 'react';
import type { FeasibilityInputs, FeasibilityResults } from '@/src/types/feasibility';
import type { ParcelFeature } from '@/src/types/parcel';
import type { SavedProject, ProjectVirtualMergeSummary } from '@/src/types/project';
import type { ZoneFeature } from '@/src/types/zone';
import { createProjectId, deleteProject, getSavedProjects, loadProject, saveProject } from '@/src/lib/storage';

interface ProjectSavePanelProps {
  selectedParcels: ParcelFeature[];
  selectedZone: ZoneFeature | null;
  feasibilityInputs: FeasibilityInputs;
  feasibilityResults: FeasibilityResults;
  virtualMergeSummary: ProjectVirtualMergeSummary;
  onLoadProject: (project: SavedProject) => void;
}

export default function ProjectSavePanel({
  selectedParcels,
  selectedZone,
  feasibilityInputs,
  feasibilityResults,
  virtualMergeSummary,
  onLoadProject,
}: ProjectSavePanelProps) {
  const [projectName, setProjectName] = useState('장위동 가상 합필');
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSavedProjects(getSavedProjects());
  }, []);

  const refreshProjects = () => setSavedProjects(getSavedProjects());

  const handleSave = () => {
    if (!projectName.trim()) {
      setMessage('프로젝트 이름을 입력해주세요.');
      return;
    }

    if (!selectedParcels.length) {
      setMessage('저장할 필지 묶음이 없습니다. 먼저 필지를 선택해주세요.');
      return;
    }

    const now = new Date().toISOString();
    const project: SavedProject = {
      projectId: createProjectId(),
      projectName: projectName.trim(),
      createdAt: now,
      updatedAt: now,
      selectedParcelIds: selectedParcels.map((parcel) => parcel.id),
      selectedZoneId: selectedZone?.id,
      feasibilityInputs,
      feasibilityResults,
      virtualMergeSummary,
    };

    saveProject(project);
    refreshProjects();
    setMessage('프로젝트를 저장했습니다.');
  };

  const handleLoad = (projectId: string) => {
    const project = loadProject(projectId);
    if (!project) {
      setMessage('프로젝트를 찾을 수 없습니다.');
      refreshProjects();
      return;
    }

    onLoadProject(project);
    setProjectName(project.projectName);
    setMessage('프로젝트를 불러왔습니다.');
  };

  const handleDelete = (projectId: string) => {
    deleteProject(projectId);
    refreshProjects();
    setMessage('프로젝트를 삭제했습니다.');
  };

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <h3 className="font-semibold">프로젝트 저장</h3>
      <label className="mt-3 grid gap-1 text-sm">
        <span className="text-slate-700">프로젝트 이름</span>
        <input
          className="rounded border px-2 py-1"
          placeholder="프로젝트 이름"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
        />
      </label>

      {!selectedParcels.length ? (
        <p className="mt-2 rounded bg-slate-50 p-2 text-sm text-slate-600">저장할 필지 묶음이 없습니다. 먼저 필지를 선택해주세요.</p>
      ) : null}

      <button
        className="mt-3 w-full rounded bg-emerald-600 px-3 py-2 text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={!selectedParcels.length}
        onClick={handleSave}
      >
        현재 필지 묶음 저장
      </button>

      {message ? <div className="mt-3 rounded bg-emerald-50 p-2 text-sm text-emerald-800">{message}</div> : null}

      <div className="mt-4 space-y-2 text-sm">
        <div className="font-medium text-slate-800">저장된 프로젝트</div>
        {savedProjects.length ? (
          savedProjects.map((project) => (
            <div key={project.projectId} className="rounded border border-slate-200 p-2">
              <div className="font-medium">{project.projectName}</div>
              <div className="text-xs text-slate-500">{new Date(project.updatedAt).toLocaleString()} 업데이트</div>
              <div className="mt-1 text-xs text-slate-600">
                {project.selectedParcelIds.length}필지 · {project.virtualMergeSummary.virtualMergeGrade}
              </div>
              <div className="mt-2 flex gap-2">
                <button className="rounded bg-slate-800 px-2 py-1 text-white" onClick={() => handleLoad(project.projectId)}>
                  불러오기
                </button>
                <button className="rounded bg-red-500 px-2 py-1 text-white" onClick={() => handleDelete(project.projectId)}>
                  삭제
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded bg-slate-50 p-2 text-slate-500">저장된 프로젝트가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
