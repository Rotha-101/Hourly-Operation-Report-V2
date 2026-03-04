import { TabRegistry, AppState, ReportData } from '../types';

const REGISTRY_KEY = 'ems_tab_registry';
const REPORTS_KEY = 'ems_reports';
const AUDIT_KEY = 'ems_audit_log';

export function saveTabRegistry(registry: TabRegistry): void {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  } catch (e) {
    console.error('Failed to save tab registry', e);
  }
}

export function loadTabRegistry(): TabRegistry | null {
  try {
    const data = localStorage.getItem(REGISTRY_KEY);
    if (!data) return null;
    return JSON.parse(data) as TabRegistry;
  } catch (e) {
    console.error('Failed to load tab registry', e);
    return null;
  }
}

export function saveReport(payload: { state: AppState; reportData: ReportData | null }): void {
  try {
    const existing = localStorage.getItem(REPORTS_KEY);
    const reports = existing ? JSON.parse(existing) : [];
    reports.push({ ...payload, timestamp: new Date().toISOString() });
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed to save report', e);
  }
}

export function logAudit(action: string, operator: string): void {
  try {
    const existing = localStorage.getItem(AUDIT_KEY);
    const logs = existing ? JSON.parse(existing) : [];
    logs.push({ timestamp: new Date().toISOString(), action, operator });
    localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to log audit', e);
  }
}

export function clearTabRegistry(): void {
  localStorage.removeItem(REGISTRY_KEY);
}
