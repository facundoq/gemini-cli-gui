import React from 'react';
import { Plus, Server, Edit3, Trash2, Play, Terminal, Zap, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const McpTab = ({
  mcpServers,
  onOpenForm,
  onDeleteServer,
  onTestServer,
  onDiscoverTools,
  mcpTestResults,
  mcpServerTools,
  mcpToolsLoading
}) => {
  const getTransportIcon = (type) => {
    switch (type) {
      case 'stdio': return <Terminal className="w-4 h-4" />;
      case 'sse': return <Zap className="w-4 h-4" />;
      case 'http': return <Globe className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* MCP Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-medium text-foreground">MCP Servers</h3>
          </div>
          <p className="text-sm text-muted-foreground">Manage Model Context Protocol servers for extended tool capabilities</p>
        </div>
        <Button onClick={() => onOpenForm()} className="gap-2">
          <Plus className="w-4 h-4" /> Add Server
        </Button>
      </div>

      {mcpServers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/30 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800">
          <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h4 className="text-sm font-medium text-foreground">No MCP servers configured</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            (Feature currently disabled in UI - check CLI config manually)
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {mcpServers.map((server) => {
            const testResult = mcpTestResults[server.id];
            const toolsResult = mcpServerTools[server.id];
            const toolsLoading = mcpToolsLoading[server.id];

            return (
              <div key={server.id} className="bg-white dark:bg-gray-950 border border-border rounded-lg overflow-hidden flex flex-col">
                <div className="p-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600">
                      {getTransportIcon(server.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{server.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] uppercase">{server.type}</Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          {server.type === 'stdio' ? server.config.command : server.config.url}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onTestServer(server.id, server.scope)}>
                      <Play className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onOpenForm(server)}>
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteServer(server.id, server.scope)} className="text-red-500 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                
                {testResult && (
                  <div className={`px-4 py-2 text-xs font-medium ${testResult.success ? 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400'}`}>
                    {testResult.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default McpTab;
