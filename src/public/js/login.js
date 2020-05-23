$(document).ready(function () {
  $('#login-submit').on('click', async function () {
    const $email = $('#email')
    const $password = $('#password')
    // Clean up the form
    $('.error-message').text('')
    $email.css('border', '')
    $password.css('border', '')
    $('#email + p').text('')
    $('#password + p').text('')
    $('form p.success-message').text('')
    // Gather data
    const [email, password] = [$email.val(), $password.val()]
    // Send request
    let res = await $.ajax({
      url: '/login',
      method: 'POST',
      headers: {
        Accept: "application/json",
      },
      data: {
        email,
        password
      }
    })
    // Parse to JSON
    try {
      res = JSON.parse(res)
    } catch (err) {
      alert('Error with this request. See console')
      console.error(res)
      return false
    }
    // If failed validation
    if (res.success === false) {
      // Highlight the errored field
      $('.error-message').text(res.message)
      return false
    }
    // When passed validation
    $('form p.success-message').text(res.message)
    $email.val('')
    $password.val('')
    setTimeout(() => {
      window.location.href = '/home'
    }, 2000)
  })
})