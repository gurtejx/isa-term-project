export default function logged_in_check(req, res, next) {
  console.log(req.session.authenticated)
  if (req.user) {
      next()
  } else {
      res.redirect("/signin")
  }
}