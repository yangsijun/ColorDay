const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../index');
const testDb = require('./db');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const jwt_config = require('../config/jwtSecretKey.json');
const SECRET_KEY = jwt_config.SECRET_KEY;

describe('Authentication', () => {

    before(async () => {
        await testDb.connectTestDb();
    });

    after(async () => {
        await testDb.clearData();
        await testDb.disconnect();
    });

    beforeEach(async () => {
        await testDb.clearData();
    });

    describe('POST /api/auth/login', () => {
        it('should log in an existing user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'testuser@example.com',
                    password: 'testpassword'
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message').to.equal('Login successful');
            expect(res.body).to.have.property('token');

            const decodedToken = jwt.verify(res.body.token, SECRET_KEY);
            expect(decodedToken).to.have.property('id');
            expect(decodedToken.id).to.be.a('string');
        });

        it('should reject invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid@example.com',
                    password: 'invalidpassword'
                });

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('message').to.equal('Invalid credentials');
            expect(res.body).to.not.have.property('token');
        });
    });

    describe('POST /api/auth/change-password', () => {
        it('should change password of a user', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const token = jwt.sign(
                {
                    id: user._id,
                    passwordChangedAt: user.passwordChangedAt
                },
                SECRET_KEY
            );

            const res = await request(app)
                .post('/api/auth/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: 'testpassword',
                    newPassword: 'newtestpassword'
                });
            
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message').to.equal('Password changed successfully');
        });
    });

    describe('POST /api/auth/authenticate', () => {
        it('should authenticate a user', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const token = jwt.sign(
                {
                    id: user._id,
                    passwordChangedAt: user.passwordChangedAt
                }
                , SECRET_KEY
            );

            const res = await request(app)
                .get('/api/auth/authenticate')
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message').to.equal('Authenticated');
        });
    });
});