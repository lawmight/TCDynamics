import { motion, useReducedMotion } from 'framer-motion'
import React, { createContext, useContext, useEffect, useId, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { allFaqs } from '@/data/faq'
import {
  clearFaqPageStructuredData,
  setFaqPageStructuredData,
} from '@/lib/structuredData'
import CheckCircle from '~icons/lucide/check-circle'
import Clock from '~icons/lucide/clock'
import Gift from '~icons/lucide/gift'
import HeadphonesIcon from '~icons/lucide/headphones'
import Phone from '~icons/lucide/phone'
import Shield from '~icons/lucide/shield'
import Users from '~icons/lucide/users'
import Wrench from '~icons/lucide/wrench'

// Accordion Context for state management
interface AccordionContextType {
  openItems: Set<string>
  toggleItem: (value: string) => void
}

const AccordionContext = createContext<AccordionContextType | null>(null)

const useAccordion = () => {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error(
      'Accordion components must be used within an Accordion provider'
    )
  }
  return context
}

// AccordionItem context for shared trigger/content IDs (aria-labelledby fix)
interface AccordionItemContextType {
  triggerId: string
  contentId: string
}

const AccordionItemContext =
  createContext<AccordionItemContextType | null>(null)

const useAccordionItem = () => {
  const context = useContext(AccordionItemContext)
  if (!context) {
    throw new Error(
      'AccordionTrigger and AccordionContent must be used within AccordionItem'
    )
  }
  return context
}

// Main Accordion component
const Accordion = ({
  children,
  type = 'single',
  collapsible = true,
}: {
  children: React.ReactNode
  type?: 'single' | 'multiple'
  collapsible?: boolean
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (value: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev)
      if (type === 'single') {
        // Single mode: close all others
        if (newSet.has(value)) {
          if (collapsible) {
            newSet.delete(value)
          }
        } else {
          newSet.clear()
          newSet.add(value)
        }
      } else {
        // Multiple mode: toggle individual items
        if (newSet.has(value)) {
          newSet.delete(value)
        } else {
          newSet.add(value)
        }
      }
      return newSet
    })
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div
        className="content-visibility-auto space-y-4"
        role="region"
        aria-label="Questions fréquentes"
      >
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

