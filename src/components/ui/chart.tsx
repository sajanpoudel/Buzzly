"use client"

import { createContext, useContext } from "react"
import { TooltipProps } from "recharts"

type ChartConfig = {
  [key: string]: {
    label: string
    color: string
  }
}

const ChartContext = createContext<ChartConfig | null>(null)

interface ChartContainerProps {
  children: React.ReactNode
  config: ChartConfig
  className?: string
}

export function ChartContainer({
  children,
  config,
  className,
}: ChartContainerProps) {
  return (
    <ChartContext.Provider value={config}>
      <div className={className}>{children}</div>
    </ChartContext.Provider>
  )
}

interface ChartTooltipContentProps
  extends TooltipProps<number, string> {
  active?: boolean
  payload?: any[]
  label?: string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
}: ChartTooltipContentProps) {
  const config = useContext(ChartContext)

  if (!active || !payload || !config) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {label}
          </span>
          <span className="font-bold text-muted-foreground">
            {payload[0]?.value}
          </span>
        </div>
        {payload.map((item: any) => (
          <div key={item.name} className="flex flex-col">
            <span
              className="text-[0.70rem] uppercase"
              style={{ color: config[item.name]?.color }}
            >
              {config[item.name]?.label}
            </span>
            <span className="font-bold" style={{ color: config[item.name]?.color }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const ChartTooltip = ({
  children,
  ...props
}: TooltipProps<number, string> & { children?: React.ReactNode }) => {
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {children}
    </div>
  )
}
