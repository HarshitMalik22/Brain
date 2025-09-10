'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Target, Link, ChevronRight } from 'lucide-react';

interface RoadmapDisplayProps {
  roadmap: string;
}

export function RoadmapDisplay({ roadmap }: RoadmapDisplayProps) {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  // Parse the roadmap text into modules
  const parseRoadmap = (text: string) => {
    const lines = text.split('\n');
    const modules: Array<{
      title: string;
      objective: string;
      resources: string[];
      effort: string;
      project: string;
    }> = [];

    let currentModule: {
      title: string;
      objective: string;
      resources: string[];
      effort: string;
      project: string;
    } | null = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('##') || trimmed.startsWith('#')) {
        if (currentModule) {
          modules.push(currentModule);
        }
        currentModule = {
          title: trimmed.replace(/^#+\s*/, ''),
          objective: '',
          resources: [],
          effort: '',
          project: ''
        };
      } else if (trimmed.startsWith('- **Learning objective:**')) {
        if (currentModule) {
          currentModule.objective = trimmed.replace('- **Learning objective:**', '').trim();
        }
      } else if (trimmed.startsWith('- **Resources:**')) {
        if (currentModule) {
          const resourcesText = trimmed.replace('- **Resources:**', '').trim();
          currentModule.resources = resourcesText.split(',').map(r => r.trim()).filter(r => r);
        }
      } else if (trimmed.startsWith('- **Effort:**')) {
        if (currentModule) {
          currentModule.effort = trimmed.replace('- **Effort:**', '').trim();
        }
      } else if (trimmed.startsWith('- **Project:**')) {
        if (currentModule) {
          currentModule.project = trimmed.replace('- **Project:**', '').trim();
        }
      }
    }
    
    if (currentModule) {
      modules.push(currentModule);
    }

    return modules;
  };

  const modules = parseRoadmap(roadmap);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="inline-block p-4 bg-[#78be20] minecraft-border">
          <span className="text-4xl">🗺️</span>
        </div>
        <h2 className="text-3xl font-bold text-white">Your Learning Roadmap</h2>
        <p className="text-green-400 text-sm max-w-2xl mx-auto">
          Follow this path to master your chosen topic. Click on each module to see details!
        </p>
      </motion.div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {modules.map((module, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="space-y-2"
            >
              <div
                className={`glass-block minecraft-border p-4 cursor-pointer transition-all duration-200 hover:scale-105 ${
                  expandedModule === index ? 'ring-2 ring-[#78be20]' : ''
                }`}
                onClick={() => setExpandedModule(expandedModule === index ? null : index)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white">{module.title}</h3>
                  <ChevronRight
                    className={`w-4 h-4 text-[#78be20] transition-transform duration-200 ${
                      expandedModule === index ? 'rotate-90' : ''
                    }`}
                  />
                </div>
                
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex items-center space-x-2">
                    <Target className="w-3 h-3 text-[#78be20]" />
                    <span className="truncate">{module.objective}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-[#78be20]" />
                    <span>{module.effort}</span>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedModule === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="glass-block minecraft-border p-4 space-y-3"
                  >
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-[#78be20]">Learning Objective</h4>
                      <p className="text-xs text-gray-300">{module.objective}</p>
                    </div>

                    {module.resources.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-[#78be20] flex items-center space-x-1">
                          <Link className="w-3 h-3" />
                          <span>Resources</span>
                        </h4>
                        <div className="space-y-1">
                          {module.resources.map((resource, resourceIndex) => (
                            <a
                              key={resourceIndex}
                              href={resource.startsWith('http') ? resource : `https://${resource}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              {resource}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-[#78be20] flex items-center space-x-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Project</span>
                      </h4>
                      <p className="text-xs text-gray-300">{module.project}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-[#78be20]" />
                      <span className="text-xs text-gray-300">{module.effort}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
