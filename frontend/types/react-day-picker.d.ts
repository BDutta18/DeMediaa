declare module "react-day-picker" {
  import * as React from "react"

  export interface DayPickerProps extends React.HTMLAttributes<HTMLDivElement> {
    showOutsideDays?: boolean
    captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years"
    formatters?: Record<string, (...args: any[]) => string>
    classNames?: Record<string, string>
    components?: Record<string, React.ComponentType<any>>
  }

  export const DayPicker: React.ComponentType<DayPickerProps>
  export const DayButton: React.ComponentType<any>
  export function getDefaultClassNames(): Record<string, string>
}
