"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

const MotionDiv = motion.div as any

export function Reveal({
  children,
  delay = 0,
  y = 24,
}: {
  children: ReactNode
  delay?: number
  y?: number
}) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
    >
      {children}
    </MotionDiv>
  )
}
