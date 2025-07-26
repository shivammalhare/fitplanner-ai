import React, { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'

export const TestSupabase: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([])

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
      
      if (error) {
        console.error('Error:', error)
      } else {
        setTemplates(data || [])
      }
    }

    fetchTemplates()
  }, [])

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-4">Workout Templates from Supabase:</h3>
      {templates.map((template) => (
        <div key={template.id} className="border p-4 mb-2 rounded">
          <h4 className="font-semibold">{template.name}</h4>
          <p>Duration: {template.estimated_duration_minutes} minutes</p>
          <p>Difficulty: {template.difficulty}</p>
        </div>
      ))}
    </div>
  )
}
