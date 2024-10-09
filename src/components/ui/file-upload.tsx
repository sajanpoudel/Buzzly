import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FileUploadProps {
  label?: string;
  accept?: string;
  onChange?: (file: File | null) => void;
}

export default function FileUpload({ label = "Upload file", accept = ".csv", onChange }: FileUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (onChange) {
      onChange(file);
    }
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="file">{label}</Label>
      <Input id="file" type="file" accept={accept} onChange={handleFileChange} />
    </div>
  )
}