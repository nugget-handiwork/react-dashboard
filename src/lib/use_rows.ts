import React from 'react'
import { query, Row } from './data'

// The one loading pattern every panel uses: rows, or an error, or neither
// while the query is in flight.
export default function useRows(sql: string) {
  const [rows, setRows] = React.useState<Row[]>()
  const [error, setError] = React.useState<string>()

  React.useEffect(() => {
    let isStale = false
    setRows(undefined)
    setError(undefined)
    query(sql)
      .then((result) => {
        if (!isStale) setRows(result)
      })
      .catch((queryError: Error) => {
        if (!isStale) setError(queryError.message)
      })
    return () => {
      isStale = true
    }
  }, [sql])

  return { rows, error }
}
