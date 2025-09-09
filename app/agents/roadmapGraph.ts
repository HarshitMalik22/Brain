import { createRoadmapPlanner } from "../chains/roadmapPlanner";
import { parseRoadmapMarkdown } from "../utils/parseRoadmapMarkdown";

export enum ModuleStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export interface Module {
  id: string;
  title: string;
  level: string;
  content: string[];
  context?: string[];
  status: ModuleStatus;
  completedSteps: number;
  totalSteps: number;
  prerequisites?: string[];
  estimatedDuration?: string;
}

export interface RoadmapState {
  id: string;
  topic: string;
  description: string;
  modules: Module[];
  currentModuleId: string | null;
  completedModules: string[];
  inProgressModules: string[];
  createdAt: Date;
  updatedAt: Date;
  progress: number;
}

export interface AgentState {
  topic: string;
  roadmap: string;
  currentStep: number;
  currentModule: Module | null;
  totalSteps: number;
  isComplete: boolean;
  modules: Module[];
  state: RoadmapState;
  navigationHistory: string[];
}

const generateId = (prefix: string = '') => 
  `${prefix}${Math.random().toString(36).substr(2, 9)}`;

export const createAgentState = (initialState: Partial<AgentState> = {}): AgentState => {
  const now = new Date();
  return {
    topic: "",
    roadmap: "",
    currentStep: 0,
    currentModule: null,
    totalSteps: 0,
    isComplete: false,
    modules: [],
    state: {
      id: generateId('roadmap_'),
      topic: '',
      description: '',
      modules: [],
      currentModuleId: null,
      completedModules: [],
      inProgressModules: [],
      createdAt: now,
      updatedAt: now,
      progress: 0
    },
    navigationHistory: [],
    ...initialState
  };
};

