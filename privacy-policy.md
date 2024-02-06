## Trails MD BFF: Privacy policy

This is a middleware app used to provide API resources to the Trails MD mobile app that allows you to record trails and trips on their phone. This app provides the endpoints that allow users you sign up, log in, store recorded trails and reset their passwords. The middleware is hosted on gcloud and the source code is available on github

Privacy is a key priority to me and hence i have devoted to make all the processes in this app as secure as possible from using encryption of credentials during login to refreshing auth tokens on a regular basis.

This app does rely on external services such as google oauth2 in orders to make sure it always requires an access token with an expiry time so as to send emails for password reset.

All the data collected in this app is stored securely and can only be access by logged in users who have tokens. The data can be deleted at any moment using the following endpoints

`[DEL]: https://trailsmd.uc.r.appspot.com/tracks/:id`
`[DEL]: https://trailsmd.uc.r.appspot.com/delete-account`

If you find any security vulnerability that has been inadvertently caused by me, or have any question regarding how the app protectes your privacy, please send me an email or post a discussion on GitHub, and I will surely try to fix it/help you.

Regards,  
Lewis Muema.  
Nairobi, Kenya.  
mdkkcontact@gmail.com
