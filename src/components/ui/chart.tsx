import type * as React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

export const ChartContainer = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export const ChartLegend = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center gap-4">{children}</div>
}

export const ChartTooltip = ({ content }: { content: React.ReactNode }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div />
        </TooltipTrigger>
        <TooltipContent className="bg-white dark:bg-gray-800 border rounded-md shadow-md p-2">{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export const ChartTooltipContent = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

export const ChartTooltipItem = ({
  name,
  value,
  color,
}: {
  name: string
  value: string
  color: string
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm font-medium">{name}:</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

export const Chart = () => {
  return <></>
}

