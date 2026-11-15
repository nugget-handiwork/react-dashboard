// Data access for the dashboard. This file is the template's: panels call
// query() or dataFile() and never touch fetch, the token, or the endpoint
// themselves. Both are thin wrappers over the helpers the platform injects
// into every artifact page, so a dashboard reads its data the same way a
// chart does.

export type Row = Record<string, unknown>

declare global {
  interface Window {
    artifactQuery(sql: string): Promise<Row[]>
    artifactData(fileName: string): Promise<unknown>
  }
}

export function query(sql: string): Promise<Row[]> {
  return window.artifactQuery(sql)
}

export function dataFile<T = Row[]>(fileName: string): Promise<T> {
  return window.artifactData(fileName) as Promise<T>
}
