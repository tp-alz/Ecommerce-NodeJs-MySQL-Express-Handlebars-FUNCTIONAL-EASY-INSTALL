module.exports = (app) => {
  app.get('/sign-in', (req, res) => {
    let success; const warning = app.helpers.msg(req);

    if (req.session['user'] || req.session['user'] != null) {
      req.session['warning'] = 'You are not able to access this area!';
      return res.redirect('/');
    }

    res.render('sign/in', {
      title: 'Sign In',
      success, warning,
      csrfToken: req.csrfToken(),
    });
  });

  app.post('/sign-in', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    req.checkBody('email', 'Email is not Valid!').notEmpty().isEmail();
    req.checkBody('password', 'Password must be at least 4 digits!')
        .notEmpty().isLength({min: 4});
    const errorsInValidation = req.validationErrors();
    if (errorsInValidation) {
      req.session['warning'] = errorsInValidation[0].msg;
      res.redirect('/sign-in');
    }

    const connection = app.dao.connectionFactory();
    const userDao = new app.dao.userDAO(connection);


    var isAdmin ;

    //get admin state to show admin panel if admin
    userDao.isAdmin(email)
        .then((result) => {
          console.log("test RESULT : ", result);
          isAdmin = result;
        })
        .catch((err) => {
          console.log("Admin state error");
        });

    var username;

    //get username for frontend
    userDao.getUsername(email)
        .then((result) => {
          console.log("test RESULT : ", result);
          username = result;
        })
        .catch((err) => {
          console.log("Username get error");
        });


    userDao.login(email, password)
        .then((result) => {
          req.session['success'] = result;
          // Create Session
          req.session['user'] = {
            username: username,
            email: email,
            admin: isAdmin,
            cart: null,
          };

          res.redirect('/');
        })
        .catch((err) => {
          req.session['warning'] = err;
          res.redirect('/sign-in');
        });


  });
};
