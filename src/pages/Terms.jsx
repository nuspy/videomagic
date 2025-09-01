import Seo from '../components/Seo'

export default function Terms() {
  return (
    <>
      <Seo title="Terms of Service • Starter App" description="Terms of service outline." />
      <h1>Terms of Service</h1>

      <nav aria-label="Table of contents" style={{ margin: '1rem 0' }}>
        <ul>
          <li><a href="#intro">Introduction</a></li>
          <li><a href="#use">Acceptable Use</a></li>
          <li><a href="#payments">Payments</a></li>
          <li><a href="#termination">Termination</a></li>
          <li><a href="#governing-law">Governing Law</a></li>
        </ul>
      </nav>

      <section id="intro">
        <h2>Introduction</h2>
        <p>Stub content. Replace with your terms.</p>
      </section>

      <section id="use">
        <h2>Acceptable Use</h2>
        <p>Stub content. Replace with your terms.</p>
      </section>

      <section id="payments">
        <h2>Payments</h2>
        <p>Stub content. Replace with your terms.</p>
      </section>

      <section id="termination">
        <h2>Termination</h2>
        <p>Stub content. Replace with your terms.</p>
      </section>

      <section id="governing-law">
        <h2>Governing Law</h2>
        <p>Stub content. Replace with your terms.</p>
      </section>
    </>
  )
}
