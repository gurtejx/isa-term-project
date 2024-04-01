export default function logged_in_check(req, res, next) {
  console.log(req.session.userID)
  if (req.user) {
      next()
  } else {
      res.redirect("/signin")
  }
}