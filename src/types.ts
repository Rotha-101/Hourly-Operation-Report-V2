export enum ProjectType {
  FORMAT_A = 'FORMAT_A',
  FORMAT_B = 'FORMAT_B',
}

export enum Shift {
  A = 'A (06:00-14:00)',
  B = 'B (14:00-22:00)',
  C = 'C (22:00-06:00)',
}

export interface Operator {
  id: string;
  name: string;
  groupId: number;
}

export interface ProjectDefaults {
  bessOnline: string;
  pcsOnline: string;
  transformerOnline: string;
  emsStatus: 'Normal' | 'Abnormal';
  overallJudgment: 'Normal' | 'Abnormal';
}

export interface Project {
  id: string;
  name: string;
  siteName: string;
  groupId: number;
  type: ProjectType;
  capacity: string;
  defaults: ProjectDefaults;
}

export interface ManualOperation {
  enabled: boolean;
  mw: string;
  time: string;
}

export interface BessFunction {
  peakShifting: boolean;
  pfc: boolean;
  qu: boolean;
  tieLine?: boolean;
  pvSmoothing?: boolean;
  manualCharge: ManualOperation;
  manualDischarge: ManualOperation;
}

export interface SppcTelemetry {
  soc: number;
  cycleToday: string;
  cycleMonth: string;
  cycleTotal: string;
}

export interface TelemetryFormatA {
  sppc1: SppcTelemetry;
  sppc2: SppcTelemetry;
  sppc3: SppcTelemetry;
}

export interface TelemetryFormatB {
  soc: number;
  totalCycle: string;
  thisMonthCycle: string;
  todayCycle: string;
}

export interface Telemetry {
  formatA?: TelemetryFormatA;
  formatB?: TelemetryFormatB;
}

export interface Availability {
  bessOnline: string;
  pcsOnline: string;
  transformerOnline: string;
  emsStatus: string;
  overallJudgment: string;
  emsNote?: string;
}

export interface Incident {
  issue: string;
  action: string;
  solvedExpectation: string;
  status: 'In Progress' | 'Resolved';
  collapsed: boolean;
}

export interface ReportData {
  capacity: string;
  bessFunction: BessFunction;
  telemetry: Telemetry;
  availability: Availability;
  incidents: Incident[];
}

export interface AppState {
  operatorId: string | null;
  operatorNames: string[];
  groupId: number | null;
  groupName: string | null;
  role: 'operator' | 'supervisor';
  activeProjectId: string | null;
  activeProjectName: string | null;
  reportDate: string;
  hourInterval: string;
  shift: Shift;
  systemReady: boolean;
}

export interface TabEntry {
  id: string;
  label: string;
  state: AppState;
  reportData: ReportData | null;
}

export interface TabRegistry {
  tabs: TabEntry[];
  activeTabId: string;
}
