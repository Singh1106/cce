/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Environments, envEnums } from './enums';
import { EnvironmentVariables } from './types';

type ValidationRule<T> = {
  type: 'string' | 'number';
  required: boolean;
  defaultValue: T | null;
  enumValues?: T[];
};

class CustomJOI {
  private validationRules: Partial<
    Record<keyof EnvironmentVariables, ValidationRule<any>>
  > = {};
  private currentKey: keyof EnvironmentVariables | null = null;

  string(key: keyof EnvironmentVariables) {
    this.currentKey = key;
    this.validationRules[key] = {
      type: 'string',
      required: false,
      defaultValue: null,
    };
    return this;
  }

  number(key: keyof EnvironmentVariables) {
    this.currentKey = key;
    this.validationRules[key] = {
      type: 'number',
      required: false,
      defaultValue: null,
    };
    return this;
  }

  enum<T>(enumValues: T[]) {
    if (this.currentKey && this.validationRules[this.currentKey]) {
      this.validationRules[this.currentKey]!.enumValues = enumValues;
    }
    return this;
  }

  required() {
    if (this.currentKey && this.validationRules[this.currentKey]) {
      this.validationRules[this.currentKey]!.required = true;
    }
    return this;
  }

  default<T>(value: T) {
    if (this.currentKey && this.validationRules[this.currentKey]) {
      this.validationRules[this.currentKey]!.defaultValue = value;
    }
    return this;
  }

  validate(config: Partial<EnvironmentVariables>) {
    for (const key in this.validationRules) {
      const rule = this.validationRules[key as keyof EnvironmentVariables]!;
      let value =
        config[key as keyof EnvironmentVariables] ?? rule.defaultValue;

      if (rule.required && (value === undefined || value === null)) {
        return { error: new Error(`${key} is required`), value: null };
      }

      if (rule.type === 'number') {
        if (typeof value === 'string') {
          value = Number(value);
        }
        if (typeof value !== 'number' || isNaN(value)) {
          return { error: new Error(`${key} must be a number`), value: null };
        }
      }

      if (rule.type === 'string' && typeof value !== 'string') {
        return { error: new Error(`${key} must be a string`), value: null };
      }

      if (rule.enumValues && !rule.enumValues.includes(value)) {
        return {
          error: new Error(
            `${key} must be one of ${rule.enumValues.join(', ')}`,
          ),
          value: null,
        };
      }
    }

    return { error: null, value: config };
  }

  build() {
    return {
      rules: this.validationRules,
      validate: this.validate.bind(this),
    };
  }
}

const validator = new CustomJOI();

// Define the LSB_PG_URL as a required string
validator.string(envEnums.DATABASE_URL).required();
// Define the PORT as a required number with a default value of 3003
validator.number(envEnums.PORT).default(3000).required();

// Define the ENVIRONMENT as a required string with a default value of local, validated against the Environments enum
validator
  .string(envEnums.ENVIRONMENT)
  .default(Environments.local)
  .enum(Object.values(Environments))
  .required();

// Build the validation schema
export const envSchema: {
  rules: Partial<Record<keyof EnvironmentVariables, ValidationRule<any>>>;
  validate: (config: Partial<EnvironmentVariables>) => {
    error: Error | null;
    value: Partial<EnvironmentVariables> | null;
  };
} = validator.build();
