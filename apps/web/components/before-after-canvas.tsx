'use client'

import * as React from 'react'

import { PrimaryButton, SecondaryButton } from '@workday/canvas-kit-react/button'
import { Card } from '@workday/canvas-kit-react/card'
import { FormField } from '@workday/canvas-kit-react/form-field'
import { TextInput } from '@workday/canvas-kit-react/text-input'
import { Select } from '@workday/canvas-kit-react/select'
import { SystemIcon } from '@workday/canvas-kit-react/icon'
import { createStyles } from '@workday/canvas-kit-styling'
import { system } from '@workday/canvas-tokens-web'
import { calendarIcon } from '@workday/canvas-system-icons-web'

import CanvasLive from '@/components/canvas/canvas-live'

/**
 * BeforeAfterCanvas — the REAL Canvas Kit "after" screen for the before/after
 * wipe demo. It is imported via `next/dynamic({ ssr: false })` so it renders
 * CLIENT-ONLY: Canvas Kit's `createStyles` generates class names from a
 * per-process seed, which differs between the SSR and browser runtimes and would
 * otherwise produce a hydration mismatch. Rendering it only after mount sidesteps
 * that entirely (this interactive, below-the-fold demo gains nothing from SSR).
 *
 * createStyles is called at module scope (never in render) per Canvas Kit guidance.
 */

const TIME_OFF_TYPES = ['Vacation', 'Sick', 'Personal', 'Bereavement', 'Jury duty']

const stageStyles = createStyles({
  boxSizing: 'border-box',
  inlineSize: '100%',
  blockSize: '100%',
  minHeight: '100%',
  overflow: 'auto',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: system.space.x6, // 1.5rem — matches the "before" side
  backgroundColor: system.color.bg.alt.softer,
})

const cardStyles = createStyles({
  inlineSize: '100%',
  maxInlineSize: '26rem',
  gap: system.space.x4,
})

const headingRowStyles = createStyles({
  display: 'flex',
  alignItems: 'center',
  gap: system.space.x3,
})

const fieldsStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: system.space.x4,
})

const actionsStyles = createStyles({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: system.space.x4,
  marginBlockStart: system.space.x2,
})

function AfterForm() {
  const [name, setName] = React.useState('')

  return (
    <div className={stageStyles}>
      <Card cs={cardStyles}>
        <Card.Heading>
          <span className={headingRowStyles}>
            <SystemIcon
              icon={calendarIcon}
              size="sm"
              color={system.color.fg.primary.default}
            />
            Request time off
          </span>
        </Card.Heading>
        <Card.Body>
          <div className={fieldsStyles}>
            <FormField grow>
              <FormField.Label>Employee name</FormField.Label>
              <FormField.Field>
                <FormField.Input
                  as={TextInput}
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  placeholder="Jane Doe"
                />
              </FormField.Field>
            </FormField>

            <FormField grow>
              <FormField.Label>Type</FormField.Label>
              <FormField.Field>
                <Select items={TIME_OFF_TYPES}>
                  <FormField.Input as={Select.Input} />
                  <Select.Popper>
                    <Select.Card>
                      <Select.List>
                        {(item: string) => <Select.Item>{item}</Select.Item>}
                      </Select.List>
                    </Select.Card>
                  </Select.Popper>
                </Select>
              </FormField.Field>
            </FormField>

            <FormField grow>
              <FormField.Label>Start date</FormField.Label>
              <FormField.Field>
                <FormField.Input as={TextInput} type="date" />
              </FormField.Field>
            </FormField>

            <FormField grow>
              <FormField.Label>End date</FormField.Label>
              <FormField.Field>
                <FormField.Input as={TextInput} type="date" />
              </FormField.Field>
            </FormField>

            <div className={actionsStyles}>
              <SecondaryButton size="medium">Cancel</SecondaryButton>
              <PrimaryButton size="medium">Submit request</PrimaryButton>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default function BeforeAfterCanvas() {
  return (
    <CanvasLive>
      <AfterForm />
    </CanvasLive>
  )
}
