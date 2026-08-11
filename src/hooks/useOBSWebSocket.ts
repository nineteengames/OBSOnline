import { useState, useCallback, useRef, useEffect } from 'react';
import OBSWebSocket, { EventSubscription } from 'obs-websocket-js';
import type { OBSScene, OBSSceneItem, OBSAudioInput, OBSFilter } from '../types/obs';

export interface ConnectionDetails {
  ip: string;
  port: string;
  password?: string;
  isMock: boolean;
}

export function useOBSWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [scenes, setScenes] = useState<OBSScene[]>([]);
  const [currentScene, setCurrentScene] = useState<string>('');
  const [sceneItems, setSceneItems] = useState<OBSSceneItem[]>([]);
  const [audioInputs, setAudioInputs] = useState<OBSAudioInput[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isVirtualCam, setIsVirtualCam] = useState(false);
  const [isStudioModeEnabled, setIsStudioModeEnabled] = useState(false);
  const [previewScene, setPreviewScene] = useState<string>('');
  const [transitions, setTransitions] = useState<{ transitionName: string }[]>([]);
  const [currentTransition, setCurrentTransition] = useState<string>('');
  const [obsStats, setObsStats] = useState({ cpuUsage: 0, memoryUsage: 0, activeFps: 0, averageFrameRenderTime: 0 });
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [audioFilters, setAudioFilters] = useState<Record<string, OBSFilter[]>>({});
  const [inputPropertiesMap, setInputPropertiesMap] = useState<Record<string, Record<string, { itemName: string, itemValue: any }[]>>>({});
  
  const obs = useRef(new OBSWebSocket());
  const previewInterval = useRef<number | null>(null);
  const meterInterval = useRef<number | null>(null);
  const meterCallbacks = useRef(new Map<string, Array<(mul: number) => void>>());

  const startPreviewPolling = useCallback((sceneName: string) => {
    if (previewInterval.current) {
      window.clearInterval(previewInterval.current);
    }
    
    if (isMockMode) {
      // Setup mock preview polling
      previewInterval.current = window.setInterval(() => {
        // Just generic placeholder colors to simulate changes
        const colors = ['#1e1e2e', '#181825', '#11111b'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Create a simple dummy canvas image
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = randomColor;
          ctx.fillRect(0, 0, 1280, 720);
          ctx.fillStyle = '#cdd6f4';
          ctx.font = '48px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`MOCK SCENE: ${sceneName}`, 640, 360);
          setPreviewImage(canvas.toDataURL('image/jpeg', 0.5));
        }
      }, 1000);
      return;
    }

    previewInterval.current = window.setInterval(async () => {
      try {
        const { imageData } = await obs.current.call('GetSourceScreenshot', {
          sourceName: sceneName,
          imageFormat: 'jpeg',
          imageCompressionQuality: 50,
          imageWidth: 1280,
          imageHeight: 720
        });
        setPreviewImage(imageData);
      } catch (e) {
        console.error('Failed to get screenshot', e);
      }
    }, 1000);
  }, [isMockMode]);

  useEffect(() => {
    if (isConnected && currentScene) {
      startPreviewPolling(currentScene);
    }
    return () => {
      if (previewInterval.current) {
        window.clearInterval(previewInterval.current);
      }
    };
  }, [isConnected, currentScene, startPreviewPolling]);
  
  // Meter subscription method
  const subscribeToMeter = useCallback((inputName: string, cb: (mul: number) => void) => {
    const callbacks = meterCallbacks.current.get(inputName) || [];
    callbacks.push(cb);
    meterCallbacks.current.set(inputName, callbacks);
    
    return () => {
      const updated = meterCallbacks.current.get(inputName)?.filter(f => f !== cb) || [];
      meterCallbacks.current.set(inputName, updated);
    };
  }, []);

  const connect = useCallback(async (details: ConnectionDetails) => {
    if (details.isMock) {
      setIsMockMode(true);
      setIsConnected(true);
      // Setup mock data
      setScenes([
        { sceneIndex: 0, sceneName: 'Starting Soon' },
        { sceneIndex: 1, sceneName: 'Just Chatting' },
        { sceneIndex: 2, sceneName: 'Gameplay' },
        { sceneIndex: 3, sceneName: 'BRB' },
      ]);
      setCurrentScene('Just Chatting');
      setPreviewScene('Starting Soon');
      setIsStudioModeEnabled(true);
      setTransitions([{ transitionName: 'Cut' }, { transitionName: 'Fade' }, { transitionName: 'Swipe' }]);
      setCurrentTransition('Fade');
      setSceneItems([
        { sceneItemId: 1, sourceName: 'Camera', sceneItemEnabled: true, sceneItemLocked: true, sourceType: 'INPUT_VIDEO' },
        { sceneItemId: 2, sourceName: 'Display Capture', sceneItemEnabled: true, sceneItemLocked: false, sourceType: 'INPUT_VIDEO' },
        { sceneItemId: 3, sourceName: 'Chat Overlay', sceneItemEnabled: false, sceneItemLocked: false, sourceType: 'INPUT_BROWSER' },
      ]);
      setAudioInputs([
        { inputName: 'Desktop Audio', inputKind: 'wasapi_output_capture', unmuted: true, inputVolumeDb: -10, inputVolumeMul: 0.5, inputSettings: { device_id: 'default' } },
        { 
          inputName: 'Application Capture', 
          inputKind: 'wasapi_process_output_capture', 
          unmuted: true, 
          inputVolumeDb: -5, 
          inputVolumeMul: 0.8,
          inputSettings: { window: 'Spotify.exe:Spotify:Chrome_WidgetWin_0', priority: 1 } 
        },
      ]);
      
      // Setup Mock Input Properties (Dropdown Options)
      setInputPropertiesMap({
        'Application Capture': {
          'window': [
            { itemName: '[Spotify.exe]: Spotify', itemValue: 'Spotify.exe:Spotify:Chrome_WidgetWin_0' },
            { itemName: '[chrome.exe]: YouTube - Google Chrome', itemValue: 'chrome.exe:YouTube - Google Chrome:Chrome_WidgetWin_1' },
            { itemName: '[Discord.exe]: Discord', itemValue: 'Discord.exe:Discord:Chrome_WidgetWin_1' }
          ]
        }
      });
      
      // Setup Mock Filters
      setAudioFilters({
        'Desktop Audio': [],
        'Mic/Aux': [
          { 
            filterName: 'Noise Gate', 
            filterKind: 'noise_gate_filter', 
            filterIndex: 0, 
            filterEnabled: true,
            filterSettings: {
              close_threshold: -32.0,
              open_threshold: -26.0,
              attack_time: 25,
              hold_time: 200,
              release_time: 150
            }
          },
          { 
            filterName: 'Compressor', 
            filterKind: 'compressor_filter', 
            filterIndex: 1, 
            filterEnabled: false,
            filterSettings: {
              ratio: 10.0,
              threshold: -18.0,
              attack_time: 2,
              release_time: 60,
              output_gain: 0.0
            }
          }
        ]
      });
      // Start Mock Meter Loop
      if (meterInterval.current) window.clearInterval(meterInterval.current);
      meterInterval.current = window.setInterval(() => {
        ['Desktop Audio', 'Application Capture'].forEach(inputName => {
          const callbacks = meterCallbacks.current.get(inputName);
          if (callbacks && callbacks.length > 0) {
            // Fake random audio levels bouncing
            const mul = Math.abs(Math.sin(Date.now() / 200)) * 0.8 + (Math.random() * 0.2);
            callbacks.forEach(cb => cb(mul));
          }
        });
      }, 50);

      return;
    }

    try {
      // Connect with EventSubscription.All (which is 1048575, includes InputVolumeMeters)
      await obs.current.connect(`ws://${details.ip}:${details.port}`, details.password, {
        eventSubscriptions: EventSubscription.All | EventSubscription.InputVolumeMeters
      });
      setIsConnected(true);
      setIsMockMode(false);
      
      obs.current.on('InputVolumeMeters', (data) => {
        data.inputs.forEach((input: any) => {
          const callbacks = meterCallbacks.current.get(input.inputName);
          if (callbacks && callbacks.length > 0 && input.inputLevelsMul) {
            // Take the peak level of the first channel
            const peak = input.inputLevelsMul[0]?.[1] || 0;
            callbacks.forEach(cb => cb(peak));
          }
        });
      });

      obs.current.on('CustomEvent', () => {
        // Handle stats if broadcasted, otherwise we might need to poll GetStats or use vendor events
      });
      
      obs.current.on('CurrentProgramSceneChanged', (data) => {
        setCurrentScene(data.sceneName);
        fetchSceneItems(data.sceneName);
      });
      
      obs.current.on('CurrentPreviewSceneChanged', (data) => {
        setPreviewScene(data.sceneName);
        fetchSceneItems(data.sceneName);
      });
      
      obs.current.on('SceneListChanged', (data) => {
        // @ts-ignore
        setScenes(data.scenes.map((s: any) => ({ sceneIndex: s.sceneIndex, sceneName: s.sceneName })));
      });
      
      // Fetch initial states
      const [
        { currentProgramSceneName },
        { currentPreviewSceneName },
        { studioModeEnabled },
        { scenes: sceneList },
        { transitions: transitionList },
        { transitionName: currentSceneTransitionName }
      ] = await Promise.all([
        obs.current.call('GetCurrentProgramScene'),
        obs.current.call('GetCurrentPreviewScene').catch(() => ({ currentPreviewSceneName: '' })),
        obs.current.call('GetStudioModeEnabled').catch(() => ({ studioModeEnabled: false })),
        obs.current.call('GetSceneList'),
        obs.current.call('GetSceneTransitionList'),
        obs.current.call('GetCurrentSceneTransition')
      ]);
      
      setCurrentScene(currentProgramSceneName);
      setPreviewScene(currentPreviewSceneName || currentProgramSceneName);
      setIsStudioModeEnabled(studioModeEnabled);
      // @ts-ignore
      setScenes(sceneList.map((s: any) => ({ sceneIndex: s.sceneIndex, sceneName: s.sceneName })));
      // @ts-ignore
      setTransitions(transitionList);
      setCurrentTransition(currentSceneTransitionName);

      fetchSceneItems(currentProgramSceneName);
      fetchAudioInputs();
      
      // Poll stats
      window.setInterval(async () => {
        if (!isMockMode && obs.current) {
          try {
            const stats = await obs.current.call('GetStats');
            setObsStats({
              cpuUsage: stats.cpuUsage,
              memoryUsage: stats.memoryUsage,
              activeFps: stats.activeFps,
              averageFrameRenderTime: stats.averageFrameRenderTime
            });
          } catch (e) {}
        }
      }, 2000);
      
    } catch (error) {
      console.error('Failed to connect to OBS', error);
      throw error;
    }
  }, []);

  const fetchSceneItems = async (sceneName: string) => {
    if (isMockMode) return;
    try {
      const { sceneItems: items } = await obs.current.call('GetSceneItemList', { sceneName });
      // @ts-ignore
      setSceneItems(items);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAudioInputs = async () => {
    if (isMockMode) return;
    try {
      const { inputs } = await obs.current.call('GetInputList');
      const audioInputData: OBSAudioInput[] = [];
      
      for (const input of inputs) {
        const kind = (input.inputKind || '') as string;
        if (kind.includes('audio') || kind.includes('wasapi')) {
          const [{ inputVolumeDb, inputVolumeMul }, { inputMuted }, { inputSettings }] = await Promise.all([
            obs.current.call('GetInputVolume', { inputName: input.inputName as string }),
            obs.current.call('GetInputMute', { inputName: input.inputName as string }),
            obs.current.call('GetInputSettings', { inputName: input.inputName as string })
          ]);
          audioInputData.push({
            inputName: input.inputName as string,
            inputKind: input.inputKind as string,
            unmuted: !inputMuted,
            inputVolumeDb,
            inputVolumeMul,
            inputSettings: inputSettings as Record<string, any>
          });
          
          fetchAudioFilters(input.inputName as string);
          
          // If it's an app audio capture, fetch window options
          if (kind === 'wasapi_process_output_capture') {
            fetchInputPropertyItems(input.inputName as string, 'window');
          }
        }
      }
      setAudioInputs(audioInputData);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAudioFilters = async (inputName: string) => {
    if (isMockMode) return;
    try {
      const { filters } = await obs.current.call('GetSourceFilterList', { sourceName: inputName });
      setAudioFilters(prev => ({
        ...prev,
        [inputName]: filters as unknown as OBSFilter[]
      }));
    } catch (e) {
      console.error(`Failed to fetch filters for ${inputName}`, e);
    }
  };

  const fetchInputPropertyItems = async (inputName: string, propertyName: string) => {
    if (isMockMode) return;
    try {
      const { propertyItems } = await obs.current.call('GetInputPropertiesListPropertyItems', { inputName, propertyName });
      setInputPropertiesMap(prev => ({
        ...prev,
        [inputName]: {
          ...(prev[inputName] || {}),
          [propertyName]: propertyItems as any
        }
      }));
    } catch (e) {
      console.error(`Failed to fetch property items for ${propertyName} on ${inputName}`, e);
    }
  };

  const setProgramScene = async (sceneName: string) => {
    setCurrentScene(sceneName);
    if (isMockMode) {
      if (sceneName === 'Starting Soon') {
        setSceneItems([{ sceneItemId: 4, sourceName: 'Starting Video', sceneItemEnabled: true, sceneItemLocked: true, sourceType: 'INPUT_MEDIA' }]);
      } else {
        setSceneItems([{ sceneItemId: 1, sourceName: 'Camera', sceneItemEnabled: true, sceneItemLocked: true, sourceType: 'INPUT_VIDEO' }]);
      }
      return;
    }
    await obs.current.call('SetCurrentProgramScene', { sceneName });
    fetchSceneItems(sceneName);
  };

  const updatePreviewScene = async (sceneName: string) => {
    setPreviewScene(sceneName);
    if (!isMockMode && isStudioModeEnabled) {
      await obs.current.call('SetCurrentPreviewScene', { sceneName });
    }
  };

  const toggleStudioMode = async () => {
    setIsStudioModeEnabled(!isStudioModeEnabled);
    if (!isMockMode) {
      await obs.current.call('SetStudioModeEnabled', { studioModeEnabled: !isStudioModeEnabled });
    }
  };

  const triggerStudioModeTransition = async () => {
    if (isMockMode) {
      setCurrentScene(previewScene);
      return;
    }
    await obs.current.call('TriggerStudioModeTransition');
  };

  const setTransition = async (transitionName: string) => {
    setCurrentTransition(transitionName);
    if (!isMockMode) {
      await obs.current.call('SetCurrentSceneTransition', { transitionName });
    }
  };

  const setItemEnabled = async (sceneItemId: number, enabled: boolean) => {
    setSceneItems(prev => prev.map(item => item.sceneItemId === sceneItemId ? { ...item, sceneItemEnabled: enabled } : item));
    if (isMockMode) return;
    await obs.current.call('SetSceneItemEnabled', { sceneName: currentScene, sceneItemId, sceneItemEnabled: enabled });
  };
  
  const setItemLocked = async (sceneItemId: number, locked: boolean) => {
    setSceneItems(prev => prev.map(item => item.sceneItemId === sceneItemId ? { ...item, sceneItemLocked: locked } : item));
    if (isMockMode) return;
  }

  const setInputMute = async (inputName: string, unmuted: boolean) => {
    setAudioInputs(prev => prev.map(input => input.inputName === inputName ? { ...input, unmuted } : input));
    if (isMockMode) return;
    await obs.current.call('SetInputMute', { inputName, inputMuted: !unmuted });
  };

  const setInputVolume = async (inputName: string, volumeMul: number) => {
    setAudioInputs(prev => prev.map(input => input.inputName === inputName ? { ...input, inputVolumeMul: volumeMul } : input));
    if (isMockMode) return;
    await obs.current.call('SetInputVolume', { inputName, inputVolumeMul: volumeMul });
  };

  const toggleAudioFilter = async (inputName: string, filterName: string, enabled: boolean) => {
    setAudioFilters(prev => ({
      ...prev,
      [inputName]: prev[inputName]?.map(f => f.filterName === filterName ? { ...f, filterEnabled: enabled } : f) || []
    }));
    if (isMockMode) return;
    try {
      await obs.current.call('SetSourceFilterEnabled', { sourceName: inputName, filterName, filterEnabled: enabled });
    } catch (e) {
      console.error(`Failed to toggle filter ${filterName} for ${inputName}`, e);
    }
  };

  const updateAudioFilterSettings = async (inputName: string, filterName: string, settings: Record<string, any>) => {
    setAudioFilters(prev => ({
      ...prev,
      [inputName]: prev[inputName]?.map(f => f.filterName === filterName ? { ...f, filterSettings: { ...f.filterSettings, ...settings } } : f) || []
    }));
    if (isMockMode) return;
    try {
      await obs.current.call('SetSourceFilterSettings', { sourceName: inputName, filterName, filterSettings: settings });
    } catch (e) {
      console.error(`Failed to update settings for ${filterName} on ${inputName}`, e);
    }
  };

  const updateInputSettings = async (inputName: string, settings: Record<string, any>) => {
    setAudioInputs(prev => prev.map(input => input.inputName === inputName ? { ...input, inputSettings: { ...input.inputSettings, ...settings } } : input));
    if (isMockMode) return;
    try {
      await obs.current.call('SetInputSettings', { inputName, inputSettings: settings });
    } catch (e) {
      console.error(`Failed to update settings for ${inputName}`, e);
    }
  };

  const getInputSettings = useCallback(async (inputName: string) => {
    if (isMockMode) return { inputSettings: {}, inputKind: 'unknown', propertyLists: {} };
    try {
      const response = await obs.current.call('GetInputSettings', { inputName });
      
      const propertyLists: Record<string, any[]> = {};
      
      if (response.inputSettings) {
        await Promise.all(Object.keys(response.inputSettings).map(async (key) => {
          try {
            const listData = await obs.current.call('GetInputPropertiesListPropertyItems', {
              inputName,
              propertyName: key
            });
            if (listData && listData.propertyItems && listData.propertyItems.length > 0) {
              propertyLists[key] = listData.propertyItems;
            }
          } catch (e) {
            // Ignore
          }
        }));
      }
      
      return { ...response, propertyLists };
    } catch (e) {
      console.error(`Failed to get settings for ${inputName}`, e);
      return null;
    }
  }, [isMockMode]);

  const disconnect = useCallback(async () => {
    if (obs.current) {
      try {
        await obs.current.disconnect();
      } catch (e) {
        console.error("Failed to disconnect", e);
      }
      setIsConnected(false);
    }
  }, []);

  return {
    isConnected,
    isMockMode,
    scenes,
    currentScene,
    previewScene,
    isStudioModeEnabled,
    transitions,
    currentTransition,
    obsStats,
    sceneItems,
    audioInputs,
    audioFilters,
    inputPropertiesMap,
    previewImage,
    isRecording,
    isStreaming,
    isVirtualCam,
    connect,
    disconnect,
    setProgramScene,
    updatePreviewScene,
    toggleStudioMode,
    triggerStudioModeTransition,
    setTransition,
    setItemEnabled,
    setItemLocked,
    setInputMute,
    setInputVolume,
    toggleAudioFilter,
    updateAudioFilterSettings,
    updateInputSettings,
    subscribeToMeter,
    toggleRecording: () => setIsRecording(!isRecording),
    toggleStreaming: () => setIsStreaming(!isStreaming),
    toggleVirtualCam: () => setIsVirtualCam(!isVirtualCam),
    getInputSettings,
  };
}
