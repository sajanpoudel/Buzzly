import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TimePicker() {
  const [time, setTime] = React.useState<string>('12:00')

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  return (
    <div className="flex space-x-2">
      <Select onValueChange={(value) => setTime(prev => `${value}:${prev.split(':')[1]}`)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {hours.map(hour => (
            <SelectItem key={hour} value={hour}>{hour}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => setTime(prev => `${prev.split(':')[0]}:${value}`)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Minute" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map(minute => (
            <SelectItem key={minute} value={minute}>{minute}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}