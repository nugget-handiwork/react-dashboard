import React from 'react'
import { dataFile, Row } from './data'

// The staged-file counterpart to useRows: data committed beside the
// dashboard's code, so it resolves without a round trip to the database.
export default function useFile<T = Row[]>(fileName: string) {
  const [data, setData] = React.useState<T>()
  const [error, setError] = React.useState<string>()

  React.useEffect(() => {
    let isStale = false
    setData(undefined)
    setError(undefined)
    dataFile<T>(fileName)
      .then((result) => {
        if (!isStale) setData(result)
      })
      .catch((fileError: Error) => {
        if (!isStale) setError(fileError.message)
      })
    return () => {
      isStale = true
    }
  }, [fileName])

  return { data, error }
}