const AccordionItem = ({
  children,
  value,
  className,
}: {
  children: React.ReactNode
  value: string
  className?: string
}) => {
  const triggerId = useId()
  const contentId = useId()
  return (
    <AccordionItemContext.Provider value={{ triggerId, contentId }}>
      <div className={className} data-value={value}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

const AccordionTrigger = ({
  children,
  className,
  value,
}: {
  children: React.ReactNode
  className?: string
  value: string
}) => {
  const { openItems, toggleItem } = useAccordion()
  const { triggerId, contentId } = useAccordionItem()
  const isOpen = openItems.has(value)

  const handleClick = () => {
    toggleItem(value)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleItem(value)
    }
  }

  return (
    <button
      id={triggerId}
      className={`${className} flex w-full items-center justify-between rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-expanded={isOpen ? 'true' : 'false'}
      aria-controls={contentId}
      type="button"
    >
      {children}
      <svg
        className={`size-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  )
}

const AccordionContent = ({
  children,
  className,
  value,
}: {
  children: React.ReactNode
  className?: string
  value: string
}) => {
  const { openItems } = useAccordion()
  const { triggerId, contentId } = useAccordionItem()
  const isOpen = openItems.has(value)

  return (
    <div
      id={contentId}
      className={`${className} overflow-hidden transition-[max-height,opacity] duration-300 ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}
      role="region"
      aria-labelledby={triggerId}
    >
      <div className="pb-4 pt-2">{children}</div>
    </div>
  )
}

const sectionReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (reduce: boolean) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: reduce ? 0 : 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: reduce ? 0 : 0.06,
      delayChildren: reduce ? 0 : 0.04,
    },
  }),
}

const itemReveal = {
  hidden: { opacity: 0, y: 16 },
  visible: (reduce: boolean) => ({
    opacity: 1,
    y: 0,
    transition: { duration: reduce ? 0 : 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const faqDisplayMeta: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; badge: string }
> = {
  security: { icon: Shield, badge: 'Sécurité' },
  integration: { icon: Wrench, badge: 'Intégration' },
  support: { icon: HeadphonesIcon, badge: 'Support' },
  trial: { icon: Gift, badge: 'Essai gratuit' },
  pricing: { icon: Clock, badge: 'Tarifs' },
  team: { icon: Users, badge: 'Utilisateurs' },
}

const FAQ = () => {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    setFaqPageStructuredData(allFaqs)
    return () => clearFaqPageStructuredData()
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background/50 to-background py-24">
      {/* Network Background */}
      <div className="absolute inset-0 opacity-5">
        <svg
          className="absolute inset-0 size-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="faq-network"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="30"
                cy="30"
                r="1.5"
                fill="hsl(var(--primary))"
                opacity="0.4"
              />
              <path
                d="M30,30 L60,0 M30,30 L60,60 M30,30 L0,60"
                stroke="hsl(var(--primary))"
                strokeWidth="0.5"
                opacity="0.2"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#faq-network)" />
        </svg>
      </div>

      <motion.div
        className="container relative z-10 mx-auto px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px 0px -60px 0px', amount: 0.1 }}
        variants={sectionReveal}
        custom={!!reduceMotion}
      >
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          variants={itemReveal}
          custom={!!reduceMotion}
        >
          <Badge
            variant="outline"
            className="mb-6 border-primary/40 font-mono text-primary"
          >
            Questions fréquentes
          </Badge>
          <h2 className="text-gradient mb-6 text-4xl font-bold md:text-5xl">
            Vos questions, nos réponses
          </h2>
          <p className="mx-auto max-w-3xl font-mono text-xl text-muted-foreground">
            Tout ce que vous devez savoir sur TCDynamics avant de commencer
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="mx-auto max-w-4xl">
          <motion.div variants={itemReveal} custom={!!reduceMotion}>
            <Card className="border-primary/20 bg-card/60 p-8 backdrop-blur-sm">
              <Accordion type="single" collapsible className="space-y-4">
                {allFaqs.map(faq => {
                  const { icon: IconComponent, badge: badgeLabel } =
                    faqDisplayMeta[faq.id] ?? {
                      icon: Shield,
                      badge: 'FAQ',
                    }
                  return (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="rounded-lg border border-primary/10 px-6 py-2 transition-colors hover:border-primary/30"
                    >
                      <AccordionTrigger
                        value={faq.id}
                        className="group py-6 text-left hover:no-underline"
                      >
                        <div className="flex flex-1 items-center gap-4">
                          <div className="shrink-0 rounded-full bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                            <IconComponent className="size-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-3">
                              <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">
                                {faq.question}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="border-primary/20 bg-primary/10 font-mono text-xs text-primary"
                              >
                                {badgeLabel}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent value={faq.id} className="pb-6 pt-2">
                        <div className="ml-14 space-y-3">
                          {faq.answer.map((line, lineIndex) => {
                            if (line.includes('**')) {
                              // Handle bold text
                              const parts = line.split('**')
                              return (
                                <p
                                  key={lineIndex}
                                  className="leading-relaxed text-muted-foreground"
                                >
                                  {parts.map((part, partIndex) =>
                                    partIndex % 2 === 1 ? (
                                      <strong
                                        key={partIndex}
                                        className="font-semibold text-foreground"
                                      >
                                        {part}
                                      </strong>
                                    ) : (
                                      part
                                    )
                                  )}
                                </p>
                              )
                            }
                            return (
                              <p
                                key={lineIndex}
                                className="leading-relaxed text-muted-foreground"
                              >
                                {line}
                              </p>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </Card>
          </motion.div>
        </div>

        {/* Contact CTA */}
        <motion.div
          className="mt-12 text-center"
          variants={itemReveal}
          custom={!!reduceMotion}
        >
          <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-card/30 p-8 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-center gap-3">
              <Phone className="size-6 text-primary" />
              <h3 className="text-xl font-bold">Une autre question ?</h3>
            </div>
            <p className="mb-6 font-mono text-muted-foreground">
              Notre équipe française est là pour vous répondre
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
                <CheckCircle className="size-4 text-primary" />
                <span className="font-mono text-sm text-primary">
                  📞 01 39 44 75 00
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
                <CheckCircle className="size-4 text-primary" />
                <span className="font-mono text-sm text-primary">
                  ✉️ contact@tcdynamics.fr
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default FAQ