export const buildRoadmapAgent = () => {
  const planner = createRoadmapPlanner();
  
  const updateModuleStatus = (state: AgentState, moduleId: string, status: ModuleStatus): AgentState => {
    const updatedModules = state.modules.map(mod => 
      mod.id === moduleId 
        ? { ...mod, status, updatedAt: new Date() } 
        : mod
    );

    const completedModules = updatedModules
      .filter(m => m.status === ModuleStatus.COMPLETED)
      .map(m => m.id);

    const inProgressModules = updatedModules
      .filter(m => m.status === ModuleStatus.IN_PROGRESS)
      .map(m => m.id);

    const progress = state.modules.length > 0 
      ? Math.round((completedModules.length / state.modules.length) * 100) 
      : 0;

    return {
      ...state,
      modules: updatedModules,
      state: {
        ...state.state,
        modules: updatedModules,
        completedModules,
        inProgressModules,
        progress,
        updatedAt: new Date()
      }
    };
  };

  const updateCurrentModule = (state: AgentState, moduleId: string | null): AgentState => {
    if (moduleId === null) {
      return {
        ...state,
        currentModule: null,
        state: {
          ...state.state,
          currentModuleId: null,
          updatedAt: new Date()
        }
      };
    }

    const mod = state.modules.find(m => m.id === moduleId);
    if (!mod) return state;

    // Update navigation history
    const newHistory = [...state.navigationHistory];
    if (state.currentModule) {
      newHistory.push(state.currentModule.id);
    }

    // Mark previous module as completed if it exists
    const updatedModules = state.modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, status: ModuleStatus.IN_PROGRESS };
      } else if (m.id === state.currentModule?.id) {
        return { ...m, status: ModuleStatus.COMPLETED };
      }
      return m;
    });

    // Create a new module object with the updated status
    const currentModule = {
      ...mod,
      status: ModuleStatus.IN_PROGRESS,
      // Ensure all required Module properties are included
      id: mod.id,
      title: mod.title,
      level: mod.level,
      content: [...mod.content],
      context: mod.context ? [...mod.context] : [],
      completedSteps: mod.completedSteps,
      totalSteps: mod.totalSteps,
      prerequisites: mod.prerequisites ? [...mod.prerequisites] : [],
      estimatedDuration: mod.estimatedDuration
    };

    return {
      ...state,
      currentModule,
      modules: updatedModules,
      navigationHistory: newHistory,
      state: {
        ...state.state,
        currentModuleId: moduleId,
        modules: updatedModules,
        inProgressModules: [
          ...state.state.inProgressModules.filter(id => id !== moduleId),
          moduleId
        ],
        updatedAt: new Date()
      }
    };
  };

  return {
    async initialize(topic: string, description: string = ''): Promise<AgentState> {
      const input = `Create a detailed roadmap for: ${topic}`;
      const res = await planner.invoke({ input });
      
      // Parse the markdown into modules
      const parsedModules = parseRoadmapMarkdown(res.content);
      
      // Convert to our enhanced module format
      const modules: Module[] = parsedModules.map((module, index) => ({
        id: generateId('module_'),
        title: `Module ${index + 1}: ${module.level}`,
        level: module.level,
        content: module.content,
        context: module.context || [],
        status: ModuleStatus.NOT_STARTED,
        completedSteps: 0,
        totalSteps: module.content.length,
        prerequisites: index > 0 ? [parsedModules[index - 1].level] : [],
        estimatedDuration: '1-2 weeks'
      }));

      const initialState = createAgentState({
        topic,
        roadmap: res.content,
        modules,
        totalSteps: modules.length,
        state: {
          id: generateId('roadmap_'),
          topic,
          description,
          modules,
          currentModuleId: null,
          completedModules: [],
          inProgressModules: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          progress: 0
        }
      });

      // Set the first module as current if available
      if (modules.length > 0) {
        return updateCurrentModule(initialState, modules[0].id);
      }

      return initialState;
    },

    getCurrentState(state: AgentState): AgentState {
      return state;
    },

    getRoadmapState(state: AgentState): RoadmapState {
      return state.state;
    },

    getModule(state: AgentState, moduleId: string): Module | null {
      return state.modules.find(m => m.id === moduleId) || null;
    },

    getNextModule(state: AgentState): Module | null {
      if (!state.currentModule) return state.modules[0] || null;
      
      const currentIndex = state.modules.findIndex(m => m.id === state.currentModule?.id);
      if (currentIndex === -1 || currentIndex >= state.modules.length - 1) {
        return null;
      }
      
      return state.modules[currentIndex + 1];
    },

    getPreviousModule(state: AgentState): Module | null {
      if (!state.currentModule) return null;
      
      const currentIndex = state.modules.findIndex(m => m.id === state.currentModule?.id);
      if (currentIndex <= 0) {
        return null;
      }
      
      return state.modules[currentIndex - 1];
    },

    next(state: AgentState): AgentState {
      if (state.isComplete) return state;
      
      const nextModule = this.getNextModule(state);
      if (!nextModule) {
        // No next module, mark as complete
        return {
          ...state,
          isComplete: true,
          currentModule: null,
          state: {
            ...state.state,
            currentModuleId: null,
            updatedAt: new Date()
          }
        };
      }
      
      return updateCurrentModule(state, nextModule.id);
    },

    previous(state: AgentState): AgentState {
      const prevModule = this.getPreviousModule(state);
      if (!prevModule) return state;
      
      return updateCurrentModule(state, prevModule.id);
    },

    goToStep(state: AgentState, step: number): AgentState {
      if (step < 0 || step >= state.modules.length) return state;
      
      const targetModule = state.modules[step];
      if (!targetModule) return state;
      
      return updateCurrentModule(state, targetModule.id);
    },

    goToModule(state: AgentState, moduleId: string): AgentState {
      const mod = state.modules.find(m => m.id === moduleId);
      if (!mod) return state;
      
      return updateCurrentModule(state, moduleId);
    },

    completeModule(state: AgentState, moduleId: string): AgentState {
      const updatedState = updateModuleStatus(state, moduleId, ModuleStatus.COMPLETED);
      
      // Update completed modules list
      if (!updatedState.state.completedModules.includes(moduleId)) {
        updatedState.state.completedModules.push(moduleId);
      }
      
      // Remove from in-progress if it's there
      updatedState.state.inProgressModules = updatedState.state.inProgressModules.filter(
        id => id !== moduleId
      );
      
      // Update progress
      updatedState.state.progress = updatedState.modules.length > 0
        ? Math.round((updatedState.state.completedModules.length / updatedState.modules.length) * 100)
        : 0;
      
      // Check if all modules are completed
      if (updatedState.state.completedModules.length === updatedState.modules.length) {
        updatedState.isComplete = true;
      }
      
      return updatedState;
    },

    updateModuleProgress(
      state: AgentState, 
      moduleId: string, 
      completedSteps: number
    ): AgentState {
      const mod = state.modules.find(m => m.id === moduleId);
      if (!mod) return state;
      
      const updatedModules = state.modules.map(m => 
        m.id === moduleId 
          ? { ...m, completedSteps: Math.min(completedSteps, m.totalSteps) }
          : m
      );
      
      return {
        ...state,
        modules: updatedModules,
        state: {
          ...state.state,
          modules: updatedModules,
          updatedAt: new Date()
        }
      };
    },

    goBack(state: AgentState): AgentState {
      if (state.navigationHistory.length === 0) return state;
      
      const previousModuleId = state.navigationHistory.pop()!;
      return this.goToModule(state, previousModuleId);
    },

    getNavigationHistory(state: AgentState): string[] {
      return [...state.navigationHistory];
    },

    getModuleDependencies(state: AgentState, moduleId: string): Module[] {
      const mod = state.modules.find(m => m.id === moduleId);
      if (!mod || !mod.prerequisites || mod.prerequisites.length === 0) {
        return [];
      }
      
      return state.modules.filter(m => 
        m.prerequisites && m.prerequisites.some(prereq => 
          mod.prerequisites?.includes(prereq)
        )
      );
    },

    /**
     * Get the current progress of the roadmap
     * @param state The current agent state
     * @returns An object containing progress information
     */
    getProgress(state: AgentState): { current: number; total: number; percentage: number; completed: number } {
      const completed = state.state.completedModules.length;
      const total = state.modules.length;
      const current = state.currentStep + 1; // 1-based index
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        current,
        total,
        percentage,
        completed
      };
    }
  };
}