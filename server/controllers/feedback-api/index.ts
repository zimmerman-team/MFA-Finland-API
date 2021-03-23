const nodemailer = require("nodemailer");

export async function sendMail(req: any, res: any) {
  //Retrieve information from request
  const name = req.body.name;
  const email = req.body.email;
  const feedback = req.body.feedback;
  const organisation = req.body.organisation ? req.body.organisation : null;
  const other = req.body.other ? req.body.other : null;

  const mail = {
    from: "example@example.com",
    to: "Tilastot.UM@formin.fi",
    subject: "Feedback message from MFA tool",
    text: `
        From: ${email} \n 
        ${other && `Extra contact information: ${other} \n`}
        ${organisation && `Organisation: ${organisation} \n \n`}
        Message: ${feedback}`
  };

  //Validate infomration
  if (feedback && name && email) {
    //TODO: SWAP WITH CORRECT SMTP HOST ========================= {
    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email", //replace with your email provider
      port: 587,
      auth: {
        // user: process.env.MAILER_EMAIL,
        // pass: process.env.MAILER_PASSWORD,
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    //TODO: }

    transporter.verify(function(error: any, success: any) {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });

    transporter.sendMail(mail, (err: any, data: any) => {
      if (err) {
        res.json({
          status: "fail"
        });
      } else {
        res.json({
          status: "success"
        });
      }
    });
  } else {
    // Send back response with failed status
    res.json({
      status: "fail",
      message: "insufficient parameters"
    });
  }
}
