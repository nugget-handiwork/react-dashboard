import ExamplePanel from './panels/example'

// The dashboard layout: which panels render and how they are arranged.
// Add a file per panel under src/panels/ and list it here.
export default function App() {
  return (
    <main className="dashboard">
      <ExamplePanel />
    </main>
  )
}
