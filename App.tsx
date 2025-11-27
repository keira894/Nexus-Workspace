import React from 'react';
import WorkspaceDashboard from './components/WorkspaceDashboard';

const App: React.FC = () => {
  return (
    <div className="w-full h-full min-h-screen bg-background text-foreground selection:bg-primary/20">
      <WorkspaceDashboard />
    </div>
  );
};

export default App;