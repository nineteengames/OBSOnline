export interface OBSScene {
  sceneIndex: number;
  sceneName: string;
}

export interface OBSSceneItem {
  sceneItemId: number;
  sourceName: string;
  sceneItemEnabled: boolean;
  sceneItemLocked: boolean;
  sourceType: string;
}

export interface OBSAudioInput {
  inputName: string;
  inputKind: string;
  unmuted: boolean;
  inputVolumeDb: number;
  inputVolumeMul: number;
  inputSettings: Record<string, any>;
}

export interface OBSFilter {
  filterName: string;
  filterKind: string;
  filterIndex: number;
  filterEnabled: boolean;
  filterSettings: Record<string, any>;
}
