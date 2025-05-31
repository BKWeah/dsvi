import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const DebugSupabasePage: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      // Test 1: Basic connection
      console.log('Testing basic connection...');
      const { data: healthCheck } = await supabase.from('schools').select('id').limit(1);
      console.log('Health check result:', healthCheck);

      // Test 2: Try project_tasks table
      console.log('Testing project_tasks table...');
      const { data: tasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select('*')
        .limit(1);
      
      console.log('Tasks result:', { tasks, tasksError });

      // Test 3: List all tables
      console.log('Checking available tables...');
      const { data: tables } = await supabase.rpc('get_table_list') || [];
      
      setResult({
        healthCheck,
        tasks,
        tasksError,
        tables
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testConnection} disabled={loading}>
            {loading ? 'Testing...' : 'Test Connection'}
          </Button>
          
          {result && (
            <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugSupabasePage;