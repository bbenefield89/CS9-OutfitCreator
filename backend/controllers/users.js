const User = require('../models/userModel');
const { makeToken } = require('../config/passport-setup');
const { generateSignupKey, sendEmail } = require('../config/mailer');
const { ROOT_URL } = require('../config/root-urls');

// Register a new user
exports.signup = (req, res) => {
	const { username, password, email } = req.body;

	User.findOne({ 'local.email': email }).then((existingUser) => {
		// If user with that email exists
		if (existingUser) {
			// if user already signed up locally
			if (existingUser.local.password) {
				return res.status(409).json({ message: 'problem signing up' });
			} else {
				// else user signed up using social auth, link accounts
				existingUser
					.newPassword(password)
					.then((newPassword) => {
						const target = { 'local.email': email };
						const update = {
							local: { email, username, password: newPassword }
						};
						const options = { new: true, runValidators: true };
						// Update user and generate JWT. User is already verified by social-auth
						User.findOneAndUpdate(target, update, options)
							.exec()
							.then((user) => {
								const token = makeToken(user);
								res.status(201).json({ token });
							})
							.catch((err) => {
								return next(err);
							});
					})
					.catch((err) => err);
			}
		} else {
			const key = generateSignupKey();
			const user = new User({
				method: 'local',
				local: {
					username,
					password,
					email
				},
				signupKey: key
			});
			user
				.save()
				.then((user) => {
					// Send verification email
					const subject = 'Closet Roulette | Email Verification Required';
					const url = `${ROOT_URL.WEB}/verify/${key.key}`;
					const html = `Hi ${user.local.username},
                <br/>
                Thank you for registering for Closet Roulette!
                <br/><br/>
                Please verify your email by clicking this link: <a href="${url}">${url}</a>
                <br/>
                Have a pleasant day.`;
					const text = `Please click here to verify your email: ${url}`;
					sendEmail(email, subject, html, text).then().catch((err) => next(err));

					const token = makeToken(user);
					res.status(201).json({ token });
				})
				.catch((err) => {
					res.status(500).json(err);
				});
		}
	});
};

// Login
exports.login = (req, res) => {
	if(!req.user) {
		return res.status(422);
	}
	res.status(200).json({ token: makeToken(req.user), user: req.user });
};

exports.verifyEmail = (req, res) => {
	const key = req.body.key;
	const target = {
		'signupKey.key': key,
		'signupKey.exp': { $gt: Date.now() }
	};
	const updates = {
		verified: true
	};
	const options = { new: true };

	User.findOneAndUpdate(target, updates, options)
		.exec()
		.then((user) => {
			if (!user) {
				return res
					.status(400)
					.json({ code: 'EXPTOKEN', message: 'Sorry, your token has expired, please try again.' });
			} else {
				const token = makeToken(user);
				res.status(201).json({ token });
			}
		})
		.catch((err) => {
			return res.status(400).json({ message: err });
		});
};

exports.sendVerifyEmail = (req, res, next) => {
	const { email } = req.body;
	const key = generateSignupKey();

	const target = { 'local.email': email };
	const updates = {
		signupKey: key
	};
	const options = { new: true };

	User.findOneAndUpdate(target, updates, options)
		.exec()
		.then((user) => {
			if (user.verified) {
				return res.status(400).json({ message: 'Something went wrong.' });
			} else if (!user) {
				return res.status(400).json({
					message: 'Something went wrong'
				});
			} else {
				// Send verification email
				const subject = 'Closet Roulette | Email Verification Required';
				const url = `${ROOT_URL.WEB}/verify/${key.key}`;
				const html = `Hi ${user.local.username},
                <br/>
                Thank you for registering for Closet Roulette!
                <br/><br/>
                Please verify your email by clicking this link: <a href="${url}">${url}</a>
                <br/>
                Have a pleasant day.`;
				const text = `Please click here to verify your email: ${url}`;
				sendEmail(email, subject, html, text)
					.then(() => {
						// Respond with success message if email sent sucessfully
						res.status(201).json({ message: `Verification email sent` });
					})
					.catch((err) => {
						return next(err);
					});
			}
		})
		.catch((err) => {
			return res.status(400).json({ err });
		});
};
