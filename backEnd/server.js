var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

var messages = [
	{
		id: 0,
		text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam tincidunt pulvinar nunc non lacinia. Nam pharetra sodales enim, ac tempus lacus varius in. Duis blandit urna odio, tincidunt interdum neque facilisis eu.',
		owner: 'Tim'
	},
	{
		id: 1,
		text: 'Sed posuere scelerisque diam nec pretium. Suspendisse quis consequat leo, sed consequat quam. Aenean a nisl ex. Nullam varius orci at pharetra efficitur. Nullam pretium consectetur magna scelerisque pretium.',
		owner: 'Jane'
	}
];

var users = [{firstName: 'Ms Test', email: 'test@test.me', password: 'test', id: 0}];

app.use(bodyParser.json());

// cors
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	next();
})

var api = express.Router();
var auth = express.Router();

api.get('/messages', (req, res) => {
	res.json(messages);
})

api.get('/messages/:user', (req, res) => {
	var user = req.params.user;
	var result = messages.filter(message => message.owner == user);
	res.json(result);
})

api.post('/messages', (req, res) => {
    messages.push(req.body);
    res.json(req.body);
})

api.get('/users/me', checkAuthenticated, (req,res) => {
    res.json(users[req.user]);
})

api.post('/users/me', checkAuthenticated, (req,res) => {
    var user = users[req.user];

    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    console.log(res);
    res.json(user);
})

auth.post('/login', (req, res) => {

    var user = users.find(user => user.email == req.body.email);

    if (!user) {
        sendAuthError(res);
    }

    if (user.password == req.body.password) {
        sendToken(user, res);
    } else {
        sendAuthError(res);
    }

})

auth.post('/register', (req, res) => {

    var index = users.push(req.body) - 1;

    var user = users[index];
    user.id = index;

    sendToken(user, res);

})

function sendToken(user, res) {
    var token = jwt.sign(user.id, '123');
    res.json({ firstName: user.firstName, token });
}

function sendAuthError(res) {
    return res.json({ success: false, message: 'email or password incorrect' });
}

// checkAuthentıcated middleware that 
// is why has a next parameter
function checkAuthenticated(req, res, next) {
	if(!req.header('authorization')) {
		return res.status(401).send({ message: 'Unauthorized requested. Missing authentication header' });
	}

	var token = req.header('authorization').split(' ')[1];
	var payload = jwt.decode(token, 123);

	if(!payload) {
		return res.status(401).send({ message: 'Unauthorized requested. Authentication header invalid' });
	}

	req.user = payload;

	next();

}

app.use('/api', api);
app.use('/auth', auth);

app.listen(63145);