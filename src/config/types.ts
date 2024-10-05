import { envEnums, Environments } from './enums';

export interface DBVariables {
  [envEnums.DATABASE_URL]: string;
}

export interface ServerSettingsEnvVariables {
  [envEnums.PORT]: number;
  [envEnums.ENVIRONMENT]: Environments;
}

export interface EnvironmentVariables
  extends DBVariables,
    ServerSettingsEnvVariables {}
