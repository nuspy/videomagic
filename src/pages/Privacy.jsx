import Seo from '../components/Seo'

export default function Privacy() {
  return (
    <>
      <Seo title="Privacy Policy • Starter App" description="Privacy policy outline." />
      <h1>Privacy Policy</h1>

      <nav aria-label="Table of contents" style={{ margin: '1rem 0' }}>
        <ul>
          <li><a href="#intro">Introduction</a></li>
          <li><a href="#data">Data We Collect</a></li>
          <li><a href="#usage">How We Use Data</a></li>
          <li><a href="#rights">Your Rights</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      <section id="intro">
        <h2>Introduction</h2>
        <p>Stub content. Replace with your policy.</p>
      </section>

      <section id="data">
        <h2>Data We Collect</h2>
        <p>Stub content. Replace with your policy.</p>
      </section>

      <section id="usage">
        <h2>How We Use Data</h2>
        <p>Stub content. Replace with your policy.</p>
      </section>

      <section id="rights">
        <h2>Your Rights</h2>
        <p>Stub content. Replace with your policy.</p>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <p>Stub content. Replace with your policy.</p>
      </section>
    </>
  )
}
