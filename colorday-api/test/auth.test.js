const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../index');
const testDb = require('./db');
const User = require('../models/user');

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
        });
    });
});