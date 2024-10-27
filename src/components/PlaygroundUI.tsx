import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileUpload from "@/components/ui/file-upload";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export const CampaignNameInput = ({ 
  value = '', // Add default value
  onChange, 
  onSubmit 
}: { 
  value?: string; // Make value optional
  onChange: (value: string) => void; 
  onSubmit: () => void 
}) => (
  <div className="space-y-2 w-full">
    <Label htmlFor="campaignName" className="text-sm font-medium">Campaign Name</Label>
    <Input
      id="campaignName"
      placeholder="Enter campaign name"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onSubmit();
        }
      }}
      className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

export const CampaignTypeSelect = ({ 
  value, 
  onChange, 
  options,
  onSubmit
}: { 
  value: string; 
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  onSubmit: () => void;
}) => (
  <div className="space-y-2 w-full">
    <Label htmlFor="campaignType" className="text-sm font-medium">Campaign Type</Label>
    <Select value={value} onValueChange={(value) => { onChange(value); onSubmit(); }}>
      <SelectTrigger id="campaignType" className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <SelectValue placeholder="Select campaign type" />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export const SubjectInput = ({ 
  value = '', // Provide default empty string
  onChange, 
  onSubmit 
}: { 
  value?: string; 
  onChange: (value: string) => void; 
  onSubmit: () => void 
}) => (
  <div className="space-y-2 w-full">
    <Label htmlFor="subject">Subject</Label>
    <Input
      id="subject"
      placeholder="Enter email subject"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onSubmit();
        }
      }}
      className="w-full"
    />
  </div>
);

export const BodyTextarea = ({ 
  value = '', // Provide default empty string
  onChange, 
  onSubmit 
}: { 
  value?: string; 
  onChange: (value: string) => void; 
  onSubmit: () => void 
}) => (
  <div className="space-y-2 w-full">
    <Label htmlFor="body">Body</Label>
    <Textarea
      id="body"
      placeholder="Enter email body"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onSubmit();
        }
      }}
      className="w-full"
      rows={4}
    />
  </div>
);

export const RecipientFileUpload = ({ 
  onChange,
  recipients = [] // Add default value
}: { 
  onChange: (file: File | null) => void;
  recipients?: { name: string; email: string }[];
}) => (
  <div className="w-full p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 transition-colors duration-200">
    <FileUpload 
      label={`Upload CSV with recipients ${recipients.length > 0 ? `(${recipients.length} added)` : ''}`}
      accept=".csv" 
      onChange={onChange}
    />
  </div>
);

export const DatePicker = ({ value, onChange }: { value?: Date; onChange: (date: Date | undefined) => void }) => (
  <div className="space-y-2 w-full">
    <Label htmlFor="date" className="text-sm font-medium">Date</Label>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={`w-full justify-start text-left font-normal ${!value && "text-muted-foreground"} px-3 py-2 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
        />
      </PopoverContent>
    </Popover>
  </div>
);

export const TimePicker = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <div className="space-y-2 w-full">
    <Label htmlFor="time" className="text-sm font-medium">Time</Label>
    <Input
      id="time"
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

export const TemplateDescriptionInput = ({ 
  value = '', // Provide default empty string
  onChange, 
  onSubmit 
}: { 
  value?: string; 
  onChange: (value: string) => void; 
  onSubmit: () => void 
}) => (
  <div className="space-y-2 w-full">
    <Label htmlFor="templateDescription">Template Description</Label>
    <Textarea
      id="templateDescription"
      placeholder="Enter template description"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onSubmit();
        }
      }}
      className="w-full"
    />
  </div>
);

export const TemplateNameInput = ({ 
  value = '', // Provide default empty string
  onChange, 
  onSubmit 
}: { 
  value?: string; 
  onChange: (value: string) => void; 
  onSubmit: () => void 
}) => (
  <div className="space-y-2 w-full">
    <Label htmlFor="templateName">Template Name</Label>
    <Input
      id="templateName"
      placeholder="Enter template name"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onSubmit();
        }
      }}
      className="w-full"
    />
  </div>
);

export const TemplateSelect = ({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) => (
  <div className="space-y-2 w-full">
    <Label htmlFor="template" className="text-sm font-medium">Choose a Template</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id="template" className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <SelectValue placeholder="Select a template" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="_scratch">Start from scratch</SelectItem>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export const RecipientInput = ({ recipients, onAdd, onRemove }: { recipients: { name: string; email: string }[]; onAdd: (recipient: { name: string; email: string }) => void; onRemove: (index: number) => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleAdd = () => {
    if (name && email) {
      onAdd({ name, email });
      setName('');
      setEmail('');
    }
  };

  return (
    <div className="space-y-4 w-full">
      <Label className="text-sm font-medium">Recipients</Label>
      <div className="flex space-x-2">
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleAdd} type="button">Add</Button>
      </div>
      <div className="space-y-2">
        {recipients.map((recipient, index) => (
          <div key={index} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded">
            <span>{recipient.name} ({recipient.email})</span>
            <Button onClick={() => onRemove(index)} variant="ghost" size="sm">Remove</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

