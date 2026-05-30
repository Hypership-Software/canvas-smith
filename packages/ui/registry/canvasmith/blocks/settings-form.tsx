'use client';

import * as React from 'react';
import {FormField} from '@workday/canvas-kit-react/form-field';
import {TextInput} from '@workday/canvas-kit-react/text-input';
import {TextArea} from '@workday/canvas-kit-react/text-area';
import {Select} from '@workday/canvas-kit-react/select';
import {Switch} from '@workday/canvas-kit-preview-react/switch';
import {PrimaryButton, SecondaryButton} from '@workday/canvas-kit-react/button';
import {Flex, Box} from '@workday/canvas-kit-react/layout';
import {Heading, BodyText} from '@workday/canvas-kit-react/text';
import {Card} from '@workday/canvas-kit-react/card';
import {AriaLiveRegion, useUniqueId} from '@workday/canvas-kit-react/common';
import {createStyles, cssVar} from '@workday/canvas-kit-styling';
import {system} from '@workday/canvas-tokens-web';

const formStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: system.space.x6,
  // Leave room so the sticky save bar never overlaps the last field.
  paddingBlockEnd: system.space.x16,
});

const sectionCardStyles = createStyles({
  margin: system.space.zero,
});

const sectionHeadingStyles = createStyles({
  margin: system.space.zero,
});

const sectionDescriptionStyles = createStyles({
  margin: system.space.zero,
  marginBlockStart: system.space.x1,
  color: system.color.fg.muted.default,
});

const sectionBodyStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: system.space.x2,
  marginBlockStart: system.space.x4,
});

const switchRowStyles = createStyles({
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: system.space.x4,
  paddingBlock: system.space.x2,
});

const switchTextStyles = createStyles({
  display: 'flex',
  flexDirection: 'column',
  gap: system.space.half,
  minWidth: 0,
});

const saveBarStyles = createStyles({
  position: 'sticky',
  insetBlockEnd: system.space.zero,
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: system.space.x4,
  paddingInline: system.space.x6,
  paddingBlock: system.space.x4,
  backgroundColor: system.color.bg.default,
  borderBlockStart: `1px solid ${cssVar(system.color.border.divider)}`,
  boxShadow: system.depth[2],
  zIndex: 1,
});

const dirtyHintStyles = createStyles({
  margin: system.space.zero,
  marginInlineEnd: 'auto',
  color: system.color.fg.muted.default,
});

type FieldChange = (value: string | boolean) => void;

interface BaseField {
  /** Form key — becomes the input `name` and the values record key. */
  name: string;
  /** Visible label. */
  label: string;
  /** Optional hint / help text shown under the field. */
  hint?: string;
  /** Marks the field required (adds the required indicator + aria-invalid wiring). */
  required?: boolean;
  /** Per-field validation error message; presence switches the field to error styling. */
  error?: string;
}

export interface TextFieldConfig extends BaseField {
  type: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  placeholder?: string;
}

export interface TextAreaFieldConfig extends BaseField {
  type: 'textarea';
  placeholder?: string;
  rows?: number;
}

export interface SelectFieldConfig extends BaseField {
  type: 'select';
  options: string[];
}

export interface SwitchFieldConfig extends BaseField {
  type: 'switch';
  /** Secondary descriptive line beside the toggle. */
  description?: string;
}

export type SettingsField =
  | TextFieldConfig
  | TextAreaFieldConfig
  | SelectFieldConfig
  | SwitchFieldConfig;

export interface SettingsSection {
  /** Section heading. */
  title: string;
  /** Optional description under the heading. */
  description?: string;
  /** Fields belonging to this section. */
  fields: SettingsField[];
}

/** Map of field name -> current value. Switch fields are booleans; others strings. */
export type SettingsValues = Record<string, string | boolean>;

export interface SettingsFormProps {
  /** Grouped sections of fields. */
  sections: SettingsSection[];
  /** Current field values (controlled). */
  values: SettingsValues;
  /** Fires with the field name + next value on every edit. */
  onChange: (name: string, value: string | boolean) => void;
  /** Called with the full values map when Save is pressed. */
  onSave: (values: SettingsValues) => void | Promise<void>;
  /** Called when Cancel is pressed (e.g. revert to last-saved). */
  onCancel?: () => void;
  /** Whether there are unsaved changes (enables Save + shows the dirty hint). */
  isDirty?: boolean;
  /** Disables Save and shows a saving label while a save is in flight. */
  isSaving?: boolean;
  /** Save button label. Defaults to "Save changes". */
  saveLabel?: string;
  /** Cancel button label. Defaults to "Cancel". */
  cancelLabel?: string;
}

