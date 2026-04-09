import React from 'react';
import { Moon, Sun } from 'lucide-react';

const AppearanceTab = ({ 
  isDarkMode, 
  toggleDarkMode, 
  projectSortOrder, 
  setProjectSortOrder 
}) => {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Theme Settings */}
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Dark Mode</div>
              <div className="text-sm text-muted-foreground">Toggle between light and dark themes</div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              role="switch"
              aria-checked={isDarkMode}
              aria-label="Toggle dark mode"
            >
              <span className="sr-only">Toggle dark mode</span>
              <span
                className={`${isDarkMode ? "translate-x-7" : "translate-x-1"
                  } inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 flex items-center justify-center`}
              >
                {isDarkMode ? (
                  <Moon className="w-3.5 h-3.5 text-gray-700" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-yellow-500" />
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Project Sorting */}
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Project Sorting</div>
              <div className="text-sm text-muted-foreground">How projects are ordered in the sidebar</div>
            </div>
            <select
              value={projectSortOrder}
              onChange={(e) => setProjectSortOrder(e.target.value)}
              className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-32 outline-none"
            >
              <option value="name">Alphabetical</option>
              <option value="date">Recent Activity</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceTab;
