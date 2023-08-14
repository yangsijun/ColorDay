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
                    email: 'logintestuser@example.com',
                    password: 'logintestpw'
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

    describe('GET /api/auth/tokenValidation', () => {
        it('should return 200 for valid token', async () => {
            const user = {
                _id: 'abc123',
                username: 'logintestuser',
                email: 'logintestuser@example.com',
            };
            const token = jwt.sign({ id: user._id }, SECRET_KEY);

            const res = await request(app)
                .get('/api/auth/tokenValidation')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message').to.equal('Token verification successful');
        });
        
        it('should return 401 for missing token', async () => {
            const res = await request(app).get('/api/auth/tokenValidation');

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('message').to.equal('No token provided');
        });

        it('should return 403 for invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/tokenValidation')
                .set('Authorization', 'Bearer invalidtoken');

            expect(res.status).to.equal(403);
            expect(res.body).to.have.property('message').to.equal('Failed to authenticate token');
        });
    })
});