const InputField = ({
  field,
  value,
  onFieldChange,
}: {
  field: TextFieldConfig | TextAreaFieldConfig | SelectFieldConfig;
  value: string;
  onFieldChange: FieldChange;
}) => {
  const error = field.error ? 'error' : undefined;
  const hint = field.error ?? field.hint;

  if (field.type === 'select') {
    return (
      <FormField error={error} isRequired={field.required}>
        <FormField.Label>{field.label}</FormField.Label>
        <FormField.Field>
          <Select items={field.options}>
            <FormField.Input
              as={Select.Input}
              name={field.name}
              value={value}
              onChange={e => onFieldChange(e.currentTarget.value)}
            />
            <Select.Popper>
              <Select.Card>
                <Select.List>{item => <Select.Item>{item}</Select.Item>}</Select.List>
              </Select.Card>
            </Select.Popper>
          </Select>
          {hint ? <FormField.Hint>{hint}</FormField.Hint> : null}
        </FormField.Field>
      </FormField>
    );
  }

  if (field.type === 'textarea') {
    return (
      <FormField error={error} isRequired={field.required} grow>
        <FormField.Label>{field.label}</FormField.Label>
        <FormField.Field>
          <FormField.Input
            as={TextArea}
            name={field.name}
            rows={field.rows ?? 4}
            resize="vertical"
            placeholder={field.placeholder}
            value={value}
            onChange={e => onFieldChange(e.target.value)}
          />
          {hint ? <FormField.Hint>{hint}</FormField.Hint> : null}
        </FormField.Field>
      </FormField>
    );
  }

  return (
    <FormField error={error} isRequired={field.required}>
      <FormField.Label>{field.label}</FormField.Label>
      <FormField.Field>
        <FormField.Input
          as={TextInput}
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
          value={value}
          onChange={e => onFieldChange(e.target.value)}
        />
        {hint ? <FormField.Hint>{hint}</FormField.Hint> : null}
      </FormField.Field>
    </FormField>
  );
};

const SwitchRow = ({
  field,
  checked,
  onFieldChange,
}: {
  field: SwitchFieldConfig;
  checked: boolean;
  onFieldChange: FieldChange;
}) => {
  const labelId = useUniqueId();
  const descriptionId = useUniqueId();
  return (
    <Flex cs={switchRowStyles}>
      <Box cs={switchTextStyles}>
        <BodyText as="span" size="small" id={labelId} cs={{margin: 0}}>
          {field.label}
        </BodyText>
        {field.description ? (
          <BodyText
            as="span"
            size="small"
            id={descriptionId}
            cs={{margin: 0, color: system.color.fg.muted.default}}
          >
            {field.description}
          </BodyText>
        ) : null}
      </Box>
      <Switch
        name={field.name}
        checked={checked}
        aria-labelledby={labelId}
        aria-describedby={field.description ? descriptionId : undefined}
        onChange={e => onFieldChange(e.target.checked)}
      />
    </Flex>
  );
};

/**
 * SettingsForm — grouped `FormField` sections (text / textarea / select / switch)
 * inside section `Card`s, with a sticky save bar (PrimaryButton save +
 * SecondaryButton cancel). Controlled via `values` + `onChange`.
 */
export const SettingsForm = ({
  sections,
  values,
  onChange,
  onSave,
  onCancel,
  isDirty = false,
  isSaving = false,
  saveLabel = 'Save changes',
  cancelLabel = 'Cancel',
}: SettingsFormProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving) return;
    void onSave(values);
  };

  return (
    <Box as="form" cs={formStyles} onSubmit={handleSubmit} noValidate>
      {sections.map((section, index) => {
        const headingId = `cnvsmith-settings-section-${index}`;
        return (
          <Card
            key={section.title}
            cs={sectionCardStyles}
            role="group"
            aria-labelledby={headingId}
          >
            <Card.Body>
              <Heading as="h2" size="small" id={headingId} cs={sectionHeadingStyles}>
                {section.title}
              </Heading>
              {section.description ? (
                <BodyText size="small" cs={sectionDescriptionStyles}>
                  {section.description}
                </BodyText>
              ) : null}

              <Box cs={sectionBodyStyles}>
                {section.fields.map(field =>
                  field.type === 'switch' ? (
                    <SwitchRow
                      key={field.name}
                      field={field}
                      checked={values[field.name] === true}
                      onFieldChange={next => onChange(field.name, next)}
                    />
                  ) : (
                    <InputField
                      key={field.name}
                      field={field}
                      value={
                        typeof values[field.name] === 'string'
                          ? (values[field.name] as string)
                          : ''
                      }
                      onFieldChange={next => onChange(field.name, next)}
                    />
                  )
                )}
              </Box>
            </Card.Body>
          </Card>
        );
      })}

      <Flex cs={saveBarStyles}>
        {isDirty ? (
          <AriaLiveRegion>
            <BodyText size="small" cs={dirtyHintStyles}>
              You have unsaved changes.
            </BodyText>
          </AriaLiveRegion>
        ) : null}
        {onCancel ? (
          <SecondaryButton type="button" onClick={onCancel} disabled={isSaving}>
            {cancelLabel}
          </SecondaryButton>
        ) : null}
        <PrimaryButton type="submit" disabled={isSaving || !isDirty}>
          {isSaving ? 'Saving…' : saveLabel}
        </PrimaryButton>
      </Flex>
    </Box>
  );
};

export default SettingsForm;
