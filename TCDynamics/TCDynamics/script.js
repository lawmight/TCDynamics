// In script.js

document.getElementById('contactForm').addEventListener('submit', async e => {
  e.preventDefault()

  const name = e.target.name.value
  const email = e.target.email.value
  const message = e.target.message.value

  try {
    // This relative path works because you linked the API in Azure.
    // Azure's servers will automatically and securely route this request
    // to your func-tcdynamics-contact app.
    const resp = await fetch('/api/ContactForm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    })

    const text = await resp.text()
    alert(text)

    if (resp.ok) {
      e.target.reset()
    }
  } catch (err) {
    console.error(err)
    alert("Échec de l'envoi")
  }
})
