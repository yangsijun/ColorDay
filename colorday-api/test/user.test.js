const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../index');
const testDb = require('./db');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const jwt_config = require('../config/jwtSecretKey.json');
const { getUsers } = require('../controllers/adminController');
const { createUser } = require('../controllers/userController');
const SECRET_KEY = jwt_config.SECRET_KEY;

describe('Authentication', () => {

    before(async () => {
        await testDb.connectTestDb();
    });

    after(async () => {
        await testDb.clearData();
        await testDb.disconnect();
        // process.exit();
    });

    beforeEach(async () => {
        await testDb.clearData();
    });

    describe('GET /api/user', () => {
        it('should get a user', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const token = jwt.sign(
                {
                    id: user._id,
                    passwordChangedAt: user.passwordChangedAt
                },
                SECRET_KEY
            );
            
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${token}`);
            
            const expectedUser = {
                username: 'testuser',
                email: 'testuser@example.com'
            };
            
            const receivedUser = {
                username: res.body.username,
                email: res.body.email
            };

            expect(res.status).to.equal(200);
            expect(receivedUser).to.deep.equal(expectedUser);
        });
    });

    describe('POST /api/users', () => {
        it('should create a new user', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const token = jwt.sign(
                {
                    id: user._id,
                    passwordChangedAt: user.passwordChangedAt
                },
                SECRET_KEY
            );

            const res = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    username: 'testnewuser',
                    email: 'testnewuser@example.com',
                    password: 'testpassword'
                });

            expect(res.status).to.equal(201);
            expect(res.body.user).to.have.property('_id');
        });
    });

    describe('PUT /api/users', () => {
        it('should update user', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const token = jwt.sign(
                {
                    id: user._id,
                    passwordChangedAt: user.passwordChangedAt
                },
                SECRET_KEY
            );

            const res = await request(app)
                .put('/api/users')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    username: 'updateduser',
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('username').to.equal('updateduser');
        });
    });

    describe('DELETE /api/users', () => {
        it('should delete a user by id', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            
            const token = jwt.sign(
                {
                    id: user._id,
                    passwordChangedAt: user.passwordChangedAt
                },
                SECRET_KEY
            );

            const userId = user._id;
            const res = await request(app)
                .delete('/api/users')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message').to.equal('User deleted');
        
            const deletedUser = await User.findById(userId);
            expect(deletedUser).to.be.null;
        });
    });
});