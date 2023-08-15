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
        process.exit();
    });
    
    let createdUserId;

    describe('GET /api/users', () => {
        it('should get all users', async () => {
        });
    });

    describe('POST /api/users', () => {
        it('should create a new user', async () => {
            const res = await request(app)
                .post('/api/users')
                .send({
                    username: 'testnewuser',
                    email: 'testnewuser@example.com',
                    password: 'testpassword'
                });

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('_id');
            createdUserId = res.body._id;
        });
    });

    describe('GET /api/users/:id', () => {
        it('should get user by ID', async () => {
            const res = await request(app).get(`/api/users/${createdUserId}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('_id').to.equal(createdUserId);
        });
    });

    describe('PUT /api/users/:id', () => {
        it('should update user', async () => {
            const res = await request(app)
                .put(`/api/users/${createdUserId}`)
                .send({
                    username: 'updateduser',
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('username').to.equal('updateduser');
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('should delete a user by id', async () => {
            const res = await request(app)
                .delete(`/api/users/${createdUserId}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message').to.equal('User deleted');
        
            const deletedUser = await User.findById(createdUserId);
            expect(deletedUser).to.be.null;
        });
    });
});