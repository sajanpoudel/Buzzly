import React from 'react';
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

export const CampaignNameInput = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <div className="space-y-2">
    <Label htmlFor="campaignName">Campaign Name</Label>
    <Input
      id="campaignName"
      placeholder="Enter campaign name"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export const CampaignTypeSelect = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <div className="space-y-2">
    <Label htmlFor="campaignType">Campaign Type</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id="campaignType">
        <SelectValue placeholder="Select campaign type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newsletter">Newsletter</SelectItem>
        <SelectItem value="promotional">Promotional</SelectItem>
        <SelectItem value="transactional">Transactional</SelectItem>
        <SelectItem value="automated">Automated</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

export const SubjectInput = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <div className="space-y-2">
    <Label htmlFor="subject">Subject</Label>
    <Input
      id="subject"
      placeholder="Enter email subject"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export const BodyTextarea = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <div className="space-y-2">
    <Label htmlFor="body">Email Body</Label>
    <Textarea
      id="body"
      placeholder="Enter email body"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={10}
    />
  </div>
);

export const RecipientFileUpload = ({ onChange }: { onChange: (file: File | null) => void }) => (
  <FileUpload label="Upload CSV with recipients" accept=".csv" onChange={onChange} />
);

export const DatePicker = ({ value, onChange }: { value?: Date; onChange: (date: Date | undefined) => void }) => (
  <div className="space-y-2">
    <Label htmlFor="date">Date</Label>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={`w-full justify-start text-left font-normal ${!value && "text-muted-foreground"}`}
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
          initialFocus
        />
      </PopoverContent>
    </Popover>
  </div>
);

export const TimePicker = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <div className="space-y-2">
    <Label htmlFor="time">Time</Label>
    <Input
      id="time"
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);