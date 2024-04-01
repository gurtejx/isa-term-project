export default function logged_in_check(req, res, next) {
  console.log(req.user)
  if (req.user) {
      next()
  } else {
      res.redirect("/signin")
  }
}