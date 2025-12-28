/**
 * Facebook SDK initialization - moved from inline to external file
 * Loads Facebook SDK asynchronously and initializes when ready
 */
window.fbAsyncInit = function () {
  if (typeof FB !== 'undefined') {
    FB.init({
      appId: '1508926600336855',
      cookie: true,
      xfbml: true,
      version: 'v24.0',
    })

    FB.AppEvents.logPageView()
  }
}
;(function (d, s, id) {
  var js,
    fjs = d.getElementsByTagName(s)[0]
  if (d.getElementById(id)) {
    return
  }
  js = d.createElement(s)
  js.id = id
  js.src = 'https://connect.facebook.net/en_US/sdk.js'
  js.src = 'https://connect.facebook.net/en_US/sdk.js'
  js.async = true
  js.crossOrigin = 'anonymous'
  js.crossOrigin = 'anonymous'
  if (fjs && fjs.parentNode) {
    fjs.parentNode.insertBefore(js, fjs)
  }
})(document, 'script', 'facebook-jssdk')
