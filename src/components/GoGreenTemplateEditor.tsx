import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface GoGreenTemplateEditorProps {
  initialSubject: string;
  initialBody: string;
  onSave: (subject: string, body: string) => void;
}

export default function GoGreenTemplateEditor({ initialSubject, initialBody, onSave }: GoGreenTemplateEditorProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);

  const handleSave = () => {
    onSave(subject, body);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700">Body</label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={20}
          className="mt-1"
        />
      </div>
      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  );
}
