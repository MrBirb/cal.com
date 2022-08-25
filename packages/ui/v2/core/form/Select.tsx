import { useId } from "@radix-ui/react-id";
import React, { forwardRef, useCallback, useEffect, useState } from "react";
import ReactSelect, { components, GroupBase, Props, InputProps, SingleValue, MultiValue } from "react-select";

import classNames from "@calcom/lib/classNames";
import { useLocale } from "@calcom/lib/hooks/useLocale";

import { Icon } from "../../../Icon";
import { Label } from "./fields";

export type SelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
> = Props<Option, IsMulti, Group>;

export const InputComponent = <Option, IsMulti extends boolean, Group extends GroupBase<Option>>({
  inputClassName,
  ...props
}: InputProps<Option, IsMulti, Group>) => {
  return (
    <components.Input
      // disables our default form focus hightlight on the react-select input element
      inputClassName={classNames("focus:ring-0 focus:ring-offset-0", inputClassName)}
      {...props}
    />
  );
};

function Select<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({ className, ...props }: SelectProps<Option, IsMulti, Group>) {
  className = classNames(className, "text-sm");
  return (
    <ReactSelect
      theme={(theme) => ({
        ...theme,
        borderRadius: 6,
        colors: {
          ...theme.colors,
          primary: "var(--brand-color)",

          primary50: "rgba(209 , 213, 219, var(--tw-bg-opacity))",
          primary25: "rgba(244, 245, 246, var(--tw-bg-opacity))",
        },
      })}
      styles={{
        indicatorsContainer: (provided) => ({
          ...provided,
          height: "34px",
        }),
        control: (provided) => ({
          ...provided,
          minHeight: "36px",
        }),
        option: (provided, state) => ({
          ...provided,
          color: state.isSelected ? "var(--brand-text-color)" : "black",
          ":active": {
            backgroundColor: state.isSelected ? "" : "var(--brand-color)",
            color: "var(--brand-text-color)",
          },
        }),
      }}
      components={{
        ...components,
        IndicatorSeparator: () => null,
        Input: InputComponent,
      }}
      className={className}
      {...props}
    />
  );
}

export default Select;

export const SelectField = function SelectField<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: {
  name?: string;
  containerClassName?: string;
  label?: string;
  labelProps?: React.ComponentProps<typeof Label>;
  className?: string;
  error?: string;
// Prettier weirdly calls the following line a syntax error
// eslint-disable-next-line prettier/prettier
} &  React.ComponentProps<typeof Select<Option, IsMulti, Group>>) {
  const { t } = useLocale();
  const { label = t(props.name || ""), containerClassName, labelProps, className, ...passThrough } = props;
  const id = useId();
  return (
    <div className={classNames(containerClassName)}>
      <div className={classNames(className)}>
        {!!label && (
          <Label htmlFor={id} {...labelProps} className={classNames(props.error && "text-red-900")}>
            {label}
          </Label>
        )}
      </div>
      <Select {...passThrough} />
    </div>
  );
};

export function SelectWithValidation<
  Option extends { label: string; value: string },
  isMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  required = false,
  onChange,
  value,
  ...remainingProps
}: SelectProps<Option, isMulti, Group> & { required?: boolean }) {
  const [hiddenInputValue, _setHiddenInputValue] = useState(() => {
    if (value instanceof Array || !value) {
      return;
    }
    return value.value || "";
  });

  const setHiddenInputValue = useCallback((value: MultiValue<Option> | SingleValue<Option>) => {
    let hiddenInputValue = "";
    if (value instanceof Array) {
      hiddenInputValue = value.map((val) => val.value).join(",");
    } else {
      hiddenInputValue = value?.value || "";
    }
    _setHiddenInputValue(hiddenInputValue);
  }, []);

  useEffect(() => {
    if (!value) {
      return;
    }
    setHiddenInputValue(value);
  }, [value, setHiddenInputValue]);

  return (
    <div className={classNames("relative", remainingProps.className)}>
      <Select
        value={value}
        {...remainingProps}
        onChange={(value, ...remainingArgs) => {
          setHiddenInputValue(value);
          if (onChange) {
            onChange(value, ...remainingArgs);
          }
        }}
      />
      {required && (
        <input
          tabIndex={-1}
          autoComplete="off"
          style={{
            opacity: 0,
            width: "100%",
            height: 1,
            position: "absolute",
          }}
          value={hiddenInputValue}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onChange={() => {}}
          // TODO:Not able to get focus to work
          // onFocus={() => selectRef.current?.focus()}
          required={required}
        />
      )}
    </div>
  );
}
