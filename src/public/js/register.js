$(document).ready(function () {
  $('#register-submit').on('click', async function () {
    const $username = $('#username')
    const $email = $('#email')
    const $password = $('#password')
    // Clean up the form
    $username.css('border', '')
    $username.css('border', '')
    $password.css('border', '')
    $('#username + p').text('')
    $('#email + p').text('')
    $('#password + p').text('')
    // Gather data
    const [username, email, password] = [$username.val(), $email.val(), $password.val()]
    // Send request
    let res = await $.ajax({
      url: '/register',
      method: 'POST',
      headers: {
        Accept: "application/json",
      },
      data: {
        username,
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
    }
    // If failed validation
    if (res.success === false) {
      // Highlight the errored field
      $('#' + res.data).css('border', '1px solid red')
      $('#' + res.data + ' + p').text(res.message)
    }
    // When passed validation
    window.location.href = '/login'
  })
})