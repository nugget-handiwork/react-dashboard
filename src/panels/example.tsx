import useRows from '../lib/use_rows'

// A placeholder that proves the data path works: replace it with panels
// that query the pinned datasets.
export default function ExamplePanel() {
  const { rows, error } = useRows('SELECT 1 AS value')

  if (error) {
    return <section className="panel panel-error">{error}</section>
  }
  if (rows === undefined) {
    return <section className="panel panel-loading">Loading…</section>
  }
  return (
    <section className="panel">
      <h2>Example panel</h2>
      <p>
        The data API answered with {String(rows[0]?.value)} — replace this
        panel with real ones.
      </p>
    </section>
  )
}
