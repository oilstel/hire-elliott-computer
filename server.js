require('dotenv').config()
const express = require("express");
const app = express();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const bodyParser = require('body-parser');
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.post('/inquire', limiter, (req, res) => {
  console.log(req.body);

  var msg = {
    to: 'elliottcost@gmail.com',
    from: req.body.email,
    subject: `inquiry from ${req.body.email}`,
    html: `
<pre>
name: ${req.body.name}
email: ${req.body.email}

type: ${req.body.project_type}
description: ${req.body.project_desc}
domain + hosting: ${req.body.project_specs}
timeline: ${req.body.project_timeline}
</pre>
  `
  };

  sgMail
  .send(msg)
  .then(() => {
    console.log('mail sent');
    res.redirect('/sent.html');
  }, error => {
    console.log(error);
    res.redirect('/?error');

    if (error.response) {
        console.error(error.response.body)
    }
  });
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your server is listening on port " + listener.address().port);
});